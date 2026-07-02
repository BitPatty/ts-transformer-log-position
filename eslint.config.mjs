import globals from 'globals';

import typescriptPlugin from '@typescript-eslint/eslint-plugin';

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: [],
  },
  ...compat.extends(
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ),
  {
    plugins: { '@typescript-eslint': typescriptPlugin },
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
      parserOptions: { project: 'tsconfig.json', tsConfigRootDir: './' },
    },
    rules: {
      'require-await': 'error',
      'no-return-await': 'error',
      'no-unreachable': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      'no-unused-private-class-members': 'error',
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: true,
          allowConciseArrowFunctionExpressionsStartingWithVoid: true,
        },
      ],
      '@typescript-eslint/no-for-in-array': 'error',
      '@typescript-eslint/no-deprecated': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/switch-exhaustiveness-check': [
        'error',
        { considerDefaultExhaustiveForUnions: true },
      ],
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-base-to-string': 'error',
      'init-declarations': 'off',
      '@typescript-eslint/init-declarations': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { args: 'all', argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-expressions': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/no-deprecated': 'warn',
    },
  },
  {
    files: ['test/**'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      'init-declarations': 'off',
      '@typescript-eslint/init-declarations': 'off',
    },
  },
  {
    files: ['mock-server/**'],
    rules: {
      '@typescript-eslint/no-misused-promises': 'off',
    },
  },
];
