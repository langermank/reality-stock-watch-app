import type { ApiClient } from '../data-layer/persistence/api-client';

export class UsersService {
  _api: ApiClient;

  constructor(api: ApiClient) {
    this._api = api;
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
