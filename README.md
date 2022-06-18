# ts-transformer-log-position

A typescript transformer that injects the position of a log statement from the original source file into the respective log message at build time.

## Usage

1. Use a compiler that supports transformers, such as [ttypescript](https://github.com/cevek/ttypescript)
2. Install the package `npm i @bitpatty/ts-transformer-log-position`
3. Add the transformer to your `tsconfig.json`:

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

## Sample

```typescript
console.log(); // input
console.log('[demo/demo.ts:19:0]'); // output

console.log(foo); // input
console.log('[demo/demo.ts:29:0', foo); // output
```

## Configuration

The plugin provides the configuration options below.

### `split`

Whether to split the arguments in the log statement. Defaults to `true`.

```typescript
// split: true
console.log('[demo/demo.ts:29:0', foo); // split: true
console.log('[demo/demo.ts:29:0' + `${foo}`); // split: false
```

### `templateString`

The template string for the log prefix. Defaults to `"[{projectFilePath}:{line}:{character}] "`.

The following placeholders are available:

- `absoluteFilePath`: The absolute path to the file
- `fileName`: The name of the file
- `projectFilePath`: The absolute path to the file from the project root. The project root is auto-detected, but can be modified via the `projectRoot` option

```typescript
console.log('[demo/demo.ts:29:0]', foo); // templateString: "[{absoluteFilePath} | L{line}C{character}] "
console.log('/test/input.ts, line 29', foo); // templateString: "{projectFilePath}, line {line} "
```

### `expression` / `functionNames`

The pattern of the call expression that should be matched against to apply the transformer. Defaults to:

- `expression`: `"console"`
- `functionNames`: `['log', 'warn', 'trace', 'error', 'debug']`

```typescript
// functionNames: ['warn']
console.warn('[demo/demo.ts:29:0]', foo);
console.log(foo); // not modified

// expression: "Logger"
Logger.log('[demo/demo.ts:29:0', foo);
console.log(foo); // not modified
```

### `incrementLineNumber`

Adds +1 to each line number to match the numbering of common editors (starting from 1 instead of 0). Defaults to `false`.
