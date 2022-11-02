"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const pg_1 = require("pg");
class Database {
    constructor(config) {
        this._connectionConfig = config;
    }
    async connect() {
        this._client = new pg_1.Client(this._connectionConfig);
        await this._client.connect();
    }
    async migrate(migrationName) { }
    async atomicQuery(query, ...params) {
        if (!this._client)
            return null;
        try {
            await this._client.query('begin');
            const result = await this._client.query(query, params);
            await this._client.query('commit');
            return result;
        }
        catch (e) {
            await this._client.query('rollback');
            throw e;
        }
    }
    async query(query, ...params) {
        if (!this._client)
            return null;
        const result = await this._client.query(query, params);
        return result;
    }
    async close() {
        var _a;
        await ((_a = this._client) === null || _a === void 0 ? void 0 : _a.end());
    }
}
exports.Database = Database;
