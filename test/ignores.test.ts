import { applyTransformer } from './test-utils';

describe('Ignores', () => {
  test('Ignores Line', () => {
    const lines = [
      'console.log("test1")',
      '// @ts-transformer-log-position ignore',
      'console.log("test2")',
      'console.log("test3")',
    ];

    const transformed = applyTransformer(lines.join('\n'));

    expect(transformed).not.toContain('console.log("test1")');
    expect(transformed).toContain('console.log("[index.ts:0:0]", "test1")');

    expect(transformed).toContain('console.log("test2")');
    expect(transformed).not.toContain(', "test2")');

    expect(transformed).not.toContain('console.log("test3")');
    expect(transformed).toContain('console.log("[index.ts:3:0]", "test3")');
  });

  test('Ignores File', () => {
    const lines = [
      '// @ts-transformer-log-position disable',
      'console.log("test1")',
      'console.log("test2")',
    ];

    const transformed = applyTransformer(lines.join('\n'));

    expect(transformed).toContain('console.log("test1")');
    expect(transformed).not.toContain(', "test1")');

    expect(transformed).toContain('console.log("test2")');
    expect(transformed).not.toContain(', "test2")');
  });
});
