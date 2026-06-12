"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { derivePrice, sellProceeds, type PricingParams } from "@/lib/pricing";
import { useContestantPrices } from "@/hooks/useContestantPrices";

type SeasonInfo = {
  id: string;
  base_price: number;
  k_constant: number;
};

type PortfolioContestant = {
  id: string;
  name: string;
  photo_url: string | null;
  status: string;
  total_shares_outstanding: number;
};

type HoldingRow = {
  contestant_id: string;
  shares_held: number;
  average_purchase_price: number;
};

type TradeRow = {
  id: string;
  contestant_id: string;
  type: "buy" | "sell";
  dollar_amount: number;
  shares: number;
  price_at_execution: number;
  fee_amount: number;
  created_at: string;
};

export type PortfolioData = {
  season: SeasonInfo;
  startingBalance: number;
  cashBalance: number;
  contestants: PortfolioContestant[];
  holdings: HoldingRow[];
  initialTrades: TradeRow[];
};

const PAGE_SIZE = 20;

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const sharePrice = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
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

function Avatar({
  name,
  photoUrl,
  size,
}: {
  name: string;
  photoUrl: string | null;
  size: number;
}) {
  return (
    <span
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-900 font-semibold text-neutral-300 ring-1 ring-neutral-800"
      style={{ height: size, width: size, fontSize: size * 0.34 }}
    >
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        initialsFor(name)
      )}
    </span>
  );
}

