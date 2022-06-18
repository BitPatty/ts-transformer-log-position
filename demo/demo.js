var _a;
let l_stringLiteral = 'test';
let l_numberLiteral = 123;
let l_arrowFunction = () => { };
const c_array = [1, 2, 3];
const c_stringLiteral = 'test';
const c_numberLiteral = 123;
const c_arrowFunction = () => { };
function f_Function() { }
class MyClass {
    constructor() {
        this.c_literal = 1;
        this.f_arrowFunction = () => { };
    }
}
const o_object = {
    o_outer: {
        o_inner: 1,
    },
};
const edgeObj = {
    console: {
        log: (msg) => {
            console.log("[demo.ts | L21C6]", msg);
        },
    },
};
console.log("[demo.ts | L26C0]");
console.log("[demo.ts | L27C0]", 'foo');
console.log("[demo.ts | L28C0]", `${c_stringLiteral}`);
console.log("[demo.ts | L29C0]", 1);
console.log("[demo.ts | L30C0]", true);
console.log("[demo.ts | L31C0]", false);
console.log("[demo.ts | L32C0]", []);
console.log("[demo.ts | L33C0]", [1, 2]);
console.log("[demo.ts | L34C0]", {});
console.log("[demo.ts | L35C0]", { foo: 1 });
console.log("[demo.ts | L36C0]", { foo: 1 }.foo);
console.log("[demo.ts | L37C0]", this);
console.log("[demo.ts | L38C0]", null);
console.log("[demo.ts | L39C0]", undefined);
console.log("[demo.ts | L40C0]", global);
console.log("[demo.ts | L41C0]", Math);
console.log("[demo.ts | L42C0]", Symbol);
console.log("[demo.ts | L43C0]", Array);
console.log("[demo.ts | L44C0]", l_stringLiteral);
console.log("[demo.ts | L45C0]", l_numberLiteral);
console.log("[demo.ts | L46C0]", l_arrowFunction);
console.log("[demo.ts | L47C0]", c_stringLiteral);
console.log("[demo.ts | L48C0]", c_numberLiteral);
console.log("[demo.ts | L49C0]", c_arrowFunction);
console.log("[demo.ts | L50C0]", f_Function);
console.log("[demo.ts | L51C0]", Object.keys({}));
console.log("[demo.ts | L52C0]", 1 + 1);
console.log("[demo.ts | L53C0]", 1 + 2 + 3);
console.log("[demo.ts | L54C0]", 1 + 2 - 3);
console.log("[demo.ts | L55C0]", 1 + 2 - l_numberLiteral--);
console.log("[demo.ts | L56C0]", (1 + 1) / 2);
console.log("[demo.ts | L57C0]", ((1 + 1) / 2).toString());
console.log("[demo.ts | L58C0]", l_numberLiteral + 3);
console.log("[demo.ts | L59C0]", l_numberLiteral++);
console.log("[demo.ts | L60C0]", l_numberLiteral--);
console.log("[demo.ts | L61C0]", (l_numberLiteral = l_numberLiteral));
console.log("[demo.ts | L62C0]", (l_numberLiteral += l_numberLiteral));
console.log("[demo.ts | L63C0]", l_numberLiteral << 1);
console.log("[demo.ts | L64C0]", l_numberLiteral << 1);
console.log("[demo.ts | L65C0]", l_numberLiteral >> 1);
console.log("[demo.ts | L66C0]", l_numberLiteral >>> 1);
console.log("[demo.ts | L67C0]", l_numberLiteral | 1);
console.log("[demo.ts | L68C0]", l_numberLiteral & 1);
console.log("[demo.ts | L69C0]", 'foo' + 'bar');
console.log("[demo.ts | L70C0]", 'foo' + 1);
console.log("[demo.ts | L71C0]", 1 + 'foo');
console.log("[demo.ts | L72C0]", 'foo' + (1 + c_numberLiteral));
console.log("[demo.ts | L73C0]", console.log("[demo.ts | L73C12]", 'foo'));
console.log("[demo.ts | L74C0]", console.log("[demo.ts | L74C12]", console.log("[demo.ts | L74C24]", 'foo')));
console.log("[demo.ts | L75C0]", () => console.log("[demo.ts | L75C18]", 'foo'));
console.log("[demo.ts | L76C0]", (() => { })());
console.log("[demo.ts | L77C0]", (function () { })());
console.log("[demo.ts | L78C0]", l_arrowFunction());
console.log("[demo.ts | L79C0]", c_arrowFunction());
console.log("[demo.ts | L80C0]", f_Function());
console.log("[demo.ts | L81C0]", MyClass);
console.log("[demo.ts | L82C0]", new MyClass());
console.log("[demo.ts | L83C0]", [1, 2, 3][1]);
console.log("[demo.ts | L84C0]", o_object.o_outer.o_inner);
console.log("[demo.ts | L85C0]", new MyClass().c_literal);
console.log("[demo.ts | L86C0]", new MyClass().constructor);
console.log("[demo.ts | L87C0]", (_a = o_object === null || o_object === void 0 ? void 0 : o_object.o_outer) === null || _a === void 0 ? void 0 : _a.o_inner);
console.log("[demo.ts | L88C0]", o_object !== null && o_object !== void 0 ? o_object : 'object');
console.log("[demo.ts | L89C0]", true);
console.log("[demo.ts | L90C0]", false);
console.log("[demo.ts | L91C0]", true == true);
console.log("[demo.ts | L92C0]", c_numberLiteral > 0);
console.log("[demo.ts | L93C0]", c_numberLiteral >= 0);
console.log("[demo.ts | L94C0]", c_numberLiteral > 0 ? true : false);
console.log("[demo.ts | L95C0]", `${c_numberLiteral}`);
console.log("[demo.ts | L96C0]", 'foo', 'bar');
console.log("[demo.ts | L97C0]", 'foo', 1 + 2);
console.log("[demo.ts | L98C0]", ...c_array);
console.log("[demo.ts | L99C0]", 'foo', ...c_array);
console.log("[demo.ts | L100C0]", typeof c_array);
console.log("[demo.ts | L101C0]", typeof c_array);
console.log("[demo.ts | L102C0]", c_array instanceof Array);
console.log("[demo.ts | L103C0]", []);
console.log("[demo.ts | L104C0]", []);
console.log("[demo.ts | L105C0]", (1 + 3) / 3);
console.log("[demo.ts | L106C0]", () => console.log("[demo.ts | L106C24]", 'foo'));
edgeObj.console.log('foo');
const cpyA = console.log;
const cpyB = console.log("[demo.ts | L111C13]", 'foo');
console.log("[demo.ts | L112C0]", () => {
    console.log("[demo.ts | L113C2]", 'foo');
});
