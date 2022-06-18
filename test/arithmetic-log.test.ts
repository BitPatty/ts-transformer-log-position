import { createLogStatement, createTemplateLiteral } from './test-utils';

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
    expect(createLogStatement(str)).transformsInto(
      `console.log("[index.ts | L0C0]", ${str});`,
    );
  });
});

describe('No Split', () => {
  test.each(testSet)('console.log(%s)', (str) => {
    expect(createLogStatement(str)).transformsInto(
      `console.log("[index.ts | L0C0] " + ${createTemplateLiteral(str)});`,
      {
        split: false,
      },
    );
  });
});
