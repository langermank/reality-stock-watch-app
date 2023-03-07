import { MigrationRepository } from '../../../data-layer/repositories/migration-repository';
import { BaseController } from '../base.controller';

export class MigrationController extends BaseController {
  async applyAll(params: any = null) {
    const migrationRepository = new MigrationRepository(this._app.db);

    console.log('Checking applied migrations...');
    const migrationsToApply = await migrationRepository.findNotAppliedMigration();
    if (!migrationsToApply.length) {
      console.log('Database is up-to-date. No migration required.');
      return;
    }

    console.log(`${migrationsToApply.length} migration(s) to apply...`);

    for (const migration of migrationsToApply) {
      console.log(`Applying ${migration}...`);
      await migrationRepository.applyMigrationByName(migration);
      console.log(`Migration applied successfully!\n`);
    }
  }
}
