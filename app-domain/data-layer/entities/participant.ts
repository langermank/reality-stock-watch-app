import type { Show } from "./_types/show";
import { EntityRecord } from "./entity";

export class Participant extends EntityRecord implements Show.Participant {
  ingressDate: Date | null = null;
  exitDate: Date | null = null;
  realityShowSeasonId: string | null = null;
  personId: string | null = null;

  constructor(properties: Partial<Participant> | null = null) {
    super();
    if (properties == null) return;

    Object.assign(this, properties);
  }
}
