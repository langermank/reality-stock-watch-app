import type { ApiClient } from '../persistence/api-client';

export class BaseRepository<T> {
  _resourceName = '';

  _apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this._apiClient = apiClient;
  }

  async fetchByUuid(uuid: string): Promise<T | null> {
    return await this._apiClient.readSingle(this._resourceName, uuid);
  }

  async save(entity: Partial<T>) {
    const error = await this._apiClient.save(this._resourceName, entity);
    if (error) {
      console.error('error saving entity:', error, entity);
    }
  }
}
