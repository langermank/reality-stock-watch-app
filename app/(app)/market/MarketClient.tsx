"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { derivePrice, type PricingParams } from "@/lib/pricing";
import { useContestantPrices } from "@/hooks/useContestantPrices";
import type { ContestantStatus, SeasonStatus } from "@/lib/supabase/types";

export type MarketSeason = {
  id: string;
  name: string;
  status: Extract<SeasonStatus, "pre_season" | "active">;
  start_date: string | null;
  starting_balance: string;
  k_constant: string;
  base_price: string;
};

export type MarketContestant = {
  id: string;
  season_id: string;
  name: string;
  photo_url: string | null;
  bio: string | null;
  status: ContestantStatus;
  is_hoh: boolean;
  is_nominated: boolean;
  has_veto: boolean;
  total_shares_outstanding: string;
};

type PriceSnapshot = {
  sharesOutstanding: number;
  price: number;
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactNumber = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

function buildInitialPrices(
  contestants: MarketContestant[],
  params: PricingParams
): Map<string, PriceSnapshot> {
  const shares = new Map(
    contestants.map((contestant) => [
      contestant.id,
      Number.parseFloat(contestant.total_shares_outstanding),
    ])
  );
  const totalShares = Array.from(shares.values()).reduce((sum, value) => sum + value, 0);

  return new Map(
    contestants.map((contestant) => {
      const sharesOutstanding = shares.get(contestant.id) ?? 0;
      return [
        contestant.id,
        {
          sharesOutstanding,
          price: derivePrice(sharesOutstanding, totalShares, params),
        },
      ];
    })
  );
}

function formatStartDate(value: string | null): string {
  if (!value) return "Trading opens soon";

  return `Trading opens ${new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00`))}`;
}

function initialsFor(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function contestantFlags(contestant: MarketContestant): string[] {
  return [
    contestant.status !== "active" ? contestant.status.replace("_", " ") : null,
    contestant.is_hoh ? "HoH" : null,
    contestant.is_nominated ? "Nominated" : null,
    contestant.has_veto ? "Veto" : null,
  ].filter((flag): flag is string => Boolean(flag));
}

function PriceMove({
  price,
  basePrice,
}: {
  price: number;
  basePrice: number;
}) {
  const delta = price - basePrice;
  const rounded = Math.abs(delta);

  if (rounded < 0.005) {
    return <span className="text-neutral-500">at base</span>;
  }

  const positive = delta > 0;
  return (
    <span className={positive ? "text-emerald-400" : "text-rose-400"}>
      {positive ? "+" : "-"}
      {currency.format(rounded)} vs base
    </span>
  );
}

export function MarketClient({
  season,
  contestants,
}: {
  season: MarketSeason;
  contestants: MarketContestant[];
}) {
  const basePrice = Number.parseFloat(season.base_price);
  const pricingParams = useMemo(
    () => ({
      basePrice,
      kConstant: Number.parseFloat(season.k_constant),
      minSupplyFloor: Math.max(contestants.length, 1),
    }),
    [basePrice, contestants.length, season.k_constant]
  );
  const initialPrices = useMemo(
    () => buildInitialPrices(contestants, pricingParams),
    [contestants, pricingParams]
  );
  const { prices, isLoading } = useContestantPrices(season.id, pricingParams);
  const priceMap = season.status === "active" && prices.size > 0 ? prices : initialPrices;
  const isPreSeason = season.status === "pre_season";
  const router = useRouter();

  return (
    <div className="mx-auto flex min-h-full max-w-3xl flex-col px-4 py-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Market
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-neutral-50">Contestants</h1>
          <p className="mt-2 text-sm text-neutral-400">{season.name}</p>
        </div>
        <div className="rounded-full border border-neutral-800 px-3 py-1 text-xs font-medium text-neutral-300">
          {isPreSeason ? "Pre-season" : "Live"}
        </div>
      </header>

      <section className="mt-5 rounded-lg border border-neutral-800 bg-neutral-950 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-neutral-200">
              {isPreSeason ? formatStartDate(season.start_date) : "Prices update live"}
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              Starting cash {currency.format(Number.parseFloat(season.starting_balance))}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-neutral-500">Base price</p>
            <p className="mt-1 text-sm font-semibold text-neutral-100">
              {currency.format(basePrice)}
            </p>
          </div>
        </div>
      </section>

      {contestants.length === 0 ? (
        <section className="mt-5 rounded-lg border border-neutral-800 bg-neutral-950 p-5">
          <h2 className="text-base font-semibold text-neutral-100">No contestants yet</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-400">
            The cast list will appear here after contestants are added to this season.
          </p>
        </section>
      ) : (
        <section className="mt-5 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950">
          <div className="border-b border-neutral-800 px-4 py-3">
            <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
              <span>Contestant</span>
              <span>{isPreSeason ? "Starting price" : "Current price"}</span>
            </div>
          </div>
          <ul className="divide-y divide-neutral-800" role="list">
            {contestants.map((contestant) => {
              const price = isPreSeason ? basePrice : priceMap.get(contestant.id)?.price ?? basePrice;
              const sharesOutstanding =
                priceMap.get(contestant.id)?.sharesOutstanding ??
                Number.parseFloat(contestant.total_shares_outstanding);
              const flags = contestantFlags(contestant);

              return (
                <li key={contestant.id}>
                  <button
                    type="button"
                    onClick={() => router.push(`/market/${contestant.id}`)}
                    className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-neutral-900 text-sm font-semibold text-neutral-300 ring-1 ring-neutral-800">
                        {contestant.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={contestant.photo_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          initialsFor(contestant.name)
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-neutral-100">
                          {contestant.name}
                        </span>
                        <span className="mt-1 flex flex-wrap gap-1.5">
                          {flags.length > 0 ? (
                            flags.map((flag) => (
                              <span
                                key={flag}
                                className="rounded-full bg-neutral-900 px-2 py-0.5 text-[11px] font-medium capitalize text-neutral-300 ring-1 ring-neutral-800"
                              >
                                {flag}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-neutral-500">Active</span>
                          )}
                        </span>
                      </span>
                    </span>
                    <span className="text-right">
                      <span className="block text-sm font-semibold text-neutral-50">
                        {isLoading && season.status === "active" ? "..." : currency.format(price)}
                      </span>
                      <span className="mt-1 block text-xs">
                        {isPreSeason ? (
                          <span className="text-neutral-500">read only</span>
                        ) : (
                          <PriceMove price={price} basePrice={basePrice} />
                        )}
                      </span>
                      {!isPreSeason ? (
                        <span className="mt-1 block text-[11px] text-neutral-600">
                          {compactNumber.format(sharesOutstanding)} shares
                        </span>
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
