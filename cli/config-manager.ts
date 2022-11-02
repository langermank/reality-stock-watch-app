import type { ClientConfig } from 'pg';
import * as path from 'path';
import * as dotenv from 'dotenv';

export type TargetEnvironemnt = 'prod' | 'dev';

export class ConfigManager {
  get db() {
    return this._dbConfig;
  }

  _targetEnvironment: TargetEnvironemnt;
  _envFilePath: string;
  _dbConfig: ClientConfig | undefined;
  _cloudConfig: any;

  constructor(targetEnvironment: TargetEnvironemnt = 'dev') {
    this._targetEnvironment = targetEnvironment;
    this._envFilePath = path.resolve(process.cwd(), `${targetEnvironment}.env`);
  }

  load() {
    const result = dotenv.config({ path: this._envFilePath });

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

    this._cloudConfig = {
      endpoint: config['SB_REST_ENDPOINT'],
      secretKey: config['SB_SERVICE_SECRET'],
    };
  }
}
