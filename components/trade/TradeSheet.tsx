"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import {
  derivePrice,
  sharesForDollars,
  sharesForProceeds,
  grossSellProceeds,
  type PricingParams,
} from "@/lib/pricing";
import { useContestantPrices } from "@/hooks/useContestantPrices";

export type SheetSeason = {
  id: string;
  status: string;
  base_price: number;
  k_constant: number;
};

export type SheetContestant = {
  id: string;
  name: string;
  photo_url: string | null;
  total_shares_outstanding: number;
};

type Side = "buy" | "sell";
type View = "entry" | "picker" | "processing" | "filled" | "failed";

type TradeResult = {
  ok: boolean;
  shares?: number;
  priceAtExecution?: number;
  feeAmount?: number;
  error?: string;
};

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

function initialsFor(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

/** Strip to a single valid decimal number string. */
function sanitizeAmount(raw: string): string {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length <= 1) return cleaned;
  return `${parts[0]}.${parts.slice(1).join("")}`;
}

function Avatar({ contestant, size }: { contestant: SheetContestant; size: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-800 font-semibold text-neutral-300 ring-1 ring-neutral-700"
      style={{ height: size, width: size, fontSize: size * 0.32 }}
    >
      {contestant.photo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={contestant.photo_url} alt="" className="h-full w-full object-cover" />
      ) : (
        initialsFor(contestant.name)
      )}
    </span>
  );
}

