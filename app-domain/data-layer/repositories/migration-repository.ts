/// <reference path="../entities/_types/core.d.ts" />
import type { Database } from '../persistence/database';

export class MigrationRepository {
  _tableName = 'core._migration';
  _db: Database;

  constructor(db: Database) {
    this._db = db;
  }

  async getByName(migrationName: string): Promise<Core.DbMigration | null> {
    const result = await this._db.query(
      `select * from ${this._tableName} where name = ${migrationName}`,
    );

    if (!result?.rows.length) return null;

    return null;
    // const row = result.rows[0] as any;
    // return {
    //   row.id,
    //   row.executedAt,
    //   row.name,
    //   row.hash,
    //   row.queryContent,
    // } as Core.DbMigration;
  }

  async insert(): Promise<void> {}
}
