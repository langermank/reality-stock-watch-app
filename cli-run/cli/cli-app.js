"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CliApp = void 0;
const database_1 = require("../data-layer/persistence/database");
const CLI_NAV_TREE = {
    root: {},
};
class CliApp {
    constructor(config) {
        this._db = new database_1.Database(config);
    }
    async boot() {
        this._db.connect();
        return this;
    }
    async run() { }
}
exports.CliApp = CliApp;
