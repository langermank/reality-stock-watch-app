"use client";

// TEMPORARY dev preview for issue #65a — verify the broadcast chart visually.
//
// This route exists ONLY to render BroadcastChart against in-memory fixtures so
// it can be screenshotted in isolation. It does NOT fetch, gate, or auth.
// Issue #65b builds the real admin-gated /stream route over Supabase Realtime
// and this file should be deleted then.

import { useMemo, useState } from "react";
import { BroadcastChart } from "@/components/reveal/BroadcastChart";
import { buildColorMap } from "@/components/reveal/colors";
import { buildBroadcastState } from "@/components/reveal/rankings";
import {
  mockContestants,
  mockRankings,
  mockSeason,
  mockSelectedWeekId,
  mockWeeks,
} from "@/components/reveal/mockData";

const PRESETS: Array<{ label: string; revealCount: number }> = [
  { label: "Mid-reveal (3 shown)", revealCount: 3 },
  { label: "Just started (1 shown)", revealCount: 1 },
  { label: "Fully revealed", revealCount: 99 },
];

export default function RevealPreviewPage() {
  const [presetIndex, setPresetIndex] = useState(0);
  const revealCount = PRESETS[presetIndex].revealCount;

  const colorMap = useMemo(
    () => buildColorMap(mockContestants.map((contestant) => contestant.id)),
    [],
  );
  const colorOf = (id: string) => colorMap.get(id) ?? "#94a3b8";

  const state = useMemo(
    () =>
      buildBroadcastState({
        season: mockSeason,
        weeks: mockWeeks,
        contestants: mockContestants,
        rankings: mockRankings,
        selectedWeekId: mockSelectedWeekId,
        revealCount,
      }),
    [revealCount],
  );

  return (
    <div className="flex h-screen flex-col bg-black">
      <div className="flex items-center gap-3 border-b border-white/10 bg-neutral-950 px-4 py-2 text-sm text-neutral-400">
        <span className="font-mono text-xs uppercase tracking-widest text-amber-400">
          TEMP PREVIEW · #65a
        </span>
        {PRESETS.map((preset, index) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => setPresetIndex(index)}
            className={`rounded px-3 py-1 font-semibold transition ${
              index === presetIndex
                ? "bg-sky-500 text-white"
                : "bg-white/5 text-neutral-300 hover:bg-white/10"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
      {/* 16:9 broadcast canvas — what OBS would capture. */}
      <div className="flex flex-1 items-center justify-center overflow-hidden p-4">
        <div className="aspect-video h-full max-h-full w-full max-w-full overflow-hidden rounded-xl">
          <BroadcastChart state={state} selectedWeekId={mockSelectedWeekId} colorOf={colorOf} />
        </div>
      </div>
    </div>
  );
}
