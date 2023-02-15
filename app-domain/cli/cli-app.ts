import yargs from 'yargs';
import type { Arguments } from 'yargs';
import type { PathRouter } from '@krhkt/path-router';
import { hideBin } from 'yargs/helpers';

import type { AppConfigManager } from '../app-components/app-config-manager';
import { ApiClient } from '../data-layer/persistence/api-client';
import { Database } from '../data-layer/persistence/database';
import { cliPathRouter } from './path-router-config';

export class CliApp {
  db: Database;
  apiClient: ApiClient;
  _pathRouter: PathRouter;
  _isBooted: boolean = false;

  constructor(config: AppConfigManager) {
    this.db = new Database(config.dbConfig!);
    this.apiClient = new ApiClient(config.apiClientConfig!);

    this._pathRouter = cliPathRouter({
      app: this,
      db: this.db,
      apiClient: this.apiClient,
    });
  }

  async boot() {
    if (this._isBooted) return this;

    await this.db.connect();
    await this.apiClient.init();

    this._isBooted = true;

    return this;
  }

  async run() {
    yargs(hideBin(process.argv)).parse();
    const argv = yargs.argv as Arguments;

    const path = this.getPathFromArgv(argv);

    try {
      await this._pathRouter.executeRoute(path);
    } catch (e: any) {
      console.log(`error executing path (${path}): ${e.message}`);
    }
  }

  getPathFromArgv(argv: Arguments): string {
    if (argv.hasOwnProperty('path')) return argv.path as string;

    return argv._.at(0) as string;
  }
}
