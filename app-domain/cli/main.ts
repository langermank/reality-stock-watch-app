import { CliApp } from './cli-app';
import { AppConfigManager, TargetEnvironments } from '../app-components/app-config-manager';

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

  process.exit(0);
})();
