import type { ApiClient } from "../data-layer/persistence/api-client";
import type { App } from "../app";

export class UserService {
  _app: App;
  _api: ApiClient;

  constructor(app: App) {
    this._app = app;
    this._api = app.apiClient;
  }

  async signUp(login: string, password: string) {
    const result = await this._api.auth?.signUp({
      email: login,
      password: password,
    });

    console.log(result);
  }

  signIn(login: string, password: string) {
    const result = this._api.auth?.signIn({
      email: login,
      password: password,
    });

    console.log(result);
  }

  async signOut() {
    const result = await this._api.auth?.signOut();

    console.log(result);
  }
}
