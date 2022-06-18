import ts, { CallExpression } from 'typescript';

type TransformerConfig = {
  expression: string;
  functionNames: string[];
  templateString: string;
  split: boolean;
};

let transformerConfig: TransformerConfig = {
  expression: 'console',
  functionNames: ['log', 'warn', 'trace', 'error', 'debug'],
  templateString: '[{fileName} | L{line}C{character}] ',
  split: true,
};

type Visitor = (node: ts.Node) => ts.VisitResult<ts.Node>;

const formatPrefix = (fileName: string, pos: ts.LineAndCharacter): string => {
  return transformerConfig.templateString
    .replace('{fileName}', fileName)
    .replace('{line}', pos.line.toString())
    .replace('{character}', pos.character.toString());
};

const isLogStatement = (
  node:
    | ts.Node
    | ts.CallExpression
    | ts.NewExpression
    | ts.ArrayLiteralExpression,
): node is CallExpression => {
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

const logLineNumberTransformer: ts.TransformerFactory<ts.SourceFile> = (
  context,
) => {
  return (sourceFile) => {
    const visitor: Visitor = (node) => {
      if (isLogStatement(node)) {
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
        ts.isNewExpression(node) ||
        ts.isObjectLiteralExpression(node) ||
        ts.isParenthesizedExpression(node) ||
        ts.isPostfixUnaryExpression(node) ||
        ts.isPropertyAccessExpression(node) ||
        ts.isSyntheticExpression(node) ||
        ts.isTemplateExpression(node) ||
        ts.isTemplateExpression(node)
      ) {
        if (!isLogStatement(node.parent))
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

const transformerFactory = (
  _: ts.Program,
  config?: TransformerConfig,
): ts.TransformerFactory<ts.Node> => {
  transformerConfig = {
    ...transformerConfig,
    ...config,
  };

  return logLineNumberTransformer;
};

export default transformerFactory;
