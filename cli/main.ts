import { CliApp } from './cli-app';
import { ConfigManager } from './config-manager';

(async () => {
  const configManager = new ConfigManager('dev');
  configManager.load();

  console.log(JSON.stringify(configManager));
  return;
  const app = new CliApp(configManager);

  await app.boot();
  await app.run();
})();
