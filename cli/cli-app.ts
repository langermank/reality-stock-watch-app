import { Database } from '../data-layer/persistence/database';

const CLI_NAV_TREE: Readonly<any> = {
  root: {},
};

export class CliApp {
  _db: Database;

  constructor(config: any) {
    this._db = new Database(config);
  }

  async boot() {
    this._db.connect();

    return this;
  }

  async run() {}

  //#region [ Rendering ]
  //#endregion
}
