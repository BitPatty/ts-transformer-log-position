import typescriptEslint from "@typescript-eslint/eslint-plugin";
import jest from "eslint-plugin-jest";
import prettier from "eslint-plugin-prettier";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    ignores: [
        "coverage/**/*",
        "dist/**/*",
        "scripts/**/*",
        "**/*.sh",
        "coverage/**/*",
        "dist/**/*",
        "scripts/**/*",
        "demo/**/*",
        "**/*.sh",
        "**/rollup.config.mjs",
        "test/**/*",
        "test-output/**/*",
    ],
}, ...compat.extends(
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:jest/recommended",
    "plugin:prettier/recommended",
), {
    plugins: {
        "@typescript-eslint": typescriptEslint,
        jest,
        prettier,
    },

    languageOptions: {
        globals: {
            ...globals.node,
        },

        parser: tsParser,
        ecmaVersion: 5,
        sourceType: "commonjs",

        parserOptions: {
            project: "./tsconfig.json",
            tsconfigRootDir: "./",
        },
    },

    rules: {
        "@typescript-eslint/explicit-function-return-type": ["error", {
            allowExpressions: true,
            allowConciseArrowFunctionExpressionsStartingWithVoid: true,
        }],

        "@typescript-eslint/no-floating-promises": ["error"],
        "@typescript-eslint/no-shadow": ["error"],
        "@typescript-eslint/explicit-member-accessibility": ["error"],
        "@typescript-eslint/no-unused-vars": ["error"],
        "@typescript-eslint/switch-exhaustiveness-check": "error",
        "no-console": ["error"],
        "no-return-await": ["error"],
        "require-await": ["error"],

        "padding-line-between-statements": ["error", {
            blankLine: "always",
            prev: "*",
            next: "function",
        }],

        "prettier/prettier": ["error", {}, {
            usePrettierrc: true,
        }],

        // "valid-jsdoc": ["error", {
        //     requireReturn: false,
        //     requireReturnType: false,
        //     requireParamType: false,
        // }],
    },
}, {
    files: ["**/*.spec.ts"],

    languageOptions: {
        globals: {
            ...jest.environments.globals.globals,
        },
    },
}, {
    files: ["test/**/*.js"],

    rules: {
        "@typescript-eslint/explicit-function-return-type": "off",
    },
}];