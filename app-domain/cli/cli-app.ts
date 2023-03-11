import yargs from "yargs";
import type { Arguments } from "yargs";
import type { PathRouter } from "@krhkt/path-router";
import { hideBin } from "yargs/helpers";

import { App } from "../app";
import type { AppConfigManager } from "../app-components/app-config-manager";
import { Database } from "../data-layer/persistence/database";
import { cliPathRouter } from "./path-router-config";

export class CliApp extends App {
  db: Database;
  _pathRouter: PathRouter;

  constructor(config: AppConfigManager) {
    super(config);
    this.db = new Database(config.dbConfig!);

    this._pathRouter = cliPathRouter(this);
  }

  async boot() {
    if (this._isBooted) return this;

    super.boot();
    await this.db.connect();

    return this;
  }

  async run() {
    try {
      await this.boot();
    } catch (e) {
      console.error(`Error initializing the application: ${(e as Error).message}`);
      return;
    }

    yargs(hideBin(process.argv)).parse();
    const argv = yargs.argv as Arguments;

    const path = this.getPathFromArgv(argv);
    //const params = this.getParamsFromArgv(argv);

    try {
      await this._pathRouter.executeRoute(path);
    } catch (e: any) {
      console.error(`Error executing path (${path}): ${e.message}`);
    }
  }

  getPathFromArgv(argv: Arguments): string {
    if (argv.hasOwnProperty("path")) return argv.path as string;

    return argv._.at(0) as string;
  }

  getParamsFromArgv(argv: Arguments): Array<string | number> {
    return argv._.slice(1);
  }
}
