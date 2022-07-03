import { applyTransformer } from './test-utils';

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

    expect(transformed).toContain(
      ' __classPrivateFieldGet(this, _Foo_instances, "m", _Foo_log).call(this, "[index.ts:5:0] " + "test");',
    );
  });
});
