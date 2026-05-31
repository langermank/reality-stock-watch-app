"use client";

// Live wrapper around the presentational BroadcastChart — the chrome-less
// broadcast view the producer captures with OBS (issues #65, #78).
//
// Two layers of Realtime subscription drive what's on screen:
//   - useRevealState: persistent reveal pointer (which week is on air, how
//     many entries revealed). DB-backed, postgres_changes Realtime.
//   - useRevealCursor: ephemeral interaction state from the producer console
//     — hover, click-to-focus, week scrub. Broadcast-channel Realtime, no DB.
//
// When the producer hovers a contestant in /admin/reveal, this surface sees
// the broadcast and re-renders the chart with the same highlight. The OBS
// capture mirrors the producer's pointer without showing their cursor.

import { useMemo } from "react";
import { BroadcastChart } from "./BroadcastChart";
import { buildBroadcastState } from "./rankings";
import { buildColorMap } from "./colors";
import { useRevealState } from "@/hooks/useRevealState";
import { useRevealCursor } from "@/hooks/useRevealCursor";
import type { RevealData } from "@/lib/reveal/source";

export function BroadcastLive({ initial }: { initial: RevealData }) {
  const { selectedWeekId: dbSelectedWeekId, revealCount } = useRevealState(initial.season.id, {
    selectedWeekId: initial.selectedWeekId,
    revealCount: initial.revealCount,
  });
  const { cursor } = useRevealCursor(initial.season.id);

  // Hover-scrub overrides the on-air pointer locally so the producer can
  // jump to a prior week without actually changing what's on air.
  const effectiveWeekId = cursor.scrubbedWeekId ?? dbSelectedWeekId;

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
        selectedWeekId: effectiveWeekId,
        revealCount,
      }),
    [initial, effectiveWeekId, revealCount],
  );

  return (
    <div className="h-dvh w-full bg-[#05060b]">
      <BroadcastChart
        state={state}
        selectedWeekId={effectiveWeekId}
        colorOf={colorOf}
        forcedHoveredId={cursor.hoveredId}
        focusedId={cursor.focusedId}
      />
    </div>
  );
}
