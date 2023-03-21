import type { AppConfigManager } from "./app-components/app-config-manager";
import { Store } from "./data-layer/store";
import { Authenticator } from "./app-components/authenticator";
import { ApiClient } from "./data-layer/persistence/api-client";

export class App {
  config: AppConfigManager;
  apiClient: ApiClient;
  store: Store;
  authenticator: Authenticator;
  _isBooted: boolean = false;

  constructor(config: AppConfigManager) {
    this.config = config;
    this.apiClient = new ApiClient(config.apiClientConfig!);
    this.store = new Store(this.apiClient);
    this.authenticator = new Authenticator(this.apiClient);
  }

  async boot() {
    if (this._isBooted) return this;

    await this.apiClient.init();
    this._isBooted = true;

    return this;
  }

  getEnvironment() {
    return this.config._targetEnvironment;
  }

  async getAuthenticator() {
    await this.boot();
    return this.authenticator;
  }

  async getStore() {
    await this.boot();
    return this.store;
  }

  getWebConfig() {
    return this.config?._webConfig;
  }

  setUserAuth(username: string, userToken: string) {
    // TODO: check if this is actually necessary by loging in two different users and checking how remix deals with it
  }
}
