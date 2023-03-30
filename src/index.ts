import ts from 'typescript';

import {
  AccessTreeNode,
  TransformerConfig,
  TransformerOptions,
} from './transformer.config';

type Visitor = (node: ts.Node) => ts.VisitResult<ts.Node>;

const IGNORE_FILE_PATTERN = '@ts-transformer-log-position disable';
const IGNORE_LINE_PATTERN = '@ts-transformer-log-position ignore';
const UNIQUE_IDENTIFIER_PREFIX = '__ttlp__v_';

/**
 * Checks whether the current file should be ignored by
 * the transformer
 *
 * @param sourceFile  The source file
 * @returns           True if the file should be ignored
 */
const isFileIgnored = (sourceFile: ts.SourceFile): boolean => {
  const fileContent = sourceFile.getFullText();
  const lines = fileContent.split('\n');

  let isCommentBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const trimmedLine = lines[i].trim();
    if (trimmedLine.includes(IGNORE_FILE_PATTERN)) return true;

    // Start of multiline comment
    if (!isCommentBlock && trimmedLine.startsWith('/*')) {
      isCommentBlock = true;
      continue;
    }

    // End of multiline comment
    if (isCommentBlock && trimmedLine.endsWith('*/')) {
      isCommentBlock = false;
      continue;
    }

    if (isCommentBlock) continue;
    if (trimmedLine.length === 0) continue;
    if (!trimmedLine.startsWith('//')) return false;
  }

  return false;
};

/**
 * Scans the source file for ignore comments
 *
 * @param sourceFile  The source file
 * @returns           The line numbers that should be ignored
 */
const scanForIgnoredLines = (sourceFile: ts.SourceFile): number[] => {
  return sourceFile
    .getFullText()
    .split('\n')
    .map((v, idx) => (v.includes(IGNORE_LINE_PATTERN) ? idx + 1 : 0))
    .filter((idx) => idx > 0);
};

/**
 * Formats the prefix
 *
 * @param absoluteFilePath  The file path
 * @param pos               The position of the log expression
 * @param config            The transformer config
 * @param addSpace          Whether to add a trailing whitespace character
 * @returns                 The formatted prefix
 */
