import * as path from "path";
import * as dotenv from "dotenv";
import type { ClientConfig as DbConfigType } from "pg";
import type { ApiClientConfigType } from "../data-layer/persistence/api-client";

export const TargetEnvironments = {
  production: "prod",
  development: "dev",
  localDevelopment: "local-dev",
};

export type EnvFileType = {
  PG_HOST: string;
  PG_PORT: string;
  PG_DATABASE: string;
  PG_USER: string;
  PG_PSWD: string;
  SB_REST_ENDPOINT: string;
  SB_SERVICE_SECRET: string;
  REMIX_SESSION_SECRET: string;
};

export type WebConfigType = {
  sessionMasterSecret: string;
};

type TargetEnvironmentKeys = keyof typeof TargetEnvironments;
export type TargetEnvironmentType = typeof TargetEnvironments[TargetEnvironmentKeys];

export class AppConfigManager {
  _targetEnvironment: TargetEnvironmentType;
  _envFilePath: string | undefined;
  _dbConfig: DbConfigType | undefined;
  _apiClientConfig: ApiClientConfigType | undefined;
  _webConfig: WebConfigType | undefined;

  get dbConfig() {
    return this._dbConfig;
  }

  get apiClientConfig() {
    return this._apiClientConfig;
  }

  constructor(targetEnvironment: TargetEnvironmentType = TargetEnvironments.development) {
    this._targetEnvironment = targetEnvironment;
    this._envFilePath = path.resolve(process.cwd(), `${targetEnvironment}.env`);
  }

  load(config: EnvFileType | null = null) {
    if (config === null) {
      const result = dotenv.config({
        path: this._envFilePath,
      });

      if (result.error) {
        throw new Error(
          `Error loading environment file ${this._targetEnvironment}: ${result.error.message}`
        );
      }
      config = result.parsed! as EnvFileType;
    }

    this._dbConfig = {
      host: config.PG_HOST,
      port: Number(config.PG_PORT),
      database: config.PG_DATABASE,
      user: config.PG_USER,
      password: config.PG_PSWD,
    };

    this._apiClientConfig = {
      endpoint: config.SB_REST_ENDPOINT,
      secretKey: config.SB_SERVICE_SECRET,
    };

    this._webConfig = {
      sessionMasterSecret: config.REMIX_SESSION_SECRET,
    };
  }
}
