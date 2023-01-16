/// <reference path="./_types/core.d.ts" />
import * as crypto from "crypto";

const defaultExtension = ".sql";
export const filenameToMigrationName = (filename: string) => {
  return filename.endsWith(defaultExtension)
    ? filename.slice(0, -defaultExtension.length)
    : filename;
};

export const migrationNameToFilename = (name: string) => `${name}${defaultExtension}`;

export class Migration implements Core.DbMigration {
  id: string | null = null;
  executedAt: Date | null = null;
  name: string | null = null;
  hash: string | null = null;
  queryContent: string | null = null;

  constructor({
    id = null,
    executedAt = null,
    name = null,
    hash = null,
    queryContent = null,
  }: Partial<Core.DbMigration>) {
    this.name = name;
    this.id = id;
    this.executedAt = executedAt;
    this.hash = hash;
    this.queryContent = queryContent;
  }

  setHashByContent(content: string) {
    this.hash = crypto.createHash("sha512").update(content).digest("hex");
  }
}
