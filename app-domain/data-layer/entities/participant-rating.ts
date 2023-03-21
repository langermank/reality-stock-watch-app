import type { Game as GameNs } from "./_types/game";
import { EntityRecord } from "./entity";

export class ParticipantRating extends EntityRecord implements GameNs.ParticipantRating {
  rating: number = 0;
  participantId: string | null = null;
  gameSeasonCycleId: string | null = null;
  previousRatingId: string | null = null;

  constructor(properties: Partial<ParticipantRating> | null = null) {
    super();
    if (properties == null) return;

    Object.assign(this, properties);
  }
}
