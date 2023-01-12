module.exports = {
    root: true,
    parserOptions: {
        sourceType: 'module',
        ecmaVersion: 13,
        ecmaFeatures: {
            jsx: true,
        },
    },
    env: {
        browser: true,
        commonjs: true,
        es6: true,
        es2021: true,
    },
    extends: [
        'eslint:recommended',
        'eslint-config-prettier',
        'plugin:sonarjs/recommended',
        'plugin:react/recommended',
        'react-app',
    ],
    rules: {
        'react-hooks/rules-of-hooks': 2,
        'linebreak-style': [2, 'unix'],
        quotes: [2, 'single', 'avoid-escape'],
        semi: [2, 'always'],
        'max-len': [1, 120, 2, {ignoreUrls: true}],
        'no-trailing-spaces': 2,
        'no-multi-spaces': 2,
        'array-bracket-spacing': 2,
        'keyword-spacing': [2, {after: true, before: true}],
        'max-depth': [2, 7],
        'max-statements': [2, 133],
        complexity: [2, 45],
        'no-eval': 2,
        'no-underscore-dangle': 0, // Use _ extensively
        'no-loop-func': 2,
        'no-floating-decimal': 2,
        eqeqeq: [2, 'smart'],
        'new-cap': 2,
        'space-infix-ops': 2,
        'comma-dangle': [2, 'always-multiline'],
        curly: [2, 'multi', 'consistent'],
        'no-constant-condition': [2, {checkLoops: false}],
        'react/react-in-jsx-scope': 0, // DOesn;t play well with @forge/ui
        'react/prop-types': 0, // No plans on adding validators
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
};
