import type { Game as GameNs } from "../entities/_types/game";
import { BaseRepository } from "./base.repository";

export class GameSeasonRepository extends BaseRepository<GameNs.GameSeason> {
  _resourceName = "game_seasons";
}
