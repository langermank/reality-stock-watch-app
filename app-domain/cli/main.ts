import { CliApp } from './cli-app';
import { AppConfigManager, TargetEnvironments } from '../app-components/app-config-manager';
import { Database } from '../data-layer/persistence/database';
import { MigrationRepository } from '../data-layer/repositories/migration-repository';

(async () => {
  console.log('booting cli app...');

  let targetEnvironment = TargetEnvironments.development;
  if (process.env.ENVIRONMENT) {
    if (Object.values(TargetEnvironments).includes(process.env.ENVIRONMENT)) {
      targetEnvironment = process.env.ENVIRONMENT!;
    } else {
      console.warn(
        `ENVIRONMENT value invalid: '${process.env.ENVIRONMENT}': falling back to ${targetEnvironment}`,
      );
    }
  }

  const configManager = new AppConfigManager(targetEnvironment);
  configManager.load();

  const app = new CliApp(configManager);
  await app.run();

  ////console.log(JSON.stringify(configManager));

  //const db = new Database(configManager.dbConfig!);
  //await db.connect();
  //const migrationRepository = new MigrationRepository(db);
  //const migrationsToApply = await migrationRepository.findNotAppliedMigration();

  //for (const migration of migrationsToApply) {
  //  await migrationRepository.applyMigrationByName(migration);
  //}

  //return;
  //await db.connect();

  //  const result = await db.checkInitialMigration();
  //  console.log(result);
  //
  //  await db.close();
  //  return;
  //  const app = new CliApp(configManager);
  //
  //  await app.boot();
  //  await app.run();
})();
