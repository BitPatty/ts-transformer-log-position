import ts from 'typescript';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    // eslint-disable-next-line
    interface Matchers<R> {
      // Put custom matchers here
    }
  }
}

expect.extend({});

// Parse module kind

const tsModule = process.env.JEST_TS_MODULE_KIND?.toUpperCase();
if (!tsModule) throw new Error('Missing JEST_TS_MODULE_KIND configuration');
if (!Object.entries(ts.ModuleKind).some((k) => k[0] === tsModule))
  throw new Error(`Could not find module kind ${tsModule}`);

process.env.JEST_TRANSFORMER_MODULE_KIND = tsModule;

// Parse script target
const tsScript = process.env.JEST_TS_SCRIPT_TARGET?.toUpperCase();
if (!tsScript) throw new Error('Missing JEST_TS_SCRIPT_TARGET configuration');
if (!Object.entries(ts.ScriptTarget).some((k) => k[0] === tsScript))
  throw new Error(`Could not find module kind ${tsScript}`);

process.env.JEST_TRANSFORMER_SCRIPT_TARGET = tsScript;

export default undefined;
