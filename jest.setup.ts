import { diff } from 'jest-diff';

import ts from 'typescript';
import {
  createDefaultMapFromNodeModules,
  createSystem,
  createVirtualCompilerHost,
} from '@typescript/vfs';

import transformerFactory, { TransformerOptions } from './src';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    // eslint-disable-next-line
    interface Matchers<R> {
      // Put custom matchers here
      transformsInto(
        res: string,
        options?: Partial<TransformerOptions>,
      ): Promise<jest.CustomMatcherResult>;
    }
  }
}

expect.extend({
  transformsInto(
    received: string,
    expected: string,
    options?: Partial<TransformerOptions>,
  ): jest.CustomMatcherResult {
    const compilerOptions = {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      lib: ['es6', 'es2016', 'es2017'],
      allowJs: false,
      declaration: true,
      emitDeclarationOnly: false,
      esModuleInterop: true,
      forceConsistentCasingInFileNames: true,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      noImplicitAny: true,
      noImplicitReturns: true,
      noImplicitThis: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noEmitOnError: false,
      sourceMap: false,
      strictNullChecks: true,
      suppressImplicitAnyIndexErrors: true,
      resolveJsonModule: true,
    };

    const fsMap = createDefaultMapFromNodeModules(compilerOptions);
    fsMap.set('index.ts', received);

    const system = createSystem(fsMap);
    const host = createVirtualCompilerHost(system, compilerOptions, ts);

    const program = ts.createProgram({
      rootNames: [...fsMap.keys()],
      options: compilerOptions,
      host: host.compilerHost,
    });

    const sourceFile = program.getSourceFile('index.ts');

    if (!sourceFile) {
      return {
        pass: false,
        message: () => 'Could not find source file',
      };
    }

    const transformer = transformerFactory(program, options);
    program.emit(undefined, undefined, undefined, undefined, {
      before: [transformer],
    });

    const outFile = fsMap.get('index.js')?.trim();

    const normalizedOutput = outFile
      ?.split('\n')
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    const normalizedExpected = expected
      .split('\n')
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    const pass = normalizedOutput === normalizedExpected;

    const message = pass
      ? () =>
          this.utils.matcherHint('transformsInto', undefined, undefined) +
          '\n\n' +
          `Expected: ${this.utils.printExpected(normalizedExpected)}\n` +
          `Received: ${this.utils.printReceived(normalizedOutput)}`
      : () => {
          const diffString = diff(normalizedExpected, normalizedOutput, {
            expand: this.expand,
          });
          return (
            this.utils.matcherHint('transformsInto', undefined, undefined) +
            '\n\n' +
            (diffString && diffString.includes('- Expect')
              ? `Difference:\n\n${diffString}`
              : `Expected: ${this.utils.printExpected(normalizedExpected)}\n` +
                `Received: ${this.utils.printReceived(normalizedOutput)}`)
          );
        };

    return {
      pass,
      message,
    };
  },
});

export default undefined;
