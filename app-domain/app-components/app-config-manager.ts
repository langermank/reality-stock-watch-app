import * as path from 'path';
import * as dotenv from 'dotenv';
import type { ClientConfig } from 'pg';
import type { ApiClientConfigType } from '../data-layer/persistence/api-client';

export type TargetEnvironment = 'prod' | 'dev' | 'local-dev';

export class AppConfigManager {
  _targetEnvironment: TargetEnvironment;
  _envFilePath: string;
  _dbConfig: ClientConfig | undefined;
  _apiClientConfig: ApiClientConfigType | undefined;

  get dbConfig() {
    return this._dbConfig;
  }

  get apiClientConfig() {
    return this._apiClientConfig;
  }

  constructor(targetEnvironment: TargetEnvironment = 'dev') {
    this._targetEnvironment = targetEnvironment;
    this._envFilePath = path.resolve(process.cwd(), `${targetEnvironment}.env`);
  }

  load() {
    const result = dotenv.config({
      path: this._envFilePath,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    const config = result.parsed!;
    this._dbConfig = {
      host: config['PG_HOST'],
      port: +config['PG_PORT'],
      database: config['PG_DATABASE'],
      user: config['PG_USER'],
      password: config['PG_PSWD'],
    };

    this._apiClientConfig = {
      endpoint: config['SB_REST_ENDPOINT'],
      secretKey: config['SB_SERVICE_SECRET'],
    };
  }
}
