const atImport = require("postcss-import");
const atImportGlob = require("postcss-import-ext-glob");
const autoprefixer = require("autoprefixer");
const presetEnv = require("postcss-preset-env");

module.exports = {
  plugins: [
    atImportGlob(),
    atImport(),
    autoprefixer(),
    presetEnv({
      stage: 3,
      // https://preset-env.cssdb.org/
      features: {
        "nesting-rules": true,
        "has-pseudo-class": true,
      },
    }),
  ],
};
