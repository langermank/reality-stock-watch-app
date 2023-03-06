import type { AppConfigManager } from './app-components/app-config-manager';
import { Authenticator } from './app-components/authenticator';
import { ApiClient } from './data-layer/persistence/api-client';

export class App {
  config: AppConfigManager;
  apiClient: ApiClient;
  authenticator: Authenticator;
  _isBooted: boolean = false;

  constructor(config: AppConfigManager) {
    this.config = config;
    this.apiClient = new ApiClient(config.apiClientConfig!);
    this.authenticator = new Authenticator(this.apiClient);
  }

  async boot() {
    if (this._isBooted) return this;

    await this.apiClient.init();
    this._isBooted = true;

    return this;
  }

  async getAuthenticator() {
    await this.boot();
    return this.authenticator;
  }
}
