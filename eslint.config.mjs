import { fixupPluginRules, fixupConfigRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import eslintJS from '@eslint/js';
import eslintPrettier from 'eslint-plugin-prettier/recommended';
import eslintTS from 'typescript-eslint';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const project = './tsconfig.json';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: eslintJS.configs.recommended,
    allConfig: eslintJS.configs.all,
});

function legacyPlugin(name, alias = name) {
    const plugin = compat.plugins(name)[0]?.plugins?.[alias];

    if (!plugin) {
        throw new Error(`Unable to resolve plugin ${name} and/or alias ${alias}`);
    }

    return fixupPluginRules(plugin);
}

export default [
    // Next.js config
    ...fixupConfigRules(compat.extends('next')),
    // JS and TS config
    eslintJS.configs.recommended,
    ...eslintTS.configs.recommendedTypeChecked,
    // Import plugin config
    ...compat.extends('plugin:import/typescript'),
    // Custom rules
    {
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
                typescript: {
                    alwaysTryTypes: true,
                    project,
                },
            },
        },
        plugins: {
            import: legacyPlugin('eslint-plugin-import', 'import'),
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
            "@typescript-eslint/require-await": "off",
            "@typescript-eslint/unbound-method": "off",
            "@typescript-eslint/no-unsafe-return": "off",
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
            'next.config.mjs',
        ],
    },
];
