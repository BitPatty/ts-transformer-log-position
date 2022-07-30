import { applyTransformer } from './test-utils';

describe('Config', () => {
  test('Custom Template String', () => {
    const transformed = applyTransformer('console.log("test")', {
      templateString: '[Line {line}, Character {character}]',
    });

    expect(transformed).toContain(
      'console.log("[Line 0, Character 0]", "test")',
    );
  });

  test('Custom Logger', () => {
    const transformed = applyTransformer('Logger.log("test")', {
      expressions: 'Logger.log',
    });

    expect(transformed).toContain('Logger.log("[index.ts:0:0]", "test")');
  });

  test('Property Access Chain Logger', () => {
    const transformed = applyTransformer('foo.bar.log("test")', {
      expressions: 'foo.bar.log',
    });

    expect(transformed).toContain('foo.bar.log("[index.ts:0:0]", "test")');
  });

  test('Property Access Chain Logger With `this` Keyword', () => {
    const transformed = applyTransformer('this.logger.log("test")', {
      expressions: 'this.logger.log',
    });

    expect(transformed).toContain('this.logger.log("[index.ts:0:0]", "test")');
  });

  test('Global Logger', () => {
    const transformed = applyTransformer('foo("test")', {
      expressions: 'foo',
    });

    expect(transformed).toContain('foo("[index.ts:0:0]", "test")');
  });

  test('Multiple Loggers', () => {
    const lines = [
      'error("test")',
      'Logger.log("test")',
      'Logger.log.error("test")',
      'console.log("test")',
      'console.warn("test")',
      'console.error("test")',
    ];

    const transformed = applyTransformer(lines.join('\n'), {
      expressions: [
        'error',
        'console.log',
        'console.warn',
        'Logger.log',
        'Logger.log.error',
      ],
    });

    expect(transformed).toContain('error("[index.ts:0:0]", "test")');
    expect(transformed).toContain('Logger.log("[index.ts:1:0]", "test")');
    expect(transformed).toContain('Logger.log.error("[index.ts:2:0]", "test")');
    expect(transformed).toContain('console.log("[index.ts:3:0]", "test")');
    expect(transformed).toContain('console.warn("[index.ts:4:0]", "test")');
    expect(transformed).not.toContain('console.error("[index.ts');
  });

  test('Mutiple Log Statements', () => {
    const lines = [
      'console.log("test1")',
      'console.log("test2")',
      'console.error("test3")',
    ];

    const transformed = applyTransformer(lines.join('\n'));

    expect(transformed).toContain('console.log("[index.ts:0:0]", "test1")');
    expect(transformed).toContain('console.log("[index.ts:1:0]", "test2")');
    expect(transformed).toContain('console.error("[index.ts:2:0]", "test3")');
  });

  test('Increment Line Number', () => {
    const lines = [
      'console.log("test1")',
      'console.log("test2")',
      'console.log("test3")',
    ];

    const transformed = applyTransformer(lines.join('\n'), {
      incrementLineNumber: true,
    });

    expect(transformed).toContain('console.log("[index.ts:1:0]", "test1")');
    expect(transformed).toContain('console.log("[index.ts:2:0]", "test2")');
    expect(transformed).toContain('console.log("[index.ts:3:0]", "test3")');
  });

  test('Increment Char Number', () => {
    const lines = [
      '  console.log("test1")',
      ' console.log("test2")',
      'console.log("test3")',
    ];

    const transformed = applyTransformer(lines.join('\n'), {
      incrementCharNumber: true,
    });

    expect(transformed).toContain('console.log("[index.ts:0:3]", "test1")');
    expect(transformed).toContain('console.log("[index.ts:1:2]", "test2")');
    expect(transformed).toContain('console.log("[index.ts:2:1]", "test3")');
  });
});
