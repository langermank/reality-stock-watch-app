import type { ApiClient } from './persistence/api-client';
import { RealityShowRepository } from './repositories/reality-show.repository';
import { RealityShowSeriesRepository } from './repositories/reality-show-series.repository';
import { RealityShowSeasonRepository } from './repositories/reality-show-season.repository';

export class Store {
  _apiClient: ApiClient;
  _repositories: Record<string, any>;

  constructor(apiClient: ApiClient) {
    this._apiClient = apiClient;
    this._repositories = {};
  }

  //#region [ Show ]
  get shows() {
    return this._fetchRepository('shows', RealityShowRepository) as RealityShowRepository;
  }

  get showSeries() {
    return this._fetchRepository(
      'showSeries',
      RealityShowSeriesRepository,
    ) as RealityShowSeriesRepository;
  }

  get showSeasons() {
    return this._fetchRepository(
      'showSeasons',
      RealityShowSeasonRepository,
    ) as RealityShowSeasonRepository;
  }
  //#endregion

  _fetchRepository(name: string, repositoryClass: any) {
    if (!this._repositories[name]) {
      this._repositories[name] = new repositoryClass(this._apiClient);
    }
    return this._repositories[name];
  }
}
