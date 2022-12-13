import type { AppConfigManager } from '../app-components/app-config-manager';
import type { PathRouter } from '../app-components/path-router_old/path-router';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { ApiClient } from '../data-layer/persistence/api-client';
import { Database } from '../data-layer/persistence/database';
import { cliPathRouter } from './path-router-config';

export class CliApp {
  _db: Database;
  _apiClient: ApiClient;
  _pathRouter: PathRouter;

  constructor(config: AppConfigManager) {
    this._db = new Database(config.dbConfig!);
    this._apiClient = new ApiClient(config.apiClientConfig!);
    this._pathRouter = cliPathRouter();
  }

  async boot() {
    await this._db.connect();

    return this;
  }

  async run() {
    yargs(hideBin(process.argv)).parse();
    this._pathRouter.executeRoute();
  }

  //#region [ Rendering ]
  //#endregion
}
