import type {
  ClientConfig as DbConfigType,
  QueryArrayConfig,
  QueryArrayResult,
} from 'pg';
import { Client } from 'pg';
import * as fs from 'fs/promises';
import * as path from 'path';

const migrationFolder = './app-domain/data-layer/migrations';
const initialMigrationFile = '000-initial-db-structure.sql';
const checkCoreSchemaQuery = `SELECT schema_name
FROM information_schema.schemata
WHERE schema_name = 'core';`;
const checkMigrationTableQuery = `SELECT table_name
FROM Information_schema.tables
WHERE table_schema = 'core' and table_name= '_migration';`;

export class Database {
  _connectionConfig: DbConfigType;
  _client: Client | undefined;
  _isConnected = false;

  get isConnected() {
    return this._isConnected;
  }

  constructor(config: DbConfigType) {
    this._connectionConfig = config;
  }

  async connect() {
    this._client = new Client(this._connectionConfig);
    await this._client.connect();
    this._isConnected = true;
  }

  async applyMissingMigrations(): Promise<any> {
    const migrationsPath = path.join(process.cwd(), migrationFolder);
    const migrationFiles = (await fs.readdir(migrationsPath)).sort();

    for (const file of migrationFiles) {
      console.log(file);
    }

    return migrationFiles;
  }

  async hasInitialMigration(): Promise<boolean> {
    const schemaResult = await this.query(checkCoreSchemaQuery);
    if (!schemaResult?.rows.length) return false;

    const tableResult = await this.query(checkMigrationTableQuery);
    return !!tableResult?.rows.length;
  }

  async migrate(migrationName: string) {}

  async atomicQuery(
    query: QueryArrayConfig<any> | string,
    ...params: any
  ): Promise<QueryArrayResult<any[]> | null> {
    if (!this._client) return null;

    try {
      await this._client.query('begin');
      const result = await this._client.query(query, params);
      await this._client.query('commit');

      return result;
    } catch (e) {
      await this._client.query('rollback');
      throw e;
    }
  }

  async query(
    query: QueryArrayConfig<any> | string,
    ...params: any
  ): Promise<QueryArrayResult<any[]> | null> {
    if (!this._client) return null;

    const result = await this._client.query(query, params);

    return result;
  }

  async close() {
    await this._client?.end();
  }
}
