import { createClient, SupabaseClient } from '@supabase/supabase-js';

export type ApiClientConfigType = Readonly<{
  endpoint: string;
  secretKey: string;
}>;

export class ApiClient {
  _config: ApiClientConfigType;
  _client: SupabaseClient | undefined;

  constructor(config: ApiClientConfigType) {
    this._config = config;
  }

  async init() {
    this._client = createClient(this._config.endpoint, this._config.secretKey);

    return this;
  }
}
