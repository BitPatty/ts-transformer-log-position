import ts from 'typescript';

type Visitor = (node: ts.Node) => ts.VisitResult<ts.Node>;

export type TransformerConfig = {
  expression: string;
  functionNames: string[];
  templateString: string;
  split: boolean;
  projectRoot: string | undefined;
  incrementLineNumber: boolean;
};

const defaultTransformerConfig: TransformerConfig = {
  expression: 'console',
  functionNames: ['log', 'warn', 'trace', 'error', 'debug'],
  templateString: '[{fileName} | L{line}C{character}] ',
  split: true,
  projectRoot: undefined,
  incrementLineNumber: false,
};

let transformerConfig: TransformerConfig = defaultTransformerConfig;

/**
 * Formats the prefix
 *
 * @param absoluteFilePath  The file path
 * @param pos               The position of the log expression
 * @returns                 The formatted prefix
 */
const formatPrefix = (
  absoluteFilePath: string,
  pos: ts.LineAndCharacter,
): string => {
  const projectFilePath =
    transformerConfig.projectRoot &&
    absoluteFilePath.startsWith(transformerConfig.projectRoot)
      ? absoluteFilePath.replace(transformerConfig.projectRoot, '')
      : absoluteFilePath;

  const fileName = absoluteFilePath.replace(/^.*[\\/]/, '');
  const lineNumber = transformerConfig.incrementLineNumber
    ? pos.line + 1
    : pos.line;

  return transformerConfig.templateString
    .replace('{absoluteFilePath}', absoluteFilePath)
    .replace('{projectFilePath}', projectFilePath)
    .replace('{fileName}', fileName)
    .replace('{line}', lineNumber.toString())
    .replace('{character}', pos.character.toString());
};

/**
 * Checks whether the specified node is a log expression
 *
 * @param node  The target node
 * @returns     True if the node is a log expression
 */
const isLogExpression = (
  node:
    | ts.Node
    | ts.CallExpression
    | ts.NewExpression
    | ts.ArrayLiteralExpression,
): node is ts.CallExpression => {
  if (!ts.isCallExpression(node)) return false;
  const exp = node.expression;
  if (!ts.isPropertyAccessExpression(exp)) return false;
  if (!ts.isIdentifier(exp.expression)) return false;
  if (!ts.isIdentifier(exp.name)) return false;
  if (exp.expression.escapedText !== transformerConfig.expression) return false;
  if (
    !transformerConfig.functionNames.includes(exp.name.escapedText.toString())
  )
    return false;

  return true;
};

/**
 * Injects the line number into a log expression
 *
 * @param arg         The log expression
 * @param sourceFile  The source file
 * @param visitor     The visitor
 * @param context     The transformer context
 * @returns           The transformed expression
 */
const injectLineNumber = (
  arg: ts.Expression,
  sourceFile: ts.SourceFile,
  visitor: Visitor,
  context: ts.TransformationContext,
): ts.Expression => {
  const position = sourceFile.getLineAndCharacterOfPosition(
    arg.parent.getStart(),
  );
  const visited = ts.visitEachChild(arg, visitor, context);

  return ts.factory.createBinaryExpression(
    ts.factory.createStringLiteral(formatPrefix(sourceFile.fileName, position)),
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
 * @returns        The transformed source file
 */
const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
  return (sourceFile) => {
    const visitor: Visitor = (node) => {
      if (isLogExpression(node)) {
        const prefix = ts.factory.createStringLiteral(
          formatPrefix(
            sourceFile.fileName,
            sourceFile.getLineAndCharacterOfPosition(node.getStart()),
          ).trim(),
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
        if (transformerConfig.split || ts.isSpreadElement(node.arguments[0])) {
          const visited = ts.visitEachChild(node, visitor, context);

          return ts.factory.updateCallExpression(
            node,
            visited.expression,
            undefined,
            [prefix, ...visited.arguments],
          );
        }
      }

      if (transformerConfig.split)
        return ts.visitEachChild(node, visitor, context);

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
        if (!isLogExpression(node.parent))
          return ts.visitEachChild(node, visitor, context);

        const firstArgument = node.parent.arguments[0];

        if (!firstArgument || firstArgument.pos !== node.pos)
          return ts.visitEachChild(node, visitor, context);

        return injectLineNumber(node, sourceFile, visitor, context);
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
  config?: Partial<TransformerConfig>,
): ts.TransformerFactory<ts.SourceFile> => {
  transformerConfig = {
    ...defaultTransformerConfig,
    ...config,
    projectRoot: config?.projectRoot ?? program.getCurrentDirectory(),
  };

  return transformer;
};

export default transformerFactory;
