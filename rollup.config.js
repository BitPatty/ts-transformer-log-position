import pkg from './package.json';

import typescript from 'rollup-plugin-typescript2';
import ttypescript from 'ttypescript';

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
      typescript: ttypescript,
      tsconfig: 'tsconfig.build.json',
      transformers: [],
    }),
  ],
  external: ['typescript'],
};
