import type { Database } from '../persistence/database';

export class MigrationRepository {
  _db: Database;

  constructor(db: Database) {
    this._db = db;
  }
}