export function TradeSheet({
  onClose,
  season,
  contestants,
  cashBalance,
  holdings,
  initialContestantId,
  initialSide,
}: {
  onClose: () => void;
  season: SheetSeason;
  contestants: SheetContestant[];
  cashBalance: number;
  holdings: Record<string, number>;
  initialContestantId: string;
  initialSide: Side;
}) {
  const router = useRouter();

  const params = useMemo<PricingParams>(
    () => ({
      basePrice: season.base_price,
      kConstant: season.k_constant,
      // Matches the place_trade RPC's MIN_SUPPLY_FLOOR so preview == execution.
      minSupplyFloor: 1,
    }),
    [season.base_price, season.k_constant]
  );

  const { prices } = useContestantPrices(season.id, params);

  const [view, setView] = useState<View>("entry");
  const [side, setSide] = useState<Side>(initialSide);
  const [contestantId, setContestantId] = useState<string>(initialContestantId);
  const [amount, setAmount] = useState<string>("");
  const [result, setResult] = useState<TradeResult | null>(null);
  // Effective execution price expected from the frozen preview, captured at submit.
  const [submittedAvgPrice, setSubmittedAvgPrice] = useState<number | null>(null);

  const contestant = contestants.find((c) => c.id === contestantId) ?? contestants[0];
  const sharesOwned = holdings[contestantId] ?? 0;

  // Initial supply snapshot from server data (fallback before realtime arrives).
  const initialSupply = useMemo(() => {
    const map = new Map(
      contestants.map((c) => [c.id, c.total_shares_outstanding])
    );
    return map;
  }, [contestants]);

  /** Best-known supply for a contestant + the season total (live if available). */
  function supplyFor(id: string): { S: number; T: number } {
    if (prices.size > 0) {
      const S = prices.get(id)?.sharesOutstanding ?? initialSupply.get(id) ?? 0;
      let T = 0;
      for (const entry of prices.values()) T += entry.sharesOutstanding;
      return { S, T };
    }
    const S = initialSupply.get(id) ?? 0;
    let T = 0;
    for (const v of initialSupply.values()) T += v;
    return { S, T };
  }

  // Live price for the header — keeps ticking even while the preview stays frozen.
  const liveSupply = supplyFor(contestantId);
  const livePrice = derivePrice(liveSupply.S, liveSupply.T, params);

  // Frozen supply snapshot for the preview. Recaptured only when the contestant
  // or side changes (NOT on every realtime tick) so the math holds still while
  // the user types. Execution is still at-market.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const frozen = useMemo(() => supplyFor(contestantId), [contestantId, side]);

  const amountNum = parseFloat(amount) || 0;

  const preview = useMemo(() => {
    if (amountNum <= 0) return null;
    if (side === "buy") {
      const { shares, fee, effectiveDollars } = sharesForDollars(
        amountNum,
        frozen.S,
        frozen.T,
        params
      );
      if (shares <= 0) return null;
      return {
        shares,
        fee,
        firstPrice: derivePrice(frozen.S, frozen.T, params),
        lastPrice: derivePrice(frozen.S + shares, frozen.T + shares, params),
        avgPrice: effectiveDollars / shares,
        total: amountNum,
        net: amountNum,
      };
    }
    const { shares, fee, gross, net } = sharesForProceeds(
      amountNum,
      frozen.S,
      frozen.T,
      params,
      sharesOwned
    );
    if (shares <= 0) return null;
    return {
      shares,
      fee,
      firstPrice: derivePrice(frozen.S, frozen.T, params),
      lastPrice: derivePrice(frozen.S - shares, frozen.T - shares, params),
      avgPrice: gross / shares,
      total: gross,
      net,
    };
  }, [amountNum, side, frozen, params, sharesOwned]);

  const sellAllGross = useMemo(
    () => (sharesOwned > 0 ? grossSellProceeds(sharesOwned, frozen.S, frozen.T, params) : 0),
    [sharesOwned, frozen, params]
  );

  function setQuick(fraction: number) {
    if (side === "buy") {
      setAmount((cashBalance * fraction).toFixed(2));
    } else {
      setAmount((sellAllGross * fraction).toFixed(2));
    }
  }

  async function submit() {
    if (!preview) return;
    setSubmittedAvgPrice(preview.avgPrice);
    setView("processing");
    try {
      const res = await fetch("/api/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contestantId, type: side, dollarAmount: amountNum }),
      });
      const data: TradeResult = await res.json();
      if (data.ok) {
        setResult(data);
        setView("filled");
        router.refresh();
      } else {
        setResult(data);
        setView("failed");
      }
    } catch {
      setResult({ ok: false, error: "Something went wrong — your trade was not placed." });
      setView("failed");
    }
  }

  function resetToEntry() {
    setView("entry");
    setResult(null);
  }

  const sellDisabled = sharesOwned <= 0;
  const canSubmit = preview !== null && view === "entry";

  return (
    <Dialog.Root
      open
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border-t border-neutral-800 bg-neutral-950 pb-[env(safe-area-inset-bottom)] transition-transform data-[ending-style]:translate-y-full data-[starting-style]:translate-y-full">
          {/* Grabber */}
          <div className="flex justify-center pt-3">
            <div className="h-1 w-10 rounded-full bg-neutral-700" />
          </div>

          {view === "picker" ? (
            <PickerView
              contestants={contestants}
              holdings={holdings}
              supplyFor={supplyFor}
              params={params}
              selectedId={contestantId}
              onPick={(id) => {
                setContestantId(id);
                // If switching to a contestant the user can't sell, force buy.
                if ((holdings[id] ?? 0) <= 0 && side === "sell") setSide("buy");
                setView("entry");
              }}
              onBack={() => setView("entry")}
            />
          ) : view === "processing" ? (
            <ProcessingView />
          ) : view === "filled" ? (
            <FilledView
              side={side}
              contestant={contestant}
              result={result}
              submittedAvgPrice={submittedAvgPrice}
              onTradeAgain={() => {
                setAmount("");
                resetToEntry();
              }}
              onDone={onClose}
            />
          ) : view === "failed" ? (
            <FailedView
              result={result}
              onRetry={resetToEntry}
              onDismiss={onClose}
            />
          ) : (
            <div className="px-5 pb-6">
              <Dialog.Title className="sr-only">
                Trade {contestant.name}
              </Dialog.Title>

              {/* Buy / Sell toggle */}
              <div className="mt-3 grid grid-cols-2 gap-1 rounded-lg bg-neutral-900 p-1">
                <button
                  type="button"
                  onClick={() => setSide("buy")}
                  className={[
                    "rounded-md py-2 text-sm font-semibold transition-colors",
                    side === "buy"
                      ? "bg-emerald-600 text-white"
                      : "text-neutral-400 hover:text-neutral-200",
                  ].join(" ")}
                >
                  Buy
                </button>
                <button
                  type="button"
                  disabled={sellDisabled}
                  onClick={() => !sellDisabled && setSide("sell")}
                  className={[
                    "rounded-md py-2 text-sm font-semibold transition-colors",
                    side === "sell"
                      ? "bg-rose-600 text-white"
                      : sellDisabled
                        ? "cursor-not-allowed text-neutral-700"
                        : "text-neutral-400 hover:text-neutral-200",
                  ].join(" ")}
                >
                  Sell
                </button>
              </div>

              {/* Contestant selector */}
              <button
                type="button"
                onClick={() => setView("picker")}
                className="mt-4 flex w-full items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900/60 p-3 text-left transition-colors hover:bg-neutral-900"
              >
                <Avatar contestant={contestant} size={40} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-neutral-100">
                    {contestant.name}
                  </span>
                  <span className="block text-xs text-neutral-400">
                    {sharePrice.format(livePrice)} / share
                  </span>
                </span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-neutral-500"
                  aria-hidden="true"
                >
                  <path d="M8 9l4-4 4 4M8 15l4 4 4-4" />
                </svg>
              </button>

              {/* Amount input */}
              <div className="mt-6 text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-3xl font-bold text-neutral-500">$</span>
                  <input
                    autoFocus
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(sanitizeAmount(e.target.value))}
                    placeholder="0"
                    aria-label="Dollar amount"
                    className="w-40 bg-transparent text-center text-5xl font-bold tabular-nums text-neutral-50 placeholder-neutral-700 focus:outline-none"
                  />
                </div>
                <p className="mt-2 text-sm text-neutral-400">
                  {preview ? `≈ ${preview.shares.toFixed(4)} shares` : "Enter an amount"}
                </p>
              </div>

              {/* Quick amounts */}
              <div className="mt-5 grid grid-cols-3 gap-2">
                {side === "buy" ? (
                  <>
                    <QuickChip label="25%" onClick={() => setQuick(0.25)} />
                    <QuickChip label="50%" onClick={() => setQuick(0.5)} />
                    <QuickChip label="Max" onClick={() => setQuick(1)} />
                  </>
                ) : (
                  <>
                    <QuickChip label="25%" onClick={() => setQuick(0.25)} />
                    <QuickChip label="50%" onClick={() => setQuick(0.5)} />
                    <QuickChip label="Sell all" onClick={() => setQuick(1)} />
                  </>
                )}
              </div>

              {/* Available */}
              <p className="mt-3 text-center text-xs text-neutral-500">
                {side === "buy"
                  ? `Cash available ${currency.format(cashBalance)}`
                  : `Holding ${sharesOwned.toFixed(4)} shares · ${currency.format(sellAllGross)}`}
              </p>

              {/* Preview details */}
              {preview && (
                <dl className="mt-5 space-y-2.5 rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
                  <Row
                    label="First share"
                    value={sharePrice.format(preview.firstPrice)}
                  />
                  <Row
                    label="Last share"
                    value={sharePrice.format(preview.lastPrice)}
                  />
                  <Row label="Est. fee (2%)" value={currency.format(preview.fee)} />
                  <div className="border-t border-neutral-800 pt-2.5">
                    <Row
                      label={side === "buy" ? "Total cost" : "You receive"}
                      value={currency.format(side === "buy" ? preview.total : preview.net)}
                      strong
                    />
                  </div>
                </dl>
              )}

              {/* At-market disclaimer */}
              <p className="mt-4 text-center text-[11px] leading-4 text-neutral-500">
                Executes at-market. Price may shift before your trade is placed.
              </p>

              {/* Submit */}
              <button
                type="button"
                disabled={!canSubmit}
                onClick={submit}
                className={[
                  "mt-4 w-full rounded-lg py-3.5 text-sm font-semibold transition-colors",
                  !canSubmit
                    ? "cursor-not-allowed bg-neutral-800 text-neutral-600"
                    : side === "buy"
                      ? "bg-emerald-600 text-white hover:bg-emerald-500"
                      : "bg-rose-600 text-white hover:bg-rose-500",
                ].join(" ")}
              >
                {side === "buy" ? "Buy" : "Sell"} {contestant.name}
              </button>
            </div>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-sm text-neutral-400">{label}</dt>
      <dd
        className={
          strong
            ? "text-sm font-bold text-neutral-50"
            : "text-sm font-medium text-neutral-200"
        }
      >
        {value}
      </dd>
    </div>
  );
}

function QuickChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-neutral-800 bg-neutral-900 py-2 text-xs font-semibold text-neutral-300 transition-colors hover:bg-neutral-800"
    >
      {label}
    </button>
  );
}

function PickerView({
  contestants,
  holdings,
  supplyFor,
  params,
  selectedId,
  onPick,
  onBack,
}: {
  contestants: SheetContestant[];
  holdings: Record<string, number>;
  supplyFor: (id: string) => { S: number; T: number };
  params: PricingParams;
  selectedId: string;
  onPick: (id: string) => void;
  onBack: () => void;
}) {
  return (
    <div className="px-5 pb-6">
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:text-neutral-100"
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
        </button>
        <Dialog.Title className="text-sm font-semibold text-neutral-100">
          Select a contestant
        </Dialog.Title>
      </div>

      <ul className="mt-3 divide-y divide-neutral-800" role="list">
        {contestants.map((c) => {
          const { S, T } = supplyFor(c.id);
          const price = derivePrice(S, T, params);
          const owned = holdings[c.id] ?? 0;
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onPick(c.id)}
                className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:bg-neutral-900"
              >
                <Avatar contestant={c} size={36} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-neutral-100">
                    {c.name}
                  </span>
                  {owned > 0 && (
                    <span className="block text-xs text-neutral-500">
                      You own {owned.toFixed(4)}
                    </span>
                  )}
                </span>
                <span className="text-sm font-semibold text-neutral-200">
                  {sharePrice.format(price)}
                </span>
                {c.id === selectedId && (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-emerald-400"
                    aria-hidden="true"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ProcessingView() {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 border-t-neutral-200" />
      <p className="mt-4 text-sm text-neutral-400">Placing your trade…</p>
    </div>
  );
}

function FilledView({
  side,
  contestant,
  result,
  submittedAvgPrice,
  onTradeAgain,
  onDone,
}: {
  side: Side;
  contestant: SheetContestant;
  result: TradeResult | null;
  submittedAvgPrice: number | null;
  onTradeAgain: () => void;
  onDone: () => void;
}) {
  const shares = result?.shares ?? 0;
  const execPrice = result?.priceAtExecution ?? 0;
  // Show the shift notice only when execution drifted meaningfully from preview.
  const shifted =
    submittedAvgPrice != null &&
    execPrice > 0 &&
    Math.abs(execPrice - submittedAvgPrice) / submittedAvgPrice > 0.005;

  return (
    <div className="px-5 pb-6 pt-2">
      <div className="flex flex-col items-center py-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600/15 text-emerald-400">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <p className="mt-3 text-base font-semibold text-neutral-50">
          {side === "buy" ? "Trade filled" : "Shares sold"}
        </p>
        <p className="mt-1 text-sm text-neutral-400">
          {side === "buy" ? "Bought" : "Sold"} {shares.toFixed(4)} shares of{" "}
          {contestant.name}
        </p>
      </div>

      <dl className="space-y-2.5 rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
        <Row label="Execution price" value={sharePrice.format(execPrice)} strong />
        {shifted && submittedAvgPrice != null && (
          <p className="text-xs text-amber-400/90">
            Executed at {sharePrice.format(execPrice)} · preview was{" "}
            {sharePrice.format(submittedAvgPrice)}
          </p>
        )}
        <Row label="Fee" value={currency.format(result?.feeAmount ?? 0)} />
      </dl>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onTradeAgain}
          className="rounded-lg border border-neutral-700 py-3 text-sm font-semibold text-neutral-200 transition-colors hover:bg-neutral-900"
        >
          Trade again
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg bg-white py-3 text-sm font-semibold text-neutral-950 transition-colors hover:bg-neutral-100"
        >
          Done
        </button>
      </div>
    </div>
  );
}

function FailedView({
  result,
  onRetry,
  onDismiss,
}: {
  result: TradeResult | null;
  onRetry: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="px-5 pb-6 pt-2">
      <div className="flex flex-col items-center py-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-600/15 text-rose-400">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </div>
        <p className="mt-3 text-base font-semibold text-neutral-50">Trade failed</p>
        <p className="mt-1 text-sm text-neutral-400">
          {result?.error ?? "Your trade was not placed."}
        </p>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-lg border border-neutral-700 py-3 text-sm font-semibold text-neutral-200 transition-colors hover:bg-neutral-900"
        >
          Dismiss
        </button>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-white py-3 text-sm font-semibold text-neutral-950 transition-colors hover:bg-neutral-100"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
