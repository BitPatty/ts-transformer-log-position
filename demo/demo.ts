// Declarations
let l_stringLiteral = 'test';
let l_numberLiteral = 123;
let l_arrowFunction = () => {};
const c_array = [1, 2, 3];
const c_stringLiteral = 'test';
const c_numberLiteral = 123;
const c_arrowFunction = () => {};
function f_Function(): void {}
class MyClass {
  public readonly c_literal = 1;
  public readonly f_arrowFunction = () => {};
}
const o_object = {
  o_outer: {
    o_inner: 1,
  },
};
const edgeObj = {
  console: {
    log: (msg: string) => {
      console.log(msg);
    },
  },
};
// Logs
console.log();
console.log('foo');
// @ts-transformer-log-position ignore
console.log('foo');
console.log(`${c_stringLiteral}`);
console.log(1);
console.log(true);
console.log(false);
console.log([]);
console.log([1, 2]);
console.log({});
console.log({ foo: 1 });
console.log({ foo: 1 }.foo);
console.log(this);
console.log(null);
console.log(undefined);
console.log(global);
console.log(Math);
console.log(Symbol);
console.log(Array);
console.log(l_stringLiteral);
console.log(l_numberLiteral);
console.log(l_arrowFunction);
console.log(c_stringLiteral);
console.log(c_numberLiteral);
console.log(c_arrowFunction);
console.log(f_Function);
console.log(Object.keys({}));
console.log(1 + 1);
console.log(1 + 2 + 3);
console.log(1 + 2 - 3);
console.log(1 + 2 - l_numberLiteral--);
console.log((1 + 1) / 2);
console.log(((1 + 1) / 2).toString());
console.log(l_numberLiteral + 3);
console.log(l_numberLiteral++);
console.log(l_numberLiteral--);
console.log((l_numberLiteral = l_numberLiteral));
console.log((l_numberLiteral += l_numberLiteral));
console.log(l_numberLiteral << 1);
console.log(l_numberLiteral << 1);
console.log(l_numberLiteral >> 1);
console.log(l_numberLiteral >>> 1);
console.log(l_numberLiteral | 1);
console.log(l_numberLiteral & 1);
console.log('foo' + 'bar');
console.log('foo' + 1);
console.log(1 + 'foo');
console.log('foo' + (1 + c_numberLiteral));
console.log(console.log('foo'));
console.log(console.log(console.log('foo')));
console.log(() => console.log('foo'));
console.log((() => {})());
console.log((function () {})());
console.log(l_arrowFunction());
console.log(c_arrowFunction());
console.log(f_Function());
console.log(MyClass);
console.log(new MyClass());
console.log([1, 2, 3][1]);
console.log(o_object.o_outer.o_inner);
console.log(new MyClass().c_literal);
console.log(new MyClass().constructor);
console.log(o_object?.o_outer?.o_inner);
console.log(o_object ?? 'object');
console.log(true);
console.log(false);
console.log(true == true);
console.log(c_numberLiteral > 0);
console.log(c_numberLiteral >= 0);
console.log(c_numberLiteral > 0 ? true : false);
console.log(`${c_numberLiteral}`);
console.log('foo', 'bar');
console.log('foo', 1 + 2);
console.log(...c_array);
console.log('foo', ...c_array);
console.log(typeof c_array);
console.log(typeof c_array);
console.log(c_array instanceof Array);
console.log([] as string[]);
console.log([] as unknown as string);
console.log(((1 as number) + <number>3) / 3);
console.log((): void => console.log('foo'));
edgeObj.console.log('foo');
// @ts-ignore
const cpyA = console.log;
// @ts-ignore
const cpyB = console.log('foo');
console.log(() => {
  console.log('foo');
});

const globalLog = (msg: string) => console.log(msg);

globalLog('foobar');

const foo = {
  log: () => {},
  console: {
    log: () => {},
  },
};

foo.log();
foo.console.log();

class Foo {
  public logger: Foo;
  private log() {}

  public print() {
    this.log();
    this.logger.log();
  }
}
