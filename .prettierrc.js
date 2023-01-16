module.exports = {
  requirePragma: false,
  tabWidth: 2,
  useTabs: false,
  printWidth: 100,
  jsxSingleQuote: true,
  overrides: [
    {
      files: '*.ts, *.tsx',
      options: {
        tabWidth: 2,
        semi: true,
        singleQuote: true,
        jsxSingleQuote: false,
        quoteProps: 'as-needed',
        trailingComma: 'all',
      },
    },
    {
      files: '*.js',
      options: {
        semi: true,
        singleQuote: true,
        quoteProps: 'as-needed',
        trailingComma: 'all',
      },
    },
    {
      files: '*.html',
      options: {
        bracketSameLine: false,
        arrowParens: 'always',
      },
    },
  ],
};
