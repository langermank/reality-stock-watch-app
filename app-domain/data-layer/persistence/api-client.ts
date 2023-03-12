import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import type { SupabaseAuthClient } from "@supabase/supabase-js/dist/module/lib/SupabaseAuthClient";
import { createClient } from "@supabase/supabase-js";

export type ApiClientConfigType = Readonly<{
  endpoint: string;
  secretKey: string;
}>;

export type OrderingField = {
  fieldName: string;
  direction?: "asc" | "desc";
};

export type PageType = {
  orderings?: Array<OrderingField>;
  number: number;
  size: number;
};

export class ApiClient {
  _config: ApiClientConfigType;
  _client: SupabaseClient | undefined;

  auth: SupabaseAuthClient | undefined;

  constructor(config: ApiClientConfigType) {
    this._config = config;
  }

  async init() {
    this._client = createClient(this._config.endpoint, this._config.secretKey);

    this.auth = this._client.auth;

    return this;
  }

  async readSingle(resourceId: string, uuid: string) {
    const result = await this._client?.from(resourceId).select().match({ uuid }).single();
    if (!result) return null;

    const { data } = result;
    return data;
  }

  async readPaginated(resourceId: string, filters: any, page: PageType | null = null) {
    let query = this._client?.from(resourceId).select().match(filters);
    if (page !== null) {
      query = this._applyPagination(query, page);
    }
    const result = await query;
    if (!result) return null;

    const { data } = result;
    return data;
  }

  async save(
    resourceId: string,
    entity: any
  ): Promise<{ data: any | null; error: PostgrestError | null }> {
    if (!entity) return { data: null, error: null };

    const { error = null, data } = await this._client?.from(resourceId).upsert(entity).select()!;
    if (error) return { data: null, error };

    if (!data?.length) return { data: null, error: null };
    return { data: data[0], error: null };
  }

  _applyPagination(query: any, page: PageType) {
    const initialIndex = page.size * (page.number - 1);
    const lastIndex = initialIndex + page.size;

    if (page.orderings) {
      for (const orderingField of page.orderings) {
        const direction = orderingField.direction ? orderingField.direction : "asc";
        query = query.order(orderingField.fieldName, { ascending: direction === "asc" });
      }
    }

    return query.range(initialIndex, lastIndex);
  }
}
