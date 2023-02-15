import type { ApiClient } from '../data-layer/persistence/api-client';

export class RealityShowService {
  _api: ApiClient;

  constructor(api: ApiClient) {
    this._api = api;
  }

  findByUuid(uuid: string) {
    if (!uuid.trim()) return null;

    this._api;
  }
}
