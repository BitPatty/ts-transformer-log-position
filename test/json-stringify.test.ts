import { applyTransformer } from './test-utils';
import * as ts from 'typescript';

const [majorVersion, minorVersion] = ts.versionMajorMinor.split('.');

const encloseArrowFunctionParameters =
  majorVersion === '4' && minorVersion === '3';

ts.version;

test('console.log()', () => {
  const transformed = applyTransformer('console.log()');
  expect(transformed).toContain('console.log("[index.ts:0:0]");');
});

const testSetA = [
  ['"foo"'],
  ["'foo'"],
  ['1'],
  ['true'],
  ['false'],
  ['null'],
  ['undefined'],
  ['this'],
  ['Boolean'],
  ['Array'],
  ['String'],
  ['Number'],
  ['Math'],
  ['[]'],
  ['{}'],
  ['{ foo: 1 }'],
];

const testSetB = ['"foo"', '`foo`', '`foo ${1 + 1}`'];

describe('JSON Stringify', () => {
  test.each(testSetA)(
    'No Split | With Strings | console.log(%s)',
    (str: string) => {
      const transformed = applyTransformer(`console.log(${str})`, {
        split: false,
        argsToJson: true,
        stringArgsToJson: true,
      });

      expect(transformed).toContain(
        `console.log("[index.ts:0:0] " + JSON.stringify(${str})`,
      );
    },
  );

  test.each(testSetA)(
    'Split | With Strings | console.log(%s)',
    (str: string) => {
      const transformed = applyTransformer(`console.log(${str})`, {
        split: true,
        argsToJson: true,
        stringArgsToJson: true,
      });

      expect(transformed).toContain(
        `console.log("[index.ts:0:0]", JSON.stringify(${str}))`,
      );
    },
  );

  test.each(testSetB)(
    'No Split | Without Strings | console.log(%s)',
    (str: string) => {
      const transformed = applyTransformer(`console.log(${str})`, {
        split: false,
        argsToJson: true,
        stringArgsToJson: false,
      });

      expect(transformed).toContain(`console.log("[index.ts:0:0] " + ${str})`);
    },
  );

  test.each(testSetB)(
    'Split | Without Strings | console.log(%s)',
    (str: string) => {
      const transformed = applyTransformer(`console.log(${str})`, {
        split: true,
        argsToJson: true,
        stringArgsToJson: false,
      });

      expect(transformed).toContain(`console.log("[index.ts:0:0]", ${str})`);
    },
  );

  test('No Split | Spreaded Arguments', () => {
    const transformed = applyTransformer(
      `const foobar = [1, 2, 3];\nconsole.log(...foobar)`,
      {
        split: false,
        argsToJson: true,
      },
    );

    expect(transformed).toContain(
      encloseArrowFunctionParameters
        ? `console.log("[index.ts:1:0]", ...foobar.map((__ttlp__v_1) => JSON.stringify(__ttlp__v_1)))`
        : `console.log("[index.ts:1:0]", ...foobar.map(__ttlp__v_1 => JSON.stringify(__ttlp__v_1)))`,
    );
  });

  test('Split | Spreaded Arguments', () => {
    const transformed = applyTransformer(
      `const foobar = [1, 2, 3];\nconsole.log(...foobar)`,
      {
        split: true,
        argsToJson: true,
      },
    );

    expect(transformed).toContain(
      encloseArrowFunctionParameters
        ? `console.log("[index.ts:1:0]", ...foobar.map((__ttlp__v_1) => JSON.stringify(__ttlp__v_1)))`
        : `console.log("[index.ts:1:0]", ...foobar.map(__ttlp__v_1 => JSON.stringify(__ttlp__v_1)))`,
    );
  });

  test('No Split | Multiple Args', () => {
    const transformed = applyTransformer(
      `const [a, b, c] = [1, 2, 3];\nconsole.log(a, b, c)`,
      { argsToJson: true, split: false },
    );

    expect(transformed).toContain(
      `console.log("[index.ts:1:0] " + JSON.stringify(a), JSON.stringify(b), JSON.stringify(c))`,
    );
  });

  test('Split | Multiple Args', () => {
    const transformed = applyTransformer(
      `const [a, b, c] = [1, 2, 3];\nconsole.log(a, b, c)`,
      { argsToJson: true, split: true },
    );

    expect(transformed).toContain(
      `console.log("[index.ts:1:0]", JSON.stringify(a), JSON.stringify(b), JSON.stringify(c))`,
    );
  });

  test('No Split | No Nested Wraps | First Arg', () => {
    const transformed = applyTransformer(
      `const [a, b, c] = [1, 2, 3];\nconsole.log(JSON.stringify(a), b, c)`,
      { argsToJson: true, split: false },
    );

    expect(transformed).toContain(
      `console.log("[index.ts:1:0] " + JSON.stringify(a), JSON.stringify(b), JSON.stringify(c))`,
    );
  });

  test('Split | No Nested Wraps | First Arg', () => {
    const transformed = applyTransformer(
      `const [a, b, c] = [1, 2, 3];\nconsole.log(JSON.stringify(a), b, c)`,
      { argsToJson: true, split: true },
    );

    expect(transformed).toContain(
      `console.log("[index.ts:1:0]", JSON.stringify(a), JSON.stringify(b), JSON.stringify(c))`,
    );
  });

  test('No Split | No Nested Wraps | Second Arg', () => {
    const transformed = applyTransformer(
      `const [a, b, c] = [1, 2, 3];\nconsole.log(a, JSON.stringify(b), c)`,
      { argsToJson: true, split: false },
    );

    expect(transformed).toContain(
      `console.log("[index.ts:1:0] " + JSON.stringify(a), JSON.stringify(b), JSON.stringify(c))`,
    );
  });

  test('Split | No Nested Wraps | Second Arg', () => {
    const transformed = applyTransformer(
      `const [a, b, c] = [1, 2, 3];\nconsole.log(a, JSON.stringify(b), c)`,
      { argsToJson: true, split: true },
    );

    expect(transformed).toContain(
      `console.log("[index.ts:1:0]", JSON.stringify(a), JSON.stringify(b), JSON.stringify(c))`,
    );
  });
});
