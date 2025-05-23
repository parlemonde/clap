import eslintJS from '@eslint/js';
import eslintPrettier from 'eslint-plugin-prettier/recommended';
import eslintTS from 'typescript-eslint';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const project = './tsconfig.json';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

export default [
    // Next.js config
    ...compat.extends('next/core-web-vitals'),
    // JS and TS config
    eslintJS.configs.recommended,
    ...eslintTS.configs.recommendedTypeChecked,
    // Custom rules
    {
        files: ['**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}'],
        languageOptions: {
            parserOptions: {
                project,
                tsconfigRootDir: import.meta.dirname,
            },
            ecmaVersion: 'latest',
            sourceType: 'module',
        },
        settings: {
            'import/resolver': {
                typescript: true,
                node: true,
            },
        },
        rules: {
            'no-console': [
                'error',
                {
                    allow: ['warn', 'error'],
                },
            ],
            camelcase: [
                'error',
                {
                    properties: 'always',
                },
            ],
            '@typescript-eslint/consistent-type-imports': [
                'error',
                {
                    prefer: 'type-imports',
                    disallowTypeAnnotations: false,
                },
            ],
            '@typescript-eslint/no-empty-function': 'off',
            '@typescript-eslint/no-inferrable-types': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
            '@typescript-eslint/require-await': 'off',
            '@typescript-eslint/unbound-method': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unused-expressions': [
                'error',
                {
                    allowShortCircuit: true,
                    allowTernary: true,
                },
            ],
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    args: 'all',
                    argsIgnorePattern: '^_',
                    caughtErrors: 'all',
                    caughtErrorsIgnorePattern: '^_',
                    destructuredArrayIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    ignoreRestSiblings: true,
                },
            ],
            'import/newline-after-import': [
                'error',
                {
                    count: 1,
                },
            ],
            'import/order': [
                'error',
                {
                    pathGroups: [
                        {
                            pattern: 'src/**',
                            group: 'sibling',
                        },
                    ],

                    groups: [
                        ['builtin', 'external', 'internal'],
                        ['parent', 'sibling', 'index'],
                    ],
                    'newlines-between': 'always',

                    alphabetize: {
                        order: 'asc',
                        caseInsensitive: false,
                    },
                },
            ],
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
        },
    },
    // Prettier config for all files
    eslintPrettier,
    // General ignore rules
    {
        ignores: [
            '.minio-data/',
            '.next/',
            'node_modules/',
            '.postgres-data/',
            '.redis-data/',
            '.vscode/',
            'drizzle/',
            '.prettierrc.js',
            '.svgrrc.js',
            'eslint.config.mjs',
            '.open-next/',
            'server-preview-proxy',
            'server-pdf-generation/dist',
            'server-pdf-generation/node_modules',
            'server-websockets',
            'server-video-generation/dist',
            'server-video-generation/node_modules',
        ],
    },
];
