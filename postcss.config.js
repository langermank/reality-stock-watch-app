const atImport = require("postcss-import");
const atImportGlob = require("postcss-import-ext-glob");
// const autoprefixer = require("autoprefixer");
// const presetEnv = require("postcss-preset-env");

module.exports = {
  plugins: [
    atImportGlob(),
    atImport(),
    // presetEnv({
    //   stage: 3,
    //   // https://preset-env.cssdb.org/
    //   features: {
    //     "nesting-rules": true,
    //     "has-pseudo-class": true,
    //   },
    // }),
  ],
};

// const path = require("path");

// module.exports = {
//   plugins: [
//     require("postcss-import-ext-glob"),
//     require("postcss-import"),
//     // require("postcss-mixins")({
//     //   mixinsDir: path.join(__dirname, "./lib/postcss_mixins/"),
//     // }),
//     require("postcss-preset-env")({
//       stage: 3,
//       // https://preset-env.cssdb.org/
//       features: {
//         "nesting-rules": true,
//         "has-pseudo-class": true,
//       },
//     }),
//     // require("cssnano"),
//   ],
// };
