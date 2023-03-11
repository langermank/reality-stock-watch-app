import * as fs from "fs/promises";
import * as path from "path";
import type { Core } from "../entities/_types/core";
import type { Database } from "../persistence/database";
import { Migration, filenameToMigrationName, migrationNameToFilename } from "../entities/migration";

const schemaName = "public";
const tableName = "_core_migrations";
const fullTableReference = `${schemaName}.${tableName}`;

const migrationFolder = "./app-domain/data-layer/migrations";
const droptableFiles = [
  "./app-domain/data-layer/sql-scripts/drop-all-tables_with-schemas.sql",
  "./app-domain/data-layer/sql-scripts/drop-all-tables_no-schemas.sql",
];

const checkPublicSchemaQuery = `SELECT schema_name
FROM information_schema.schemata
WHERE schema_name = '${schemaName}';`;

const checkMigrationTableQuery = `SELECT table_name
FROM Information_schema.tables
WHERE table_schema = '${schemaName}' and table_name= '${tableName}';`;

const insertQuery = `INSERT INTO ${fullTableReference}(
  "name", "executedAt", "hash", "queryContent"
) VALUES ($1, $2, $3, $4) RETURNING *`;

const readByNameQuery = `SELECT * FROM ${fullTableReference} where name = $1`;

export class MigrationRepository {
  _tableName = fullTableReference;
  _db: Database;
  _verbose: boolean;

  constructor(db: Database, verbose = false) {
    this._db = db;
    this._verbose = verbose;
  }

  async getByName(migrationName: string): Promise<Core.DbMigration | null> {
    const result = await this._db.query(readByNameQuery, migrationName);

    if (!result?.rows.length) return null;

    const row = result.rows[0] as unknown;
    return new Migration(row as Core.DbMigration);
  }

  async hasInitialMigration(): Promise<boolean> {
    const schemaResult = await this._db.query(checkPublicSchemaQuery);
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

    if (this._verbose) console.log(`Reading ${name} migration contents...`);
    const queryContent = await this._executeSqlFile(fullpath);

    const migration = new Migration({
      name,
      executedAt: new Date(),
      queryContent,
    });
    migration.setHashByContent(queryContent);

    if (this._verbose) console.log(`Saving migration ${name}`);
    await this.insert(migration);

    return migration;
  }

  async insert(migration: Core.DbMigration): Promise<void> {
    const result = await this._db.query(
      insertQuery,
      migration.name,
      migration.executedAt,
      migration.hash,
      migration.queryContent
    );

    if (result === null) {
      throw new Error(`Error saving migration ${migration.name}`);
    }

    const row = result.rows[0] as unknown as Core.DbMigration;
    migration.id = row.id;
  }

  async dropTables(): Promise<void> {
    const filesToExecute = droptableFiles.map((filename) => path.join(process.cwd(), filename));

    if (this._verbose) console.log("Dropping tables...");

    for (const fullpath of filesToExecute) {
      if (this._verbose) console.log(`Reading ${fullpath}...`);
      await this._executeSqlFile(fullpath);
    }

    if (this._verbose) console.log("All table dropped successfully!");
  }

  async _executeSqlFile(fullpath: string) {
    const queryContent = (await fs.readFile(fullpath)).toString();

    if (this._verbose) console.log(queryContent);

    await this._db.atomicQuery(queryContent);

    return queryContent;
  }
}
