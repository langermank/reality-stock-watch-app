import type { Core } from "./_types/core";

export class EntityRecord implements Core.EntityRecord {
  id: string | null = null;
  createdAt: Date | null = null;
  updatedAt: Date | null = null;
  deletedAt: Date | null = null;
}
