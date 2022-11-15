/// <reference path="./_types/core.d.ts" />
import * as crypto from 'crypto';

const defaultExtension = '.sql';
export const filenameToMigrationName = (filename: string) => {
  return filename.endsWith(defaultExtension)
    ? filename.slice(0, -defaultExtension.length)
    : filename;
};

export const migrationNameToFilename = (name: string) =>
  `${name}${defaultExtension}`;

export class Migration implements Core.DbMigration {
  id: string | null = null;
  executedAt: Date | null = null;
  name: string;
  hash: string | null = null;
  queryContent: string | null = null;

  constructor({
    id,
    executedAt,
    name,
    hash,
    queryContent,
  }: {
    id?: string | null;
    executedAt?: Date | null;
    name: string;
    hash?: string | null;
    queryContent?: string | null;
  }) {
    this.name = name;

    if (id) this.id = id;
    if (executedAt) this.executedAt = executedAt;
    if (hash) this.hash = hash;
    if (queryContent) this.queryContent = queryContent;
  }

  setHashByContent(content: string) {
    this.hash = crypto.createHash('sha512').update(content).toString();
  }
}
