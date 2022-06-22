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
            console.log("[demo/demo.ts:21:6]", msg);
        },
    },
};
console.log("[demo/demo.ts:26:0]");
console.log("[demo/demo.ts:27:0]", 'foo');
console.log("[demo/demo.ts:28:0]", `${c_stringLiteral}`);
console.log("[demo/demo.ts:29:0]", 1);
console.log("[demo/demo.ts:30:0]", true);
console.log("[demo/demo.ts:31:0]", false);
console.log("[demo/demo.ts:32:0]", []);
console.log("[demo/demo.ts:33:0]", [1, 2]);
console.log("[demo/demo.ts:34:0]", {});
console.log("[demo/demo.ts:35:0]", { foo: 1 });
console.log("[demo/demo.ts:36:0]", { foo: 1 }.foo);
console.log("[demo/demo.ts:37:0]", this);
console.log("[demo/demo.ts:38:0]", null);
console.log("[demo/demo.ts:39:0]", undefined);
console.log("[demo/demo.ts:40:0]", global);
console.log("[demo/demo.ts:41:0]", Math);
console.log("[demo/demo.ts:42:0]", Symbol);
console.log("[demo/demo.ts:43:0]", Array);
console.log("[demo/demo.ts:44:0]", l_stringLiteral);
console.log("[demo/demo.ts:45:0]", l_numberLiteral);
console.log("[demo/demo.ts:46:0]", l_arrowFunction);
console.log("[demo/demo.ts:47:0]", c_stringLiteral);
console.log("[demo/demo.ts:48:0]", c_numberLiteral);
console.log("[demo/demo.ts:49:0]", c_arrowFunction);
console.log("[demo/demo.ts:50:0]", f_Function);
console.log("[demo/demo.ts:51:0]", Object.keys({}));
console.log("[demo/demo.ts:52:0]", 1 + 1);
console.log("[demo/demo.ts:53:0]", 1 + 2 + 3);
console.log("[demo/demo.ts:54:0]", 1 + 2 - 3);
console.log("[demo/demo.ts:55:0]", 1 + 2 - l_numberLiteral--);
console.log("[demo/demo.ts:56:0]", (1 + 1) / 2);
console.log("[demo/demo.ts:57:0]", ((1 + 1) / 2).toString());
console.log("[demo/demo.ts:58:0]", l_numberLiteral + 3);
console.log("[demo/demo.ts:59:0]", l_numberLiteral++);
console.log("[demo/demo.ts:60:0]", l_numberLiteral--);
console.log("[demo/demo.ts:61:0]", (l_numberLiteral = l_numberLiteral));
console.log("[demo/demo.ts:62:0]", (l_numberLiteral += l_numberLiteral));
console.log("[demo/demo.ts:63:0]", l_numberLiteral << 1);
console.log("[demo/demo.ts:64:0]", l_numberLiteral << 1);
console.log("[demo/demo.ts:65:0]", l_numberLiteral >> 1);
console.log("[demo/demo.ts:66:0]", l_numberLiteral >>> 1);
console.log("[demo/demo.ts:67:0]", l_numberLiteral | 1);
console.log("[demo/demo.ts:68:0]", l_numberLiteral & 1);
console.log("[demo/demo.ts:69:0]", 'foo' + 'bar');
console.log("[demo/demo.ts:70:0]", 'foo' + 1);
console.log("[demo/demo.ts:71:0]", 1 + 'foo');
console.log("[demo/demo.ts:72:0]", 'foo' + (1 + c_numberLiteral));
console.log("[demo/demo.ts:73:0]", console.log("[demo/demo.ts:73:12]", 'foo'));
console.log("[demo/demo.ts:74:0]", console.log("[demo/demo.ts:74:12]", console.log("[demo/demo.ts:74:24]", 'foo')));
console.log("[demo/demo.ts:75:0]", () => console.log("[demo/demo.ts:75:18]", 'foo'));
console.log("[demo/demo.ts:76:0]", (() => { })());
console.log("[demo/demo.ts:77:0]", (function () { })());
console.log("[demo/demo.ts:78:0]", l_arrowFunction());
console.log("[demo/demo.ts:79:0]", c_arrowFunction());
console.log("[demo/demo.ts:80:0]", f_Function());
console.log("[demo/demo.ts:81:0]", MyClass);
console.log("[demo/demo.ts:82:0]", new MyClass());
console.log("[demo/demo.ts:83:0]", [1, 2, 3][1]);
console.log("[demo/demo.ts:84:0]", o_object.o_outer.o_inner);
console.log("[demo/demo.ts:85:0]", new MyClass().c_literal);
console.log("[demo/demo.ts:86:0]", new MyClass().constructor);
console.log("[demo/demo.ts:87:0]", (_a = o_object === null || o_object === void 0 ? void 0 : o_object.o_outer) === null || _a === void 0 ? void 0 : _a.o_inner);
console.log("[demo/demo.ts:88:0]", o_object !== null && o_object !== void 0 ? o_object : 'object');
console.log("[demo/demo.ts:89:0]", true);
console.log("[demo/demo.ts:90:0]", false);
console.log("[demo/demo.ts:91:0]", true == true);
console.log("[demo/demo.ts:92:0]", c_numberLiteral > 0);
console.log("[demo/demo.ts:93:0]", c_numberLiteral >= 0);
console.log("[demo/demo.ts:94:0]", c_numberLiteral > 0 ? true : false);
console.log("[demo/demo.ts:95:0]", `${c_numberLiteral}`);
console.log("[demo/demo.ts:96:0]", 'foo', 'bar');
console.log("[demo/demo.ts:97:0]", 'foo', 1 + 2);
console.log("[demo/demo.ts:98:0]", ...c_array);
console.log("[demo/demo.ts:99:0]", 'foo', ...c_array);
console.log("[demo/demo.ts:100:0]", typeof c_array);
console.log("[demo/demo.ts:101:0]", typeof c_array);
console.log("[demo/demo.ts:102:0]", c_array instanceof Array);
console.log("[demo/demo.ts:103:0]", []);
console.log("[demo/demo.ts:104:0]", []);
console.log("[demo/demo.ts:105:0]", (1 + 3) / 3);
console.log("[demo/demo.ts:106:0]", () => console.log("[demo/demo.ts:106:24]", 'foo'));
console.log("[demo/demo.ts:107:0]", () => {
    console.log("[demo/demo.ts:108:2]", 'foo');
});
const globalLog = (msg) => console.log("[demo/demo.ts:111:35]", msg);
globalLog("[demo/demo.ts:113:0]", 'foobar');
const logObj = {
    log: () => { },
    console: {
        log: () => { },
    },
};
logObj.log();
logObj.console.log();
class Foo {
    log() { }
    print() {
        this.log("[demo/demo.ts:130:4]");
        this.logger.log("[demo/demo.ts:131:4]");
    }
}
