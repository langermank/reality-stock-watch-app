const atImport = require('postcss-import');
const atImportGlob = require('postcss-import-ext-glob');
const autoprefixer = require('autoprefixer');
const presetEnv = require('postcss-preset-env');
const mixins = require('postcss-mixins');
const path = require('path');
const postcssCustomMedia = require('postcss-custom-media');

module.exports = {
  plugins: [
    atImportGlob(),
    atImport(),
    autoprefixer(),
    mixins({
      mixinsDir: path.join(__dirname, 'styles/mixins'),
    }),
    postcssCustomMedia(),
    presetEnv({
      stage: 3,
      // https://preset-env.cssdb.org/
      features: {
        'nesting-rules': true,
        'has-pseudo-class': true,
      },
    }),
  ],
};
