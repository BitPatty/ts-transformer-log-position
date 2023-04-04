# ts-transformer-log-position

A configurable Typescript AST transformer that injects the position of a log statement from the original source file into the respective log message **at build time**, allowing you to trace back log messages without emitting, exposing or requiring source maps.

## Usage

1. Use a compiler that allows you to use transformers (such as [ts-patch](https://github.com/nonara/ts-patch))
2. Install the package `npm i --save-dev @bitpatty/ts-transformer-log-position`
3. For ts-patch users: Add the transformer to your `tsconfig.json`:

```
{
  "compilerOptions": {
    "plugins": [
      {
        "transform": "@bitpatty/ts-transformer-log-position"
        // Additional transformer configuration can be applied here
      }
    ]
  }
}
```

If you use a different compiler than ts-patch, refer to the respective documentation on how to apply transformers.

## Sample

```typescript
console.log(); // input
console.log('[src/sample.ts:0:0]'); // output

console.log(foo); // input
console.log('[src/sample.ts:3:0]', foo); // output
```

## Ignoring lines

Individual lines can be ignored by adding `@ts-transformer-log-position ignore` to the line before the log statement. To ignore an entire file add `@ts-transformer-log-position disable` on the top of the file (before any imports or logic).

```typescript
// @ts-transformer-log-position disable
console.log('foo'); // will be ignored
console.log('foo'); // will be ignored
```

```typescript
/* Some other comments */
// ...

// @ts-transformer-log-position disable
console.log('foo'); // will be ignored
console.log('foo'); // will be ignored
```

```typescript
console.log('foo'); // will NOT be ignored
// @ts-transformer-log-position ignore
console.log('foo'); // will be ignored
console.log('foo'); // will NOT be ignored
```

## Configuration

The plugin provides the configuration options below.

### `split`

Whether to split the arguments in the log statement. Defaults to `true`.

```typescript
console.log('[src/sample.ts:0:0]', foo); // split: true
console.log('[src/sample.ts:1:0] ' + `${foo}`); // split: false
```

### `templateString`

The template string for the log prefix. Defaults to `"[{projectFilePath}:{line}:{character}]"`.

The following placeholders are available:

- `absoluteFilePath`: The absolute path to the file
- `fileName`: The name of the file
- `projectFilePath`: The absolute path to the file from the project root. The project root is auto-detected, but can be modified via the `projectRoot` option

```typescript
console.log('[/workspace/src/sample.ts:0:0]', foo); // templateString: "[{absoluteFilePath}:{line}:{character}]"
console.log('src/sample.ts, line 1', foo); // templateString: "{projectFilePath}, line {line}"
console.log('sample.ts, line 1', foo); // templateString: "{fileName}, line {line}"
```

### `expressions`

The pattern of the call expression that should be matched against to apply the transformer. Defaults to: `['console.log', 'console.warn', 'console.debug', 'console.error', 'console.trace']`

```typescript
// expressions: "Logger.log"
Logger.log('[src/sample.ts:1:0]', foo);
console.log(foo); // not modified

// expressions: ["Logger.log", "console.log"]
Logger.log('[src/sample.ts:5:0]', foo);
console.log('[src/sample.ts:6:0]', foo);
```

### `incrementLineNumber` / `incrementCharNumber`

Adds +1 to each line / character number to match the numbering of common editors (starting from 1 instead of 0). Defaults to `false`.

### `argsToJson` / `stringArgsToJson`

If `argsToJson` is true, the log arguments are wrapped in a JSON stringify. It omits strings and template expressions unless `stringArgsToJson` is `true`. Defaults to `false` / `false`.

Examples:

```typescript
// argsToJson: true

// in
console.log(foo);
// out
console.log('[src/sample.ts:0:0] ' + JSON.stringify(foo));

// in
console.log(1 + 1);
// out
console.log('[src/sample.ts:0:0] ' + JSON.stringify(1 + 1));

// in
console.log(...foo);
// out
console.log(
  '[src/sample.ts:0:0] ',
  ...foo.map((__ttlp__v_0) => JSON.stringify(__ttlp__v_0)),
);

// in
console.log(a, b, c);
// out
console.log(
  '[src/sample.ts:0:0] ' + JSON.stringify(a),
  JSON.stringify(b),
  JSON.stringify(c),
);
```
