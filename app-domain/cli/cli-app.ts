import type { AppConfigManager } from '../app-components/app-config-manager';
import type { PathRouter } from '../app-components/path-router/path-router';
import { ApiClient } from '../data-layer/persistence/api-client';
import { Database } from '../data-layer/persistence/database';

export class CliApp {
  _db: Database;
  _apiClient: ApiClient;
  _pathRouter: PathRouter;

  constructor(config: AppConfigManager) {
    this._db = new Database(config.dbConfig!);
    this._apiClient = new ApiClient(config.apiClientConfig!);
  }

  async boot() {
    this._db.connect();

    return this;
  }

  async run() {}

  //#region [ Rendering ]
  //#endregion
}
