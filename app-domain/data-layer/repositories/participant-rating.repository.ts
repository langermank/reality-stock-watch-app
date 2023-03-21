import type { Game as GameNs } from "../entities/_types/game";
import { BaseRepository } from "./base.repository";

export class ParticipantRatingRepository extends BaseRepository<GameNs.ParticipantRating> {
  _resourceName = "game_participant_ratings";
}
