import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'

/** @type {import('eslint').Linter.Config[]} */
export default [
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    ...pluginVue.configs['flat/essential'],
    {
        files: ['**/*.vue'],
        languageOptions: {
            parser: pluginVue.parser,
            parserOptions: {
                parser: tseslint.parser,
            },
        },
    },
    { files: ['**/*.{ts, vue}'] },
    { ignores: ['.husky/**/*', '**/dist/**', '**/node_modules/**', 'neon-bridge/**'] },
    { languageOptions: { globals: { ...globals.browser, ...globals.node, } } },
    {
        rules: {
            semi: [0, 'never'],
            'no-alert': 2,
            'no-console': 1,
            'no-debugger': 1,
            'block-spacing': [2, 'always'],
            quotes: [
                2, 'single', {
                    avoidEscape: true,
                    allowTemplateLiterals: true
                },
            ],
        },
    },
];
