import type { Core } from "./_types/core";
import type { Show } from "./_types/show";
import { EntityRecord } from "./entity";

export class RealityShowSeries extends EntityRecord implements Show.RealityShowSeries {
  name: string = "";
  slug: string | null = null;
  description: string | null = null;
  streamingNetworks: string | null = null;
  realityShowId: Core.Uuid | null = null;

  constructor(properties: Partial<RealityShowSeries> | null = null) {
    super();
    if (properties == null) return;

    Object.assign(this, properties);
  }
}
