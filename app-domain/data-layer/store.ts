import type { ApiClient } from "./persistence/api-client";
import { RealityShowRepository } from "./repositories/reality-show.repository";
import { RealityShowSeriesRepository } from "./repositories/reality-show-series.repository";
import { RealityShowSeasonRepository } from "./repositories/reality-show-season.repository";
import { ParticipantRepository } from "./repositories/participant.repository";
import { PersonRepository } from "./repositories/person.repository";
import { PublicProfileRepository } from "./repositories/public-profile.repository";
import { GameRepository } from "./repositories/game.repository";
import { GameSeasonRepository } from "./repositories/game-season.repository";
import { GameSeasonCycleRepository } from "./repositories/game-season-cycle.repository";

export class Store {
  _apiClient: ApiClient;
  _repositories: Record<string, any>;

  constructor(apiClient: ApiClient) {
    this._apiClient = apiClient;
    this._repositories = {};
  }

  //#region [ Core ]
  get persons() {
    return this._fetchRepository("persons", PersonRepository) as PersonRepository;
  }

  get publicProfiles() {
    return this._fetchRepository(
      "publicProfiles",
      PublicProfileRepository
    ) as PublicProfileRepository;
  }
  //#endregion

  //#region [ Show ]
  get shows() {
    return this._fetchRepository("shows", RealityShowRepository) as RealityShowRepository;
  }

  get showSeries() {
    return this._fetchRepository(
      "showSeries",
      RealityShowSeriesRepository
    ) as RealityShowSeriesRepository;
  }

  get showSeasons() {
    return this._fetchRepository(
      "showSeasons",
      RealityShowSeasonRepository
    ) as RealityShowSeasonRepository;
  }

  get showParticipants() {
    return this._fetchRepository(
      "showParticipants",
      ParticipantRepository
    ) as ParticipantRepository;
  }
  //#endregion

  //#region [ Game ]
  get games() {
    return this._fetchRepository("games", GameRepository) as GameRepository;
  }

  get gameSeasons() {
    return this._fetchRepository("gameSeasons", GameSeasonRepository) as GameSeasonRepository;
  }

  get gameSeasonCycles() {
    return this._fetchRepository(
      "gameSeasonCycles",
      GameSeasonCycleRepository
    ) as GameSeasonRepository;
  }
  //#endregion

  _fetchRepository(name: string, repositoryClass: any) {
    if (!this._repositories[name]) {
      this._repositories[name] = new repositoryClass(this._apiClient);
    }
    return this._repositories[name];
  }
}
