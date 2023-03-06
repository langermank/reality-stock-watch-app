import { RealityShowRepository } from '../data-layer/repositories/reality-show.repository';
import type { ApiClient } from '../data-layer/persistence/api-client';

export class RealityShowService {
  _api: ApiClient;
  _repository: RealityShowRepository;

  constructor(api: ApiClient) {
    this._api = api;
    this._repository = new RealityShowRepository(api);
  }

  async findByUuid(uuid: string) {
    if (!uuid.trim()) return null;

    // TODO: check permissions

    return await this._repository.fetchByUuid(uuid);
  }
}
