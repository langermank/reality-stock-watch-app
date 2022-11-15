/// <reference path="../entities/_types/core.d.ts" />
import * as path from 'path';
import * as fs from 'fs/promises';
import type { Database } from '../persistence/database';
import { Migration, filenameToMigrationName, migrationNameToFilename } from '../entities/migration';

const schemaName = 'core';
const tableName = '_migration';
const fullTableReference = `${schemaName}.${tableName}`;

const migrationFolder = './app-domain/data-layer/migrations';
const checkCoreSchemaQuery = `SELECT schema_name
FROM information_schema.schemata
WHERE schema_name = '${schemaName}';`;
const checkMigrationTableQuery = `SELECT table_name
FROM Information_schema.tables
WHERE table_schema = '${schemaName}' and table_name= '${tableName}';`;
const insertQuery = `INSERT INTO ${fullTableReference}(
  "name", "executedAt", "hash", "queryContent"
) VALUES ($1, $2, $3, $4) RETURNING *`;

export class MigrationRepository {
  _tableName = fullTableReference;
  _db: Database;

  constructor(db: Database) {
    this._db = db;
  }

  async getByName(migrationName: string): Promise<Core.DbMigration | null> {
    const result = await this._db.query(
      `select * from ${this._tableName} where name = ${migrationName}`,
    );

    if (!result?.rows.length) return null;

    const row = result.rows[0] as unknown;
    return new Migration(row as Core.DbMigration);
  }

  async hasInitialMigration(): Promise<boolean> {
    const schemaResult = await this._db.query(checkCoreSchemaQuery);
    if (!schemaResult?.rows.length) return false;

    const tableResult = await this._db.query(checkMigrationTableQuery);
    return !!tableResult?.rows.length;
  }

  async findNotAppliedMigration(): Promise<any> {
    const migrationsPath = path.join(process.cwd(), migrationFolder);
    const allMigrations = (await fs.readdir(migrationsPath)).map(filenameToMigrationName).sort();

    const hasInitialMigration = await this.hasInitialMigration();
    const notAppliedMigrations: Array<string> = [];
    for (const migration of allMigrations) {
      if (hasInitialMigration && (await this.getByName(migration))) continue;

      notAppliedMigrations.push(migration);
    }

    return notAppliedMigrations;
  }

  async applyMigrationByName(name: string) {
    const filename = migrationNameToFilename(name);
    const fullpath = path.join(process.cwd(), migrationFolder, filename);

    console.log(`Applying migration ${name}`);
    const queryContent = (await fs.readFile(fullpath)).toString();

    console.log(queryContent);

    await this._db.atomicQuery(queryContent);
    const migration = new Migration({
      name,
      executedAt: new Date(),
      queryContent,
    });
    migration.setHashByContent(queryContent);

    console.log(`Saving migration ${name}`);
    await this.insert(migration);
    return migration;
  }

  async insert(migration: Core.DbMigration): Promise<void> {
    const result = await this._db.query(insertQuery, [
      migration.name,
      migration.executedAt,
      migration.hash,
      migration.queryContent,
    ]);

    if (result === null) {
      throw new Error(`Error saving migration ${migration.name}`);
    }

    const row = result.rows[0] as unknown as Core.DbMigration;
    migration.id = row.id;
  }
}
