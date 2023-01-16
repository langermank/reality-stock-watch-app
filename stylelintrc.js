module.exports = {
  extends: ['stylelint-config-standard', 'stylelint-config-prettier'],
  plugins: ['stylelint-selector-bem-pattern'],
  rules: {
    'plugin/selector-bem-pattern': {
      componentName: '[A-Z]+',
      componentSelectors: {
        initial: '^\\.{componentName}(?:-[a-z]+)?$',
        combined: '^\\.combined-{componentName}-[a-z]+$',
      },
      utilitySelectors: '^\\.util-[a-z]+$',
    },
    'selector-class-pattern': null,
    'custom-property-pattern': null,
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['mixin', 'define-mixin', 'import-glob'],
      },
    ],
    'hue-degree-notation': 'number',
    'color-hex-length': 'long',
    'declaration-block-no-redundant-longhand-properties': null,
  },
};
