import { App } from '../../app-domain/app';
import {
  AppConfigManager,
  TargetEnvironments,
} from '../../app-domain/app-components/app-config-manager';

// fetching target environment
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

// instantiating app dependencies
const configManager = new AppConfigManager(targetEnvironment);
configManager.load();

const appInstance = new App(configManager);

export const getApp = async () => {
  return await appInstance.boot();
};
