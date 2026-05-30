"use client";

// Live wrapper around the presentational BroadcastChart (issue #65).
//
// The producer captures THIS window in OBS. The server hands us the season's
// rankings once; we hold the reveal pointer (selected week + reveal count) in
// state and subscribe to `survey_reveal_state` over Supabase Realtime. When the
// producer advances the reveal from the control panel (#66), the row changes,
// we bump the count, and `buildBroadcastState` re-gates — the next entry
// animates in live. No polling, no refetch.
//
// Spoiler note: every entry is present client-side, but the chart only ever
// DRAWS revealed ones (unrevealed render as "• • •" placeholders by design).
// Since the audience sees the OBS video — never this network payload — and the
// whole route is admin-only, that is the correct, simplest model here.

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BroadcastChart } from "./BroadcastChart";
import { buildBroadcastState } from "./rankings";
import { buildColorMap } from "./colors";
import type { RevealData } from "@/lib/reveal/source";

export function BroadcastLive({ initial }: { initial: RevealData }) {
  const [revealCount, setRevealCount] = useState(initial.revealCount);
  const [selectedWeekId, setSelectedWeekId] = useState(initial.selectedWeekId);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`reveal-state-${initial.season.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "survey_reveal_state",
          filter: `season_id=eq.${initial.season.id}`,
        },
        (payload) => {
          const row = payload.new as {
            reveal_count?: number;
            selected_survey_id?: string | null;
          };
          if (typeof row.reveal_count === "number") setRevealCount(row.reveal_count);
          if (row.selected_survey_id) setSelectedWeekId(row.selected_survey_id);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initial.season.id]);

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
