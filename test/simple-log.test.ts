import { createTemplateLiteral, applyTransformer } from './test-utils';

test('console.log()', () => {
  const transformed = applyTransformer('console.log()');
  expect(transformed).toContain('console.log("[index.ts:0:0]");');
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

describe('Simple Log', () => {
  test.each(testSet)('No Split | console.log(%s)', (str: string, _) => {
    const transformed = applyTransformer(`console.log(${str})`, {
      split: false,
    });

    expect(transformed).toContain(
      `console.log("[index.ts:0:0] " + ${
        str.startsWith('"') || str.startsWith("'")
          ? str
          : createTemplateLiteral(str)
      })`,
    );
  });

  test.each(testSet)('Split | console.log(%s)', (str: string, _) => {
    const transformed = applyTransformer(`console.log(${str})`, {
      split: true,
    });

    expect(transformed).toContain(`console.log("[index.ts:0:0]", ${str})`);
  });
});
