"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { TradeSheet, type SheetContestant, type SheetSeason } from "./TradeSheet";

type Side = "buy" | "sell";

type OpenOptions = { contestantId: string; side?: Side };

type TradeContextValue = {
  /** Open the trade overlay pre-populated with a contestant (and optional side). */
  openTrade: (options: OpenOptions) => void;
};

const TradeContext = createContext<TradeContextValue | null>(null);

export function useTradeOverlay(): TradeContextValue {
  const ctx = useContext(TradeContext);
  if (!ctx) {
    throw new Error("useTradeOverlay must be used within a TradeProvider");
  }
  return ctx;
}

export type TradeProviderData = {
  season: SheetSeason | null;
  contestants: SheetContestant[];
  cashBalance: number;
  /** contestantId → shares held by the current user. */
  holdings: Record<string, number>;
};

export function TradeProvider({
  data,
  children,
}: {
  data: TradeProviderData;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [contestantId, setContestantId] = useState<string | null>(null);
  const [side, setSide] = useState<Side>("buy");

  const openTrade = useCallback(
    ({ contestantId, side = "buy" }: OpenOptions) => {
      // Trading is only possible in an active season.
      if (!data.season || data.season.status !== "active") return;
      setContestantId(contestantId);
      setSide(side);
      setOpen(true);
    },
    [data.season]
  );

  return (
    <TradeContext.Provider value={{ openTrade }}>
      {children}
      {/* Mount the sheet only while open so its realtime subscription isn't always-on. */}
      {open && contestantId && data.season && (
        <TradeSheet
          onClose={() => setOpen(false)}
          season={data.season}
          contestants={data.contestants}
          cashBalance={data.cashBalance}
          holdings={data.holdings}
          initialContestantId={contestantId}
          initialSide={side}
        />
      )}
    </TradeContext.Provider>
  );
}
