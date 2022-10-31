module.exports = {
    requirePragma: false,
    tabWidth: 2,
    useTabs: false,
    overrides: [
        {
            files: '*.ts',
            options: {
                semi: true,
                singleQuote: true,
                quoteProps: 'as-needed',
                trailingComma: 'all',
            },
        }, {
            files: '*.js',
            options: {
                semi: true,
                singleQuote: true,
                quoteProps: 'as-needed',
                trailingComma: 'all',
            },
        }, {
            files: '*.html',
            options: {
                bracketSameLine: false,
                arrowParens: 'always', 
            }
        }, {
            files: '.prettierrc.js',
            options: {
                parser: 'js',
            },
        }
    ],
};
