import {
  createLogStatement,
  createTemplateLiteral,
  getConsoleIndex,
} from './test-utils';

test('console.log()', () => {
  expect('console.log()').transformsInto('console.log("[index.ts:0:0]");');
});

const testSet = [
  ['"foo"', false],
  ["'foo'", false],
  ['1', true],
  ['true', true],
  ['false', true],
  ['null', true],
  ['undefined', true],
  ['this', true],
  ['Boolean', true],
  ['Array', true],
  ['String', true],
  ['Number', true],
  ['Math', true],
  ['[]', true],
  ['{}', true],
  ['{ foo: 1 }', true],
];

describe('Split', () => {
  test.each(testSet)('console.log(%s)', (str: string, _) => {
    expect(createLogStatement(str)).transformsInto(
      `console.log("[index.ts:0:0]", ${str});`,
    );
  });

  test.each(testSet)('console.log(myVar) (is %s)', (str) => {
    const srcStr = `const myVar = ${str}; ${createLogStatement('myVar')}`;
    expect(srcStr).transformsInto(
      `const myVar = ${str};\nconsole.log("[index.ts:0:${srcStr.indexOf(
        'console',
      )}]", myVar);`,
    );
  });
});

describe('No Split', () => {
  test.each(testSet)('console.log(%s)', (str: string, wrap) => {
    const wrapped = wrap ? createTemplateLiteral(str) : str;
    expect(`console.log(${str})`).transformsInto(
      `console.log("[index.ts:0:0] " + ${wrapped});`,
      { split: false },
    );
  });

  test.each(testSet)('console.log(myVar) (is %s)', (str) => {
    const srcStr = `const myVar = ${str}; ${createLogStatement('myVar')}`;
    expect(srcStr).transformsInto(
      `const myVar = ${str};\n${createLogStatement(
        `"[index.ts:0:${getConsoleIndex(srcStr)}] " + ${createTemplateLiteral(
          'myVar',
        )}`,
      )}`,
      { split: false },
    );
  });
});
