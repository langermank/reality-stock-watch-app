import type { AppConfigManager } from '../app-components/app-config-manager';
import type { PathRouter } from '@krhkt/path-router';
import type { Arguments } from 'yargs';
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
    const argv = yargs.argv as Arguments;

    const path = this.getPathFromArgv(argv);

    console.log(path);
    this._pathRouter.executeRoute(path);
  }

  getPathFromArgv(argv: Arguments): string {
    if (argv.hasOwnProperty('path')) return argv.path as string;

    return argv._.at(0) as string;
  }

  //#region [ Rendering ]
  //#endregion
}
