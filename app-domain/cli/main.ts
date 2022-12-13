import { CliApp } from './cli-app';
import { AppConfigManager } from '../app-components/app-config-manager';
import { Database } from '../data-layer/persistence/database';
import { MigrationRepository } from '../data-layer/repositories/migration-repository';

(async () => {
  const configManager = new AppConfigManager('local-dev');
  configManager.load();
  const app = new CliApp(configManager);
  app.run();

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
