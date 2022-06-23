import ts from 'typescript';

import { readdirSync, readFileSync } from 'fs';
import { dirname, join } from 'path';

import {
  createDefaultMapFromNodeModules,
  createSystem,
  createVirtualCompilerHost,
} from '@typescript/vfs';

import transformerFactory, { TransformerOptions } from '../dist';

const tsDir = dirname(require.resolve('typescript'));
const tsLibs = readdirSync(tsDir).filter((f) => f.endsWith('.d.ts'));

/**
 * Applies the transformer to the specified source
 *
 * @param source   The source
 * @param options  The transformer options
 * @returns        The compilation output
 */
const applyTransformer = (
  source: string,
  options?: Partial<TransformerOptions>,
): string => {
  if (!process.env.JEST_TRANSFORMER_SCRIPT_TARGET)
    throw new Error('Missing script target');

  if (!process.env.JEST_TRANSFORMER_MODULE_KIND)
    throw new Error('Missing module kind');

  const compilerOptions = {
    module: ts.ModuleKind[process.env.JEST_TRANSFORMER_MODULE_KIND],
    target: ts.ScriptTarget[process.env.JEST_TRANSFORMER_SCRIPT_TARGET],
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
  };

  const fsMap = createDefaultMapFromNodeModules(compilerOptions);

  const filteredLibs = tsLibs.filter((l) =>
    l
      .toLowerCase()
      .includes(process.env.JEST_TRANSFORMER_SCRIPT_TARGET!.toLowerCase()),
  );

  for (const lib of filteredLibs)
    fsMap.set(`/${lib}`, readFileSync(join(tsDir, lib), 'utf8'));

  fsMap.set('index.ts', source);

  const system = createSystem(fsMap);
  const host = createVirtualCompilerHost(system, compilerOptions, ts);

  const program = ts.createProgram({
    rootNames: [...fsMap.keys()],
    options: compilerOptions,
    host: host.compilerHost,
  });

  const sourceFile = program.getSourceFile('index.ts');
  if (!sourceFile) throw new Error('Could not find source file in VFS');

  const transformer = transformerFactory(program, options);
  program.emit(undefined, undefined, undefined, undefined, {
    before: [transformer],
  });

  const outFile = fsMap.get('index.js')?.trim();
  if (!outFile) throw new Error('Could not find out file in VFS');

  return outFile;
};

/**
 * Wraps the specified string in a template literal
 *
 * @param value  The string
 * @returns      The template literal
 */
const createTemplateLiteral = (value: string) => '`${' + value + '}`';

export { applyTransformer, createTemplateLiteral };
