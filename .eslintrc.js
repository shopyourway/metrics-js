module.exports = {
    plugins: ['mocha'],
    extends: ['airbnb-base'],
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
        'mocha': true
    },
    globals: {
        fetch: true
    }
};
