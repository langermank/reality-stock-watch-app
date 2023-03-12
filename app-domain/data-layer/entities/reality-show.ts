import type { Show } from "./_types/show";
import { EntityRecord } from "./entity";

export class RealityShow extends EntityRecord implements Show.RealityShow {
  name: string = "";
  slug: string | null = null;
  description: string | null = null;
  genre: string | null = null;
  firstAiredDate: Date | null = null;
  createdBy: string | null = null;

  constructor(properties: Partial<RealityShow> | null = null) {
    super();
    if (properties == null) return;

    Object.assign(this, properties);
  }
}
