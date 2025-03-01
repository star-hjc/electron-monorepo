module.exports = {
    root: true,
    parserOptions: {
        parser: '@typescript-eslint/parser',
        ecmaVersion: 2020,
    },
    env: {
        es6: true,
        browser: true,
        node: true,
    },
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    plugins: ['@typescript-eslint'],

    rules: {
        "@typescript-eslint/ban-ts-comment": 1,
        'no-alert': 2,
        semi: [2, 'always'], // 语句强制分号结尾
        'comma-dangle': [
            2,
            {
                arrays: 'always-multiline',
                objects: 'always-multiline',
                imports: 'always-multiline',
                exports: 'always-multiline',
                functions: 'never',
            },
        ],
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    },
};
