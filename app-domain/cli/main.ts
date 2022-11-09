import { CliApp } from './cli-app';
import { AppConfigManager } from '../app-components/app-config-manager';
import { Database } from '../data-layer/persistence/database';

(async () => {
  const configManager = new AppConfigManager('local-dev');
  configManager.load();

  //console.log(JSON.stringify(configManager));

  const db = new Database(configManager.dbConfig!);
  console.log(await db.applyMissingMigrations());
  return;
  //await db.connect();

  const result = await db.checkInitialMigration();
  console.log(result);

  await db.close();
  return;
  const app = new CliApp(configManager);

  await app.boot();
  await app.run();
})();
