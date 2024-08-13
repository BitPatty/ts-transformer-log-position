import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import typescript from 'rollup-plugin-typescript2';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(readFileSync(join(__dirname, 'package.json')));

export default {
  input: 'src/index.ts',
  output: [
    {
      file: packageJson.main,
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
