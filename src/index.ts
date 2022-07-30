import ts from 'typescript';

import {
  AccessTreeNode,
  TransformerConfig,
  TransformerOptions,
} from './transformer.config';

type Visitor = (node: ts.Node) => ts.VisitResult<ts.Node>;

const IGNORE_FILE_PATTERN = '@ts-transformer-log-position disable';
const IGNORE_LINE_PATTERN = '@ts-transformer-log-position ignore';

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
 * Injects the log position into a log expression
 *
 * @param arg         The log expression
 * @param sourceFile  The source file
 * @param visitor     The visitor
 * @param context     The transformer context
 * @param position    The position of the log expression
 * @param config      The transformer config
 * @returns           The transformed expression
 */
const injectLogPosition = (
  arg: ts.Expression,
  sourceFile: ts.SourceFile,
  visitor: Visitor,
  context: ts.TransformationContext,
  position: ts.LineAndCharacter,
  config: TransformerConfig,
): ts.Expression => {
  const visited = ts.visitEachChild(arg, visitor, context);

  return ts.factory.createBinaryExpression(
    ts.factory.createStringLiteral(
      formatPrefix(sourceFile.fileName, position, config, true),
    ),
    ts.SyntaxKind.PlusToken,
    ts.isTemplateLiteral(visited) || ts.isStringLiteral(visited)
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

      if (isLogExpression(node, config)) {
        if (ignoredLines.includes(nodePosition.line))
          return ts.visitEachChild(node, visitor, context);

        const prefix = ts.factory.createStringLiteral(
          formatPrefix(sourceFile.fileName, nodePosition, config).trim(),
        );

        // No arguments
        if (node.arguments.length === 0)
          return ts.factory.updateCallExpression(
            node,
            node.expression,
            undefined,
            [prefix],
          );

        // Move spreaded arguments to the second position
        if (config.split || ts.isSpreadElement(node.arguments[0])) {
          const visited = ts.visitEachChild(node, visitor, context);

          return ts.factory.updateCallExpression(
            node,
            visited.expression,
            undefined,
            [prefix, ...visited.arguments],
          );
        }
      }

      if (config.split) return ts.visitEachChild(node, visitor, context);

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
        if (!isLogExpression(node.parent, config))
          return ts.visitEachChild(node, visitor, context);

        const logPosition = sourceFile.getLineAndCharacterOfPosition(
          node.parent.getStart(),
        );

        if (ignoredLines.includes(logPosition.line))
          return ts.visitEachChild(node, visitor, context);

        // Different position => different node
        const firstArgument = node.parent.arguments[0];
        if (!firstArgument || firstArgument.pos !== node.pos)
          return ts.visitEachChild(node, visitor, context);

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
