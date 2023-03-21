import type { Game as GameNs } from "../entities/_types/game";
import { BaseRepository } from "./base.repository";

export class GameRepository extends BaseRepository<GameNs.Game> {
  _resourceName = "games";
}
