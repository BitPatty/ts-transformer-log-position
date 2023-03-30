import pkg from './package.json' assert { type: 'json' };

import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
      strict: true,
      compact: false,
    },
  ],
  plugins: [
    typescript({
      tsconfig: 'tsconfig.build.json',
      transformers: [],
    }),
  ],
  external: ['typescript', 'node:assert'],
};
