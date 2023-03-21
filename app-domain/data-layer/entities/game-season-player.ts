import type { Game as GameNs } from "./_types/game";
import { EntityRecord } from "./entity";

export class GameSeasonPlayer extends EntityRecord implements GameNs.GameSeasonPlayer {
  gameSeasonId: string | null = null;
  personId: string | null = null;
  userId: string | null = null;

  constructor(properties: Partial<GameSeasonPlayer> | null = null) {
    super();
    if (properties == null) return;

    Object.assign(this, properties);
  }
}
