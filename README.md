# ts-transformer-log-position

A typescript transformer that injects the position of a log statement from the original source flie into the log message at build time.

## Usage

1. Use a compiler that supports transformers, such as [ttypescript](https://github.com/cevek/ttypescript)
2. Install the package
3. Add the transformer to your `tsconfig`:

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
console.log('[/workspace/test/input.ts | L19C0]'); // output

console.log(foo); // input
console.log('[/workspace/test/input.ts | L29C0]', foo); // output
```

## Configuration

The plugin provides the configuration options below.

### `split`

Whether to split the arguments in the log statement. Defaults to `true`.

```typescript
// split: true
console.log(foo); // input
console.log('[/workspace/test/input.ts | L29C0]', foo); // output

// split: false
console.log(foo); // input
console.log('[/workspace/test/input.ts | L29C0]' + `${foo}`); // output
```

### `templateString`

The template string for the log prefix. Defaults to `"[{absoluteFilePath} | L{line}C{character}] "`.

The following placeholders are available:

- `absoluteFilePath`: The absolute path to the file
- `fileName`: The name of the file
- `projectFilePath`: The absolute path to the file from the project root. The project root is auto-detected, but can be modified via the `projectRoot` option

```typescript
// templateString: "[{absoluteFilePath} | L{line}C{character}] "
console.log(foo); // input
console.log('[/workspace/test/input.ts | L29C0]', foo); // output

// templateString: "{projectFilePath}, line {line} "
console.log(foo); // input
console.log('/test/input.ts, line 29', foo); // output
```

### `expression` / `functionNames`

The pattern of the call expression that should be matched against to apply the transformer. Defaults to:

- `expression`: `"console"`
- `functionNames`: `['log', 'warn', 'trace', 'error', 'debug']`

```typescript
// functionNames: ['log']
console.log(foo); // input
console.log('[/workspace/test/input.ts | L29C0]', foo); // output

console.warn(foo); // input
console.warn(foo); // output

// expression: "Logger"
Logger.log(foo); // input
Logger.log('[/workspace/test/input.ts | L29C0]', foo); // output

console.log(foo); // input
console.log(foo); // output
```
