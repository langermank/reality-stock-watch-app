import { App } from "../../app-domain/app";
import {
  AppConfigManager,
  TargetEnvironments,
} from "../../app-domain/app-components/app-config-manager";
import { getSessionStorage } from "./session-storage";

// fetching target environment
let targetEnvironment = TargetEnvironments.development;
if (process.env.ENVIRONMENT) {
  if (Object.values(TargetEnvironments).includes(process.env.ENVIRONMENT)) {
    targetEnvironment = process.env.ENVIRONMENT!;
  } else {
    console.warn(
      `ENVIRONMENT value invalid: '${process.env.ENVIRONMENT}': falling back to ${targetEnvironment}`
    );
  }
}

// instantiating app dependencies
const configManager = new AppConfigManager(targetEnvironment);
configManager.load();

const appInstance = new App(configManager);

let app: App | null = null;
export const getAppDomain = async () => {
  if (app) return app;

  app = await appInstance.boot();
  const { getSession } = await getSessionStorage(app.getWebConfig()?.sessionMasterSecret);

  const session = await getSession();
  const userToken = session.get("token") || "";
  const username = session.get("username") || "";
  app.setUserAuth(username, userToken);

  return app;
};
