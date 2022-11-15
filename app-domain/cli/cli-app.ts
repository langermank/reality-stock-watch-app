import type { AppConfigManager } from '../app-components/app-config-manager';
import { ApiClient } from '../data-layer/persistence/api-client';
import { Database } from '../data-layer/persistence/database';

export class CliApp {
  _db: Database;
  _apiClient: ApiClient;

  constructor(config: AppConfigManager) {
    this._db = new Database(config.dbConfig!);
    this._apiClient = new ApiClient(config.apiClientConfig!);
  }

  async boot() {
    this._db.connect();

    return this;
  }

  async run(route) {}

  //#region [ Rendering ]
  //#endregion
}
