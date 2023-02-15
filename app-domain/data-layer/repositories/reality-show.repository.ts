/// <reference path="../entities/_types/core.d.ts" />
import type { ApiClient } from '../persistence/api-client';

export class RealityShowRepository {
  _resourceName = 'realityShow';

  _apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this._apiClient = apiClient;
  }

  async fetchByUuid(uuid: string) {
    return await this._apiClient.readSingle(this._resourceName, uuid);
  }
}
