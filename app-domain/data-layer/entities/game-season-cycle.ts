import type { Game as GameNs } from "./_types/game";
import { EntityRecord } from "./entity";

export class GameSeasonCycle extends EntityRecord implements GameNs.GameSeasonCycle {
  slug: string | null = null;
  startDate: Date | null = null;
  endDate: Date | null = null;
  gameSeasonId: string | null = null;

  constructor(properties: Partial<GameSeasonCycle> | null = null) {
    super();
    if (properties == null) return;

    Object.assign(this, properties);
  }
}
