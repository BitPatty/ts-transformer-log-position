import { applyTransformer, createTemplateLiteral } from './test-utils';

const testSet = [
  ['1 + 1'],
  ['1 - 1'],
  ['1 / 1'],
  ['1 * 1'],
  ['1.1 + 1.0'],
  ['1.1 - 1.0'],
  ['1.1 / 1.0'],
  ['1.1 * 1.0'],
  ['(1 + 1) / 1'],
  ['(1.1 + 1.0) / 1.0'],
];
describe('Split', () => {
  test.each(testSet)('console.log(%s)', (str) => {
    const transformed = applyTransformer(`console.log(${str})`);
    expect(transformed).toContain(`("[index.ts:0:0]", ${str})`);
  });
});

describe('No Split', () => {
  test.each(testSet)('console.log(%s)', (str) => {
    const transformed = applyTransformer(`console.log(${str})`, {
      split: false,
    });
    expect(transformed).toContain(
      `("[index.ts:0:0] " + ${createTemplateLiteral(str)}`,
    );
  });
});
