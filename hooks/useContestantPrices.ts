"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { derivePrice, type PricingParams } from "@/lib/pricing";
import type { Database } from "@/lib/supabase/types";

type ContestantRow = Database["public"]["Tables"]["contestants"]["Row"];

type PriceEntry = {
  sharesOutstanding: number;
  price: number;
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

/**
 * Subscribes to contestant Realtime updates and derives prices locally.
 * @param seasonId - filters contestants to this season
 * @param pricingParams - season constants (k_constant, base_price, minSupplyFloor)
 */
export function useContestantPrices(
  seasonId: string,
  pricingParams: PricingParams
): UseContestantPricesResult {
  const [prices, setPrices] = useState<Map<string, PriceEntry>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!seasonId) return;

    const supabase = createClient();
    // sharesMap is a stable ref so the realtime handler can close over it
    const sharesMap = new Map<string, number>();

    async function loadInitial() {
      const { data, error } = await supabase
        .from("contestants")
        .select("id, total_shares_outstanding")
        .eq("season_id", seasonId);

      if (error || !data) return;

      for (const row of data as Pick<ContestantRow, "id" | "total_shares_outstanding">[]) {
        sharesMap.set(row.id, parseFloat(row.total_shares_outstanding));
      }

      setPrices(computePrices(sharesMap, pricingParams));
      setIsLoading(false);
    }

    loadInitial();

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
          sharesMap.set(row.id, parseFloat(row.total_shares_outstanding));
          setPrices(computePrices(sharesMap, pricingParams));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [seasonId, pricingParams]);

  return { prices, isLoading };
}
