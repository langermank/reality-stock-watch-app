import type { ApiClient } from '../data-layer/persistence/api-client';

export class Authenticator {
  _apiClient: ApiClient;

  constructor(client: ApiClient) {
    this._apiClient = client;
  }

  async signUp() {}

  async login(email: string, password: string): Promise<any> {
    const { user, session, error } = await this._apiClient!.auth!.signIn({ email, password });

    console.log('supabse login resul');
    console.log(user, session, error);

    // logs the user
    //
    return { user, session, error };
  }

  async logout() {
    return this._apiClient!.auth!.signOut();
  }
}
