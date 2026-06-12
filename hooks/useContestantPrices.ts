"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { derivePrice, type PricingParams } from "@/lib/pricing";
import type { Database } from "@/lib/supabase/types";

type ContestantRow = Database["public"]["Tables"]["contestants"]["Row"];

type PriceEntry = {
  sharesOutstanding: number;
  price: number;
};

/** Minimal supply shape the hook needs to seed/derive prices. */
export type SupplySnapshot = {
  id: string;
  total_shares_outstanding: number;
};

type UseContestantPricesResult = {
  prices: Map<string, PriceEntry>;
  isLoading: boolean;
};

/** Recompute prices for all contestants given a map of sharesOutstanding. */
function computePrices(
  sharesMap: Map<string, number>,
  params: PricingParams
): Map<string, PriceEntry> {
  const totalAllShares = Array.from(sharesMap.values()).reduce((sum, s) => sum + s, 0);
  const result = new Map<string, PriceEntry>();
  for (const [id, sharesOutstanding] of sharesMap) {
    result.set(id, {
      sharesOutstanding,
      price: derivePrice(sharesOutstanding, totalAllShares, params),
    });
  }
  return result;
}

function mapFromSnapshot(snapshot: SupplySnapshot[]): Map<string, number> {
  return new Map(snapshot.map((c) => [c.id, c.total_shares_outstanding]));
}

/**
 * Subscribes to contestant Realtime updates and derives prices locally.
 *
 * Pass `initialSupply` (the server-rendered supply for the page) so the hook
 * seeds from authoritative server data and RE-SEEDS whenever that data changes
 * — e.g. after a trade calls `router.refresh()` and the server re-renders with
 * updated `total_shares_outstanding`. Without this, the hook would cling to its
 * own realtime map and show a stale price if the realtime broadcast was missed.
 * Realtime updates still layer on top of the seeded data.
 *
 * When `initialSupply` is omitted the hook falls back to fetching the supply
 * itself once on mount (legacy behavior).
 *
 * @param seasonId - filters contestants to this season
 * @param pricingParams - season constants (k_constant, base_price, minSupplyFloor)
 * @param initialSupply - server-provided supply snapshot for seeding + re-sync
 */
export function useContestantPrices(
  seasonId: string,
  pricingParams: PricingParams,
  initialSupply?: SupplySnapshot[]
): UseContestantPricesResult {
  // Stable signature of the server snapshot so we only re-seed when the data
  // actually changes — not on every render (server passes a fresh array each time).
  const initialSig = useMemo(
    () =>
      initialSupply
        ? initialSupply
            .map((c) => `${c.id}:${c.total_shares_outstanding}`)
            .sort()
            .join("|")
        : null,
    [initialSupply]
  );

  // Authoritative supply, shared between the re-seed and realtime effects so a
  // re-seed never clobbers live updates and vice-versa.
  const sharesMapRef = useRef<Map<string, number>>(
    initialSupply ? mapFromSnapshot(initialSupply) : new Map()
  );

  // Computed from the snapshot (not the ref) — refs must not be read in render.
  const [prices, setPrices] = useState<Map<string, PriceEntry>>(() =>
    initialSupply ? computePrices(mapFromSnapshot(initialSupply), pricingParams) : new Map()
  );
  const [isLoading, setIsLoading] = useState(!initialSupply);

  // Re-seed from the server snapshot whenever it changes (post-`router.refresh`).
  useEffect(() => {
    if (initialSig === null) return; // no server data → fall back to self-fetch
    sharesMapRef.current = mapFromSnapshot(initialSupply ?? []);
    setPrices(computePrices(sharesMapRef.current, pricingParams));
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSig, pricingParams]);

  // Fallback: fetch supply once on mount when no server snapshot was provided.
  useEffect(() => {
    if (initialSig !== null || !seasonId) return;

    const supabase = createClient();
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from("contestants")
        .select("id, total_shares_outstanding")
        .eq("season_id", seasonId);

      if (cancelled || error || !data) return;

      const map = new Map<string, number>();
      for (const row of data) {
        map.set(row.id, row.total_shares_outstanding);
      }
      sharesMapRef.current = map;
      setPrices(computePrices(map, pricingParams));
      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
     
  }, [seasonId, initialSig, pricingParams]);

  // Realtime subscription layers live updates onto the seeded supply.
  useEffect(() => {
    if (!seasonId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`contestant-prices-${seasonId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "contestants",
          filter: `season_id=eq.${seasonId}`,
        },
        (payload) => {
          const row = payload.new as Pick<ContestantRow, "id" | "total_shares_outstanding">;
          if (!row?.id) return;
          // Number(...) because Realtime payloads may serialize numeric columns
          // as strings, unlike PostgREST reads which deliver JSON numbers.
          sharesMapRef.current.set(row.id, Number(row.total_shares_outstanding));
          setPrices(computePrices(sharesMapRef.current, pricingParams));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [seasonId, pricingParams]);

  return { prices, isLoading };
}
