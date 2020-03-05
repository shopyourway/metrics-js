module.exports = {
    plugins: ['jest'],
    extends: ['airbnb-base', 'plugin:jest/recommended'],
    rules: {
        'arrow-parens': [2, "as-needed"],
        'no-underscore-dangle': 0,
        'no-plusplus': 0,
        'no-use-before-define': 0,
        camelcase: 0,
        'no-restricted-syntax': [
            'error',
            'ForInStatement',
            'LabeledStatement',
            'WithStatement'
        ]
    },
    env: {
        node: true,
        'jest/globals': true
    },
    globals: {
        fetch: true
    }
};
