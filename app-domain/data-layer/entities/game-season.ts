import type { Game as GameNs } from "./_types/game";
import { EntityRecord } from "./entity";

export class GameSeason extends EntityRecord implements GameNs.GameSeason {
  slug: string | null = null;
  startDate: Date | null = null;
  endDate: Date | null = null;
  gameId: string | null = null;
  realityShowSeasonId: string | null = null;

  constructor(properties: Partial<GameSeason> | null = null) {
    super();
    if (properties == null) return;

    Object.assign(this, properties);
  }
}
