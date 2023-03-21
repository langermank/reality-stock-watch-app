import type { Core } from "./_types/core";
import type { Show } from "./_types/show";
import { EntityRecord } from "./entity";

export class RealityShowSeason extends EntityRecord implements Show.RealityShowSeason {
  name: string = "";
  slug: string | null = null;
  seasonNumber: string | null = null;
  startDate: Date | null = null;
  endDate: Date | null = null;
  streamingNetworks: string | null = null;
  realityShowSeriesId: string | null = null;

  constructor(properties: Partial<RealityShowSeason> | null = null) {
    super();
    if (properties == null) return;

    Object.assign(this, properties);
  }
}
