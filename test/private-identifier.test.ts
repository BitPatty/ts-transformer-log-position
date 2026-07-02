import ts from 'typescript';
import { applyTransformer, COMPILER_OPTIONS } from './test-utils';

describe('Private Identifiers', () => {
  test('Transforms Private Identifier', () => {
    const lines = [
      'class Foo {',
      '#log(msg: string) {',
      'console.log(msg);',
      '}',
      'foo() {',
      'this.#log("test");',
      '}}',
    ];

    const transformed = applyTransformer(lines.join('\n'), {
      expressions: ['this.#log'],
      split: false,
    });

    switch (COMPILER_OPTIONS.target) {
      case ts.ScriptTarget.ES2025:
        expect(transformed).toContain('this.#log("[index.ts:5:0] " + "test");');
        break;
      default:
        expect(transformed).toContain(
          ' __classPrivateFieldGet(this, _Foo_instances, "m", _Foo_log).call(this, "[index.ts:5:0] " + "test");',
        );
    }
  });
});
