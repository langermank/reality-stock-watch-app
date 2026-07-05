"use client";

import { useMemo } from "react";
import Link from "next/link";
import { derivePrice, sellProceeds, type PricingParams } from "@/lib/pricing";
import { useContestantPrices } from "@/hooks/useContestantPrices";
import { useTradeOverlay } from "@/components/trade/TradeProvider";
import type { MarketContestant, MarketSeason } from "../MarketClient";

type Holding = {
  shares_held: number;
  average_purchase_price: number;
} | null;

type Trade = {
  price_at_execution: number;
  created_at: string;
};

type SlimContestant = {
  id: string;
  total_shares_outstanding: number;
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function initialsFor(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function PriceChart({ trades }: { trades: Trade[] }) {
  if (trades.length < 2) {
    return (
      <div className="flex h-36 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-950">
        <p className="text-sm text-neutral-500">No price history yet</p>
      </div>
    );
  }

  const prices = trades.map((t) => t.price_at_execution);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice || 0.01;

  const W = 100;
  const H = 50;
  const PAD_Y = 3;

  const pts = prices.map((price, i) => ({
    x: (i / (prices.length - 1)) * W,
    y: PAD_Y + (1 - (price - minPrice) / range) * (H - PAD_Y * 2),
  }));

  const isUp = prices[prices.length - 1] >= prices[0];
  const color = isUp ? "#34d399" : "#f87171";

  const linePath = `M ${pts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" L ")}`;
  const areaPath = `${linePath} L ${W},${H} L 0,${H} Z`;

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="w-full h-36"
        style={{ display: "block" }}
      >
        <defs>
          <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#chart-fill)" />
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="flex justify-between px-1 mt-1">
        <span className="text-[11px] text-neutral-500">{currency.format(minPrice)}</span>
        <span className="text-[11px] text-neutral-500">{currency.format(maxPrice)}</span>
      </div>
    </div>
  );
}

export default function ContestantDetailClient({
  contestant,
  season,
  holding,
  trades,
  allContestants,
}: {
  contestant: MarketContestant;
  season: MarketSeason;
  holding: Holding;
  trades: Trade[];
  allContestants: SlimContestant[];
}) {
  const { openTrade } = useTradeOverlay();
  const basePrice = season.base_price;

  const pricingParams = useMemo<PricingParams>(
    () => ({
      basePrice,
      kConstant: season.k_constant,
      minSupplyFloor: Math.max(allContestants.length, 1),
    }),
    [basePrice, season.k_constant, allContestants.length]
  );

  const initialPrices = useMemo(() => {
    const sharesMap = new Map(
      allContestants.map((c) => [c.id, c.total_shares_outstanding])
    );
    const totalAllShares = Array.from(sharesMap.values()).reduce((s, v) => s + v, 0);
    return new Map(
      allContestants.map((c) => {
        const shares = sharesMap.get(c.id) ?? 0;
        return [
          c.id,
          {
            sharesOutstanding: shares,
            price: derivePrice(shares, totalAllShares, pricingParams),
          },
        ];
      })
    );
  }, [allContestants, pricingParams]);

  // Pass server supply so the hook re-seeds after router.refresh() (e.g. post-trade)
  // instead of showing a stale realtime price.
  const { prices } = useContestantPrices(season.id, pricingParams, allContestants);
  const priceMap = prices.size > 0 ? prices : initialPrices;

  const currentPrice =
    season.status === "active"
      ? (priceMap.get(contestant.id)?.price ?? basePrice)
      : basePrice;

  const sharesOutstanding =
    priceMap.get(contestant.id)?.sharesOutstanding ??
    contestant.total_shares_outstanding;

  const totalAllShares = useMemo(
    () => Array.from(priceMap.values()).reduce((s, v) => s + v.sharesOutstanding, 0),
     
    [priceMap]
  );

  const sharesHeld = holding?.shares_held ?? 0;
  const avgPurchasePrice = holding?.average_purchase_price ?? 0;

  const liquidationValue = useMemo(() => {
    if (sharesHeld <= 0) return 0;
    return sellProceeds(sharesHeld, sharesOutstanding, totalAllShares, pricingParams).proceeds;
  }, [sharesHeld, sharesOutstanding, totalAllShares, pricingParams]);

  const priceDelta = currentPrice - basePrice;
  const isPreSeason = season.status === "pre_season";

  const statusLabel =
    contestant.status !== "active" ? contestant.status.replace("_", " ") : null;

  const flags = [
    contestant.is_hoh ? "HoH" : null,
    contestant.is_nominated ? "Nominated" : null,
    contestant.has_veto ? "Veto" : null,
  ].filter((f): f is string => Boolean(f));

  return (
    <div className="relative min-h-full bg-neutral-950">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-neutral-800 bg-neutral-950/95 px-4 py-3 backdrop-blur-sm">
        <Link
          href="/market"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-400 transition-colors hover:text-neutral-100"
          aria-label="Back to market"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </Link>
        <h1 className="flex-1 truncate text-center text-sm font-semibold text-neutral-100">
          {contestant.name}
        </h1>
        <div className="w-8 shrink-0" aria-hidden="true" />
      </div>

      {/* Scrollable content */}
      {/* pb = BottomNav (4rem) + CTA bar (~4rem) + safe-area inset */}
      <div className="mx-auto max-w-3xl px-4 pt-6 pb-[calc(8rem+env(safe-area-inset-bottom))]">

        {/* Identity */}
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-900 text-lg font-semibold text-neutral-300 ring-1 ring-neutral-800">
            {contestant.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={contestant.photo_url}
                alt={contestant.name}
                className="h-full w-full object-cover"
              />
            ) : (
              initialsFor(contestant.name)
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xl font-bold text-neutral-50">{contestant.name}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {statusLabel && (
                <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[11px] font-medium capitalize text-neutral-300 ring-1 ring-neutral-700">
                  {statusLabel}
                </span>
              )}
              {flags.map((flag) => (
                <span
                  key={flag}
                  className="rounded-full bg-neutral-800 px-2 py-0.5 text-[11px] font-medium text-neutral-300 ring-1 ring-neutral-700"
                >
                  {flag}
                </span>
              ))}
              {!statusLabel && flags.length === 0 && (
                <span className="text-xs text-neutral-500">Active</span>
              )}
            </div>
          </div>
        </div>

        {/* Live price */}
        <div className="mt-6">
          <p className="text-3xl font-bold tracking-tight text-neutral-50">
            {currency.format(currentPrice)}
          </p>
          <p className="mt-1 text-sm">
            {isPreSeason ? (
              <span className="text-neutral-500">Starting price · read only</span>
            ) : Math.abs(priceDelta) < 0.005 ? (
              <span className="text-neutral-500">at base price</span>
            ) : (
              <span className={priceDelta > 0 ? "text-emerald-400" : "text-rose-400"}>
                {priceDelta > 0 ? "+" : "−"}
                {currency.format(Math.abs(priceDelta))} vs base
              </span>
            )}
          </p>
        </div>

        {/* Price chart */}
        <div className="mt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
            Price history
          </p>
          <PriceChart trades={trades} />
        </div>

        {/* Holding */}
        <div className="mt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
            Your position
          </p>
          <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
            {sharesHeld > 0 ? (
              <dl className="space-y-3">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-neutral-400">Shares held</dt>
                  <dd className="text-sm font-semibold text-neutral-100">
                    {sharesHeld.toFixed(4)}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-neutral-400">Avg buy price</dt>
                  <dd className="text-sm font-semibold text-neutral-100">
                    {currency.format(avgPurchasePrice)}
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-neutral-800 pt-3">
                  <dt className="text-sm text-neutral-400">Value now</dt>
                  <dd className="text-sm font-bold text-neutral-50">
                    {isPreSeason
                      ? currency.format(sharesHeld * basePrice)
                      : currency.format(liquidationValue)}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-neutral-500">
                You don&apos;t own any shares in {contestant.name}.
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        {contestant.bio && (
          <div className="mt-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
              About
            </p>
            <p className="text-sm leading-6 text-neutral-400">{contestant.bio}</p>
          </div>
        )}
      </div>

      {/* Sticky CTAs — pinned directly above the BottomNav (h-16 + safe-area padding) */}
      {!isPreSeason && (
        <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] inset-x-0 z-10 border-t border-neutral-800 bg-neutral-950/95 px-4 py-3 backdrop-blur-sm">
          <div className="mx-auto flex max-w-3xl gap-3">
            <button
              type="button"
              onClick={() => openTrade({ contestantId: contestant.id, side: "buy" })}
              className="flex-1 rounded-lg bg-emerald-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
            >
              Buy
            </button>
            <button
              type="button"
              disabled={sharesHeld <= 0}
              onClick={() => openTrade({ contestantId: contestant.id, side: "sell" })}
              className={[
                "flex-1 rounded-lg py-3 text-sm font-semibold transition-colors",
                sharesHeld > 0
                  ? "bg-rose-600 text-white hover:bg-rose-500"
                  : "cursor-not-allowed bg-neutral-800 text-neutral-600",
              ].join(" ")}
            >
              Sell
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
