import type { Core } from "./_types/core";
import { EntityRecord } from "./entity";

export class PublicProfile extends EntityRecord implements Core.PublicProfile {
  displayName: string | null = null;
  avatarUrl: string | null = null;
  ownerId: string | null = null;
  rUserId: string | null = null;

  constructor(properties: Partial<PublicProfile> | null = null) {
    super();
    if (properties == null) return;

    Object.assign(this, properties);
  }
}
