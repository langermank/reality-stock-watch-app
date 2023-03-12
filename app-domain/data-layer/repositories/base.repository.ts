import type { ApiClient } from "../persistence/api-client";

const nonPersistentPropertyPrefix = "_";
const skipWriteColumns = ["createdAt"];

export class BaseRepository<T> {
  _resourceName = "";

  _apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this._apiClient = apiClient;
  }

  async fetchByUuid(uuid: string): Promise<T | null> {
    return await this._apiClient.readSingle(this._resourceName, uuid);
  }

  async save(entity: Partial<T>) {
    const entityPayload = this._entityToJson(entity);

    const { data, error } = await this._apiClient.save(this._resourceName, entityPayload);
    if (error) {
      console.error("error saving entity:", error, entity);
      return;
    }

    Object.assign(entity, data);
  }

  _entityToJson(entity: Partial<T>) {
    const row: Record<string, any> = {};

    const descriptorsDetails = Object.getOwnPropertyDescriptors(entity);
    for (const key of Object.keys(descriptorsDetails)) {
      if (key.startsWith(nonPersistentPropertyPrefix)) continue;
      if (skipWriteColumns.includes(key)) continue;
      if (descriptorsDetails[key].get !== undefined) continue;
      if (descriptorsDetails[key].value === undefined) continue;
      if (descriptorsDetails[key].value === null) continue;
      if (typeof descriptorsDetails[key].value === "function") continue;

      row[key] = entity[key as keyof Partial<T>];
    }

    return row;
  }
}
