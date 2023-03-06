import type { CliApp } from '../cli-app';

export class BaseController {
  _app;

  constructor(app: CliApp) {
    this._app = app;
  }
}
