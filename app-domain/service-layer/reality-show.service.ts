import type { App } from "../app";

export class RealityShowService {
  _app: App;

  constructor(app: App) {
    this._app = app;
  }

  async findByUuid(uuid: string) {
    if (!uuid.trim()) return null;

    // TODO: check permissions

    return await this._app.store.shows.fetchByUuid(uuid);
  }
}
