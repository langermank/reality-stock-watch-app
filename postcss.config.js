const atImport = require("postcss-import");
const atImportGlob = require("postcss-import-ext-glob");
const autoprefixer = require("autoprefixer");

module.exports = {
  plugins: [atImportGlob(), atImport(), autoprefixer()],
};
