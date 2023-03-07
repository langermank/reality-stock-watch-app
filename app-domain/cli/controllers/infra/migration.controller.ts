import type { Core } from '../../../data-layer/entities/_types/core';
import { MigrationRepository } from '../../../data-layer/repositories/migration-repository';
import { BaseController } from '../base.controller';

export class MigrationController extends BaseController {
  async applyAll(params: any = null) {
    console.log('apply all migration action');
    console.log(params);

    const migrationRepository = new MigrationRepository(this._app.db);
    const migrationsToApply = await migrationRepository.findNotAppliedMigration();

    for (const migration of migrationsToApply) {
      console.log(migration);
      await migrationRepository.applyMigrationByName(migration);
    }

    return true;
  }
}
