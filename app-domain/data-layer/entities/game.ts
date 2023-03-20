import type { Game as GameNs } from "./_types/game";
import { EntityRecord } from "./entity";

export class Game extends EntityRecord implements GameNs.Game {
  title: string | null = null;
  slug: string | null = null;
  realityShowSeriesId: string | null = null;

  constructor(properties: Partial<Game> | null = null) {
    super();
    if (properties == null) return;

    Object.assign(this, properties);
  }
}
