import type { Game as GameNs } from "../entities/_types/game";
import { BaseRepository } from "./base.repository";

export class GameSeasonCycleRepository extends BaseRepository<GameNs.GameSeasonCycle> {
  _resourceName = "game_season_cycles";
}
