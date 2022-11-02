import type { ClientConfig, QueryArrayConfig, QueryArrayResult } from 'pg';
import { Client } from 'pg';

export class Database {
  _connectionConfig: ClientConfig;
  _client: Client | undefined;

  constructor(config: any) {
    this._connectionConfig = config;
  }

  async connect() {
    this._client = new Client(this._connectionConfig);

    await this._client.connect();
  }

  async migrate(migrationName: string) {}

  async atomicQuery(
    query: QueryArrayConfig<any>,
    ...params: any
  ): Promise<QueryArrayResult<any[]> | null> {
    if (!this._client) return null;

    try {
      await this._client.query('begin');
      const result = await this._client.query(query, params);
      await this._client.query('commit');

      return result;
    } catch (e) {
      await this._client.query('rollback');
      throw e;
    }
  }

  async query(
    query: QueryArrayConfig<any>,
    ...params: any
  ): Promise<QueryArrayResult<any[]> | null> {
    if (!this._client) return null;

    const result = await this._client.query(query, params);

    return result;
  }

  async close() {
    await this._client?.end();
  }
}
