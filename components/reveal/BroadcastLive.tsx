"use client";

// Live wrapper around the presentational BroadcastChart — the chrome-less
// broadcast view the producer captures with OBS (issue #65).
//
// Reveal-pointer subscription lives in useRevealState (shared with #66's
// producer console). The producer's clicks fan out to every subscriber via
// Supabase Realtime; this surface re-gates and the next entry animates in
// without a reload.
//
// Spoiler note: every entry is present client-side, but the chart only DRAWS
// revealed ones (unrevealed render as "• • •" placeholders by design). Since
// the audience sees the OBS video — never this network payload — and the route
// is admin-only, that is the correct, simplest model here.

import { useMemo } from "react";
import { BroadcastChart } from "./BroadcastChart";
import { buildBroadcastState } from "./rankings";
import { buildColorMap } from "./colors";
import { useRevealState } from "@/hooks/useRevealState";
import type { RevealData } from "@/lib/reveal/source";

export function BroadcastLive({ initial }: { initial: RevealData }) {
  const { selectedWeekId, revealCount } = useRevealState(initial.season.id, {
    selectedWeekId: initial.selectedWeekId,
    revealCount: initial.revealCount,
  });

  const colorOf = useMemo(() => {
    const map = buildColorMap(initial.contestants.map((contestant) => contestant.id));
    return (id: string) => map.get(id) ?? "#94a3b8";
  }, [initial.contestants]);

  const state = useMemo(
    () =>
      buildBroadcastState({
        season: initial.season,
        weeks: initial.weeks,
        contestants: initial.contestants,
        rankings: initial.rankings,
        selectedWeekId,
        revealCount,
      }),
    [initial, selectedWeekId, revealCount],
  );

  return (
    <div className="h-dvh w-full bg-[#05060b]">
      <BroadcastChart state={state} selectedWeekId={selectedWeekId} colorOf={colorOf} />
    </div>
  );
}