const formatPrefix = (
  absoluteFilePath: string,
  pos: ts.LineAndCharacter,
  config: TransformerConfig,
  addSpace?: boolean,
): string => {
  const fileName = absoluteFilePath.replace(/^.*[\\/]/, '');

  const projectFilePath =
    config.projectRoot && absoluteFilePath.startsWith(config.projectRoot)
      ? absoluteFilePath.replace(config.projectRoot, '')
      : absoluteFilePath;

  const lineNumber = config.incrementLineNumber ? pos.line + 1 : pos.line;
  const charNumber = config.incrementCharNumber
    ? pos.character + 1
    : pos.character;

  const interpolated = config.templateString
    .replace('{absoluteFilePath}', absoluteFilePath)
    .replace('{projectFilePath}', projectFilePath.replace(/^\//, ''))
    .replace('{fileName}', fileName)
    .replace('{line}', lineNumber.toString())
    .replace('{character}', charNumber.toString());

  return addSpace ? `${interpolated} ` : interpolated;
};

/**
 * Recursively checks whether the specified expression is one of
 * the specified/configured log expressions
 *
 * @param exp   The current expression
 * @param node  The current node
 * @returns     True if the current expression is a leaf node
 */
const matchesAccessTree = (
  exp: ts.PropertyAccessExpression | ts.CallExpression,
  node: AccessTreeNode | undefined,
): boolean => {
  if (typeof node === 'undefined') return false;

  if (ts.isIdentifier(exp.expression)) {
    const childNode = node.children?.[exp.expression.escapedText.toString()];
    return childNode?.leaf === true;
  }

  if (isThisExpression(exp.expression))
    return node.children?.['this']?.leaf === true;

  if (!ts.isPropertyAccessExpression(exp.expression)) return false;
  const subTree = node.children?.[exp.expression.name.escapedText.toString()];
  if (typeof subTree === 'undefined') return false;

  return matchesAccessTree(exp.expression, subTree);
};

/**
 * Checks whether the specified node is a call to JSON.stringify
 *
 * @param node  The node
 * @returns     True if the node is a JSON.stringify call
 */
const isJsonStringifyCall = (node: ts.Node): boolean => {
  if (!ts.isCallExpression(node)) return false;

  const sub = node.expression;
  if (!ts.isPropertyAccessExpression(sub)) return false;
  return sub.getFullText().trim() === 'JSON.stringify';
};

/**
 * Checks whether the specified node is a log expression
 *
 * @param node    The target node
 * @param config  The transformer config
 * @returns       True if the node is a log expression
 */
const isLogExpression = (
  node:
    | ts.Node
    | ts.CallExpression
    | ts.NewExpression
    | ts.ArrayLiteralExpression,
  config: TransformerConfig,
): node is ts.CallExpression => {
  if (!config.accessTree) return false;
  if (!ts.isCallExpression(node)) return false;
  return matchesAccessTree(node, config.accessTree);
};

/**
 * Maps the args of a spread element with with the specified wrapper
 *
 * Example:
 * ```js
 * // in
 * ...foobar
 *
 * // out
 * ...foobar(<identifier> => <wrapper>)
 * ```
 *
 * @param arg         The spread element
 * @param identifier  The map function parameter identifier
 * @param body        The map function body
 * @returns           The mapped spread element
 */
const mapSpreadElement = (
  arg: ts.SpreadElement,
  identifier: ts.Identifier,
  body: ts.Expression,
): ts.SpreadElement => {
  return ts.factory.createSpreadElement(
    ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(arg.expression, 'map'),
      [],
      [
        ts.factory.createArrowFunction(
          [],
          [],
          [ts.factory.createParameterDeclaration([], undefined, identifier)],
          undefined,
          undefined,
          body,
        ),
      ],
    ),
  );
};

/**
 * Determines whether the specified expression should be wrapped in
 * a JSON stringify call
 *
 * @param exp     The expression
 * @param config  The transformer config
 * @returns       True if the expression should be wrapped
 */
const shouldWrapInJsonStringify = (
  exp: ts.Expression,
  config: TransformerConfig,
): boolean => {
  if (!config.argsToJson) return false;
  if (isJsonStringifyCall(exp)) return false;
  if (!ts.isStringLiteral(exp) && !ts.isTemplateLiteral(exp)) return true;
  return config.stringArgsToJson;
};

/**
 * Wraps the specified expression into a JSON.stringify() call
 *
 * @param exp  The expression
 * @returns    The wrapped expression
 */
const wrapInJsonStringify = (exp: ts.Expression): ts.Expression => {
  // ...x => JSON.stringify([...x])
  if (ts.isSpreadElement(exp))
    return wrapInJsonStringify(ts.factory.createArrayLiteralExpression([exp]));

  // x => JSON.stringify(x)
  return ts.factory.createCallExpression(
    ts.factory.createPropertyAccessExpression(
      ts.factory.createIdentifier('JSON'),
      ts.factory.createIdentifier('stringify'),
    ),
    [],
    [exp],
  );
};

/**
 * Processes the log arguments
 *
 * @param args                     The log arguments
 * @param config                   The transformer config
 * @param uniqueIdentifierCounter  The counter for unique identifiers
 * @returns                        The updated argument list and the new counter
 */
const processLogArguments = (
  args: ts.NodeArray<ts.Expression>,
  config: TransformerConfig,
  uniqueIdentifierCounter: number,
): [ts.NodeArray<ts.Expression> | ts.Expression[], number] => {
  const newArgs = args.map((a) =>
    ts.isSpreadElement(a)
      ? shouldWrapInJsonStringify(a, config)
        ? mapSpreadElement(
            a,
            ts.factory.createIdentifier(
              `${UNIQUE_IDENTIFIER_PREFIX}${++uniqueIdentifierCounter}`,
            ),
            wrapInJsonStringify(
              ts.factory.createIdentifier(
                `${UNIQUE_IDENTIFIER_PREFIX}${uniqueIdentifierCounter}`,
              ),
            ),
          )
        : a
      : shouldWrapInJsonStringify(a, config)
      ? wrapInJsonStringify(a)
      : a,
  );

  return [newArgs, uniqueIdentifierCounter];
};

/**
 * Injects the log position into a log expression
 *
 * @param exp         The log expression
 * @param sourceFile  The source file
 * @param visitor     The visitor
 * @param context     The transformer context
 * @param position    The position of the log expression
 * @param config      The transformer config
 * @returns           The transformed expression
 */
const injectLogPosition = (
  exp: ts.Expression,
  sourceFile: ts.SourceFile,
  visitor: Visitor,
  context: ts.TransformationContext,
  position: ts.LineAndCharacter,
  config: TransformerConfig,
): ts.Expression => {
  const visited = ts.visitEachChild(exp, visitor, context);

  return ts.factory.createBinaryExpression(
    ts.factory.createStringLiteral(
      formatPrefix(sourceFile.fileName, position, config, true),
    ),
    ts.SyntaxKind.PlusToken,
    shouldWrapInJsonStringify(visited, config)
      ? wrapInJsonStringify(visited)
      : ts.isTemplateLiteral(visited) ||
        ts.isStringLiteral(visited) ||
        isJsonStringifyCall(visited)
      ? visited
      : ts.factory.createTemplateExpression(ts.factory.createTemplateHead(''), [
          ts.factory.createTemplateSpan(
            visited,
            ts.factory.createTemplateTail(''),
          ),
        ]),
  );
};

/**
 * Checks whether the specified node is a TrueLiteral
 *
 * @Note: Currently not supported natively by TypeScript
 *
 * @param node  The node
 * @returns     True if the node is a TrueLiteral
 */
const isTrueLiteral = (node: ts.Node): node is ts.TrueLiteral => {
  return node.kind === ts.SyntaxKind.TrueKeyword;
};

/**
 * Checks whether the specified node is a FalseLiteral
 *
 * @Note: Currently not supported natively by TypeScript
 *
 * @param node  The node
 * @returns     True if the node is a FalseLiteral
 */
const isFalseLiteral = (node: ts.Node): node is ts.TrueLiteral => {
  return node.kind === ts.SyntaxKind.FalseKeyword;
};

/**
 * Checks whether the specified node is a NullLiteral
 *
 * @Note: Currently not supported natively by TypeScript
 *
 * @param node  The node
 * @returns     True if the node is a NullLiteral
 */
const isNullLiteral = (node: ts.Node): node is ts.NullLiteral => {
  return node.kind === ts.SyntaxKind.NullKeyword;
};

/**
 * Checks whether the specified node is a ThisExpression
 *
 * @Note: Currently not supported natively by TypeScript
 *
 * @param node  The node
 * @returns     True if the node is a ThisExpression
 */
const isThisExpression = (node: ts.Node): node is ts.ThisExpression => {
  return node.kind === ts.SyntaxKind.ThisKeyword;
};

/**
 * Checks whether the specified node is a TypeOfExpression
 *
 * @Note: Currently not supported natively by TypeScript
 *
 * @param node  The node
 * @returns     True if the node is a TypeOfExpression
 */
const isTypeOfExpression = (node: ts.Node): node is ts.TypeOfExpression => {
  return node.kind === ts.SyntaxKind.TypeOfExpression;
};

/**
 * The transformer
 *
 * @param context  The transformation context
 * @param config   The transformer config
 * @returns        The transformed source file
 */
const transformer = (
  context: ts.TransformationContext,
  config: TransformerConfig,
): ts.Transformer<ts.SourceFile> => {
  let uniqueIdentifierCounter = 0;

  return (sourceFile) => {
    if (isFileIgnored(sourceFile)) {
      const visitor: Visitor = (n) => ts.visitEachChild(n, visitor, context);
      return ts.visitNode(sourceFile, visitor);
    }

    const ignoredLines = scanForIgnoredLines(sourceFile);

    const visitor: Visitor = (node) => {
      const nodePosition = sourceFile.getLineAndCharacterOfPosition(
        node.getStart(),
      );

      // Node itself is a log expression, only patches if one of
      // the following conditions is true:
      //
      // [1] The line is not ignored
      // [2] There are no arguments
      // [3] The prefix and args should be split
      //
      if (isLogExpression(node, config)) {
        // [1] Ignored line
        if (ignoredLines.includes(nodePosition.line))
          return ts.visitEachChild(node, visitor, context);

        const prefix = ts.factory.createStringLiteral(
          formatPrefix(sourceFile.fileName, nodePosition, config).trim(),
        );

        // [2] No arguments => Patch directly as first and only argument
        if (node.arguments.length === 0)
          return ts.factory.updateCallExpression(
            node,
            node.expression,
            undefined,
            [prefix],
          );

        // [3] Split the args if necessary, but always move spreaded
        //     arguments to the second position
        if (config.split || ts.isSpreadElement(node.arguments[0])) {
          const visited = ts.visitEachChild(node, visitor, context);

          const [processedArgs, updatedCounter] = processLogArguments(
            visited.arguments,
            config,
            uniqueIdentifierCounter,
          );

          uniqueIdentifierCounter = updatedCounter;

          return ts.factory.updateCallExpression(
            node,
            visited.expression,
            undefined,
            [prefix, ...processedArgs],
          );
        }
      }

      // If config.split is true, but we reached this point
      // it is not a log expression (see [3])
      if (config.split) return ts.visitEachChild(node, visitor, context);

      // List of valid argument expressions
      if (
        ts.isArrayLiteralExpression(node) ||
        ts.isArrowFunction(node) ||
        ts.isAsExpression(node) ||
        ts.isBinaryExpression(node) ||
        ts.isCallExpression(node) ||
        ts.isConditionalExpression(node) ||
        ts.isElementAccessExpression(node) ||
        ts.isFunctionExpression(node) ||
        ts.isIdentifier(node) ||
        ts.isLiteralExpression(node) ||
        ts.isNewExpression(node) ||
        ts.isObjectLiteralExpression(node) ||
        ts.isParenthesizedExpression(node) ||
        ts.isPostfixUnaryExpression(node) ||
        ts.isPropertyAccessExpression(node) ||
        ts.isSyntheticExpression(node) ||
        ts.isTemplateExpression(node) ||
        isFalseLiteral(node) ||
        isNullLiteral(node) ||
        isThisExpression(node) ||
        isTrueLiteral(node) ||
        isTypeOfExpression(node)
      ) {
        // Parent not a log expression => continue
        if (!isLogExpression(node.parent, config))
          return ts.visitEachChild(node, visitor, context);

        // Start position of the log expression
        const logPosition = sourceFile.getLineAndCharacterOfPosition(
          node.parent.getStart(),
        );

        // Ignored line => Skip
        if (ignoredLines.includes(logPosition.line))
          return ts.visitEachChild(node, visitor, context);

        // Different position => different node
        const firstArg = node.parent.arguments[0];
        if (!firstArg || firstArg.pos !== node.pos) {
          // Another argument of the log expression
          // => wrap if necessary
          if (
            node.parent.arguments.some((a) => a.pos === node.pos) &&
            shouldWrapInJsonStringify(node, config)
          )
            return wrapInJsonStringify(node);

          return ts.visitEachChild(node, visitor, context);
        }

        // Inject the log position
        return injectLogPosition(
          node,
          sourceFile,
          visitor,
          context,
          logPosition,
          config,
        );
      }

      return ts.visitEachChild(node, visitor, context);
    };

    return ts.visitNode(sourceFile, visitor);
  };
};

/**
 * Initializes a new transformer
 *
 * @param program  The program
 * @param config   The trasformer configuration
 * @returns        The transformer
 */
const transformerFactory = (
  program: ts.Program,
  config?: Partial<TransformerOptions>,
): ts.TransformerFactory<ts.SourceFile> => {
  const transformerConfig = new TransformerConfig(program, config);
  return (ctx) => transformer(ctx, transformerConfig);
};

export default transformerFactory;

export { TransformerOptions };