export function PortfolioClient({
  data,
  userId,
}: {
  data: PortfolioData;
  userId: string;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"holdings" | "history">("holdings");

  const params = useMemo<PricingParams>(
    () => ({
      basePrice: data.season.base_price,
      kConstant: data.season.k_constant,
      // Matches the leaderboard cron + place_trade RPC so net worth is consistent.
      minSupplyFloor: 1,
    }),
    [data.season.base_price, data.season.k_constant]
  );

  const contestantMap = useMemo(
    () => new Map(data.contestants.map((c) => [c.id, c])),
    [data.contestants]
  );

  const initialSupply = useMemo(
    () =>
      new Map(
        data.contestants.map((c) => [c.id, c.total_shares_outstanding])
      ),
    [data.contestants]
  );

  const { prices } = useContestantPrices(data.season.id, params);

  // Live supply per contestant + season total (server data as fallback).
  const supply = useMemo(
    () =>
      prices.size > 0
        ? new Map(Array.from(prices, ([id, v]) => [id, v.sharesOutstanding]))
        : initialSupply,
    [prices, initialSupply]
  );
  const totalAllShares = useMemo(() => {
    let t = 0;
    for (const v of supply.values()) t += v;
    return t;
  }, [supply]);

  // Per-holding liquidation value (net of fee), matching the leaderboard basis.
  const holdings = useMemo(() => {
    return data.holdings
      .map((h) => {
        const shares = h.shares_held;
        const avg = h.average_purchase_price;
        const S = supply.get(h.contestant_id) ?? initialSupply.get(h.contestant_id) ?? 0;
        const liquidation =
          shares > 0 ? sellProceeds(shares, S, totalAllShares, params).proceeds : 0;
        const costBasis = shares * avg;
        return {
          contestant: contestantMap.get(h.contestant_id),
          contestantId: h.contestant_id,
          shares,
          avg,
          price: derivePrice(S, totalAllShares, params),
          liquidation,
          gain: liquidation - costBasis,
        };
      })
      .filter((h) => h.contestant && h.shares > 0)
      .sort((a, b) => b.liquidation - a.liquidation);
  }, [data.holdings, supply, initialSupply, totalAllShares, params, contestantMap]);

  const holdingsValue = holdings.reduce((sum, h) => sum + h.liquidation, 0);
  const netWorth = data.cashBalance + holdingsValue;
  const gain = netWorth - data.startingBalance;
  const gainPct = data.startingBalance > 0 ? (gain / data.startingBalance) * 100 : 0;
  const gainPositive = gain >= 0;

  return (
    <div className="mx-auto flex min-h-full max-w-3xl flex-col px-4 py-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
          Portfolio
        </p>
        <p className="mt-4 text-sm text-neutral-400">Net worth</p>
        <p className="mt-1 text-4xl font-bold tracking-tight text-neutral-50">
          {currency.format(netWorth)}
        </p>
        <p className="mt-2 text-sm">
          <span className="text-neutral-400">
            Started with {currency.format(data.startingBalance)} ·{" "}
          </span>
          <span className={gainPositive ? "text-emerald-400" : "text-rose-400"}>
            {gainPositive ? "+" : "−"}
            {currency.format(Math.abs(gain))} ({gainPositive ? "+" : "−"}
            {Math.abs(gainPct).toFixed(1)}%)
          </span>
        </p>
      </header>

      {/* Cash + invested split */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
          <p className="text-xs text-neutral-500">Cash</p>
          <p className="mt-1 text-lg font-semibold text-neutral-100">
            {currency.format(data.cashBalance)}
          </p>
        </div>
        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
          <p className="text-xs text-neutral-500">In contestants</p>
          <p className="mt-1 text-lg font-semibold text-neutral-100">
            {currency.format(holdingsValue)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-6 border-b border-neutral-800">
        <TabButton active={tab === "holdings"} onClick={() => setTab("holdings")}>
          Holdings
        </TabButton>
        <TabButton active={tab === "history"} onClick={() => setTab("history")}>
          History
        </TabButton>
      </div>

      {tab === "holdings" ? (
        <HoldingsTab
          holdings={holdings}
          onTap={(id) => router.push(`/market/${id}`)}
        />
      ) : (
        <HistoryTab
          seasonId={data.season.id}
          userId={userId}
          initialTrades={data.initialTrades}
          contestantMap={contestantMap}
        />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "-mb-px border-b-2 pb-3 text-sm font-semibold transition-colors",
        active
          ? "border-neutral-100 text-neutral-100"
          : "border-transparent text-neutral-500 hover:text-neutral-300",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

type ComputedHolding = {
  contestant: PortfolioContestant | undefined;
  contestantId: string;
  shares: number;
  avg: number;
  price: number;
  liquidation: number;
  gain: number;
};

function HoldingsTab({
  holdings,
  onTap,
}: {
  holdings: ComputedHolding[];
  onTap: (contestantId: string) => void;
}) {
  if (holdings.length === 0) {
    return (
      <div className="mt-6 rounded-lg border border-neutral-800 bg-neutral-950 p-6 text-center">
        <p className="text-sm font-medium text-neutral-200">No holdings yet</p>
        <p className="mt-1.5 text-sm text-neutral-500">
          Buy your first contestant to get started.
        </p>
      </div>
    );
  }

  return (
    <ul className="mt-2 divide-y divide-neutral-800" role="list">
      {holdings.map((h) => {
        const positive = h.gain >= 0;
        return (
          <li key={h.contestantId}>
            <button
              type="button"
              onClick={() => onTap(h.contestantId)}
              className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-3 text-left transition-colors hover:bg-neutral-900"
            >
              <Avatar
                name={h.contestant!.name}
                photoUrl={h.contestant!.photo_url}
                size={44}
              />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-neutral-100">
                  {h.contestant!.name}
                </span>
                <span className="mt-0.5 block text-xs text-neutral-500">
                  {h.shares.toFixed(4)} shares · avg {sharePrice.format(h.avg)}
                </span>
              </span>
              <span className="text-right">
                <span className="block text-sm font-semibold text-neutral-50">
                  {currency.format(h.liquidation)}
                </span>
                <span
                  className={[
                    "mt-0.5 block text-xs font-medium",
                    positive ? "text-emerald-400" : "text-rose-400",
                  ].join(" ")}
                >
                  {positive ? "+" : "−"}
                  {currency.format(Math.abs(h.gain))}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function HistoryTab({
  seasonId,
  userId,
  initialTrades,
  contestantMap,
}: {
  seasonId: string;
  userId: string;
  initialTrades: TradeRow[];
  contestantMap: Map<string, PortfolioContestant>;
}) {
  const [trades, setTrades] = useState<TradeRow[]>(initialTrades);
  const [hasMore, setHasMore] = useState(initialTrades.length === PAGE_SIZE);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("trades")
        .select(
          "id, contestant_id, type, dollar_amount, shares, price_at_execution, fee_amount, created_at"
        )
        .eq("user_id", userId)
        .eq("season_id", seasonId)
        .eq("state", "filled")
        .order("created_at", { ascending: false })
        .range(trades.length, trades.length + PAGE_SIZE - 1);

      if (!error && data) {
        setTrades((prev) => [...prev, ...data]);
        setHasMore(data.length === PAGE_SIZE);
      }
    } finally {
      setLoading(false);
    }
  }

  if (trades.length === 0) {
    return (
      <div className="mt-6 rounded-lg border border-neutral-800 bg-neutral-950 p-6 text-center">
        <p className="text-sm font-medium text-neutral-200">No trades yet</p>
        <p className="mt-1.5 text-sm text-neutral-500">
          Your filled buys and sells will show up here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <ul className="mt-2 divide-y divide-neutral-800" role="list">
        {trades.map((t) => {
          const contestant = contestantMap.get(t.contestant_id);
          const isBuy = t.type === "buy";
          return (
            <li
              key={t.id}
              className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-3"
            >
              <span
                className={[
                  "rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-wide",
                  isBuy
                    ? "bg-emerald-600/15 text-emerald-400"
                    : "bg-rose-600/15 text-rose-400",
                ].join(" ")}
              >
                {isBuy ? "Buy" : "Sell"}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-neutral-100">
                  {contestant?.name ?? "Contestant"}
                </span>
                <span className="mt-0.5 block text-xs text-neutral-500">
                  {t.shares.toFixed(4)} shares @{" "}
                  {sharePrice.format(t.price_at_execution)}
                </span>
              </span>
              <span className="text-right">
                <span className="block text-sm font-semibold text-neutral-100">
                  {isBuy ? "−" : "+"}
                  {currency.format(t.dollar_amount)}
                </span>
                <span className="mt-0.5 block text-xs text-neutral-500">
                  {dateFmt.format(new Date(t.created_at))}
                </span>
              </span>
            </li>
          );
        })}
      </ul>

      {hasMore && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="rounded-lg border border-neutral-700 px-5 py-2.5 text-sm font-semibold text-neutral-200 transition-colors hover:bg-neutral-900 disabled:opacity-50"
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
