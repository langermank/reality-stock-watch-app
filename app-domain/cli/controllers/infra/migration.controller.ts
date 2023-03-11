import type { CliApp } from '../../cli-app';
import { TargetEnvironments } from '../../../../app-domain/app-components/app-config-manager';
import { MigrationRepository } from '../../../data-layer/repositories/migration-repository';
import { BaseController } from '../base.controller';

export class MigrationController extends BaseController {
  migrationRepository;

  constructor(app: CliApp) {
    super(app);

    this.migrationRepository = new MigrationRepository(this._app.db);
  }

  async dropAllTables() {
    // checking if in PROD
    const environment = this._app.getEnvironment();
    if (environment === TargetEnvironments.production) {
      console.warn('Production environemnt detected!');
      console.warn('This action will drop all application from the database.');
      console.warn(">> Only proceed if you know what you're doing <<");
      const answer = prompt('Type YES to continue, or anything else to exit: ');
      if (answer !== 'YES') return;
    }

    await this.migrationRepository.dropTables();
  }

  async applyAll(params: any = null) {
    console.log('Checking applied migrations...');
    const migrationsToApply = await this.migrationRepository.findNotAppliedMigration();
    if (!migrationsToApply.length) {
      console.log('Database is up-to-date. No migration required.');
      return;
    }

    console.log(`${migrationsToApply.length} migration(s) to apply...`);

    for (const migration of migrationsToApply) {
      console.log(`Applying ${migration}...`);
      await this.migrationRepository.applyMigrationByName(migration);
      console.log(`Migration applied successfully!\n`);
    }
  }
}
