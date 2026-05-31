"use client";

// Producer reveal console (issue #66) — desktop-friendly admin panel the
// producer drives during a live stream. Three controls (survey select, Reveal
// Next, Reset) write to `survey_reveal_state` via server actions; an embedded
// live preview mirrors what the OBS-captured broadcast view at /admin/stream
// is showing right now. Both surfaces share the same Realtime subscription
// (useRevealState), so a click here animates everywhere — no refetch.

import { useMemo, useTransition } from "react";
import Link from "next/link";
import { BroadcastChart } from "./BroadcastChart";
import { buildBroadcastState } from "./rankings";
import { buildColorMap } from "./colors";
import { useRevealState } from "@/hooks/useRevealState";
import { revealNext, reset, setSelectedSurvey } from "@/lib/reveal/actions";
import type { RevealData } from "@/lib/reveal/source";

type Props = { initial: RevealData };

export function RevealConsole({ initial }: Props) {
  const [isPending, startTransition] = useTransition();
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

  // The chart's "selected week" is whichever survey is on screen. The frozen
  // logic gates that week's entries by revealCount; prior weeks ship whole.
  const selectedWeek = initial.weeks.find((week) => week.id === selectedWeekId);
  const entriesInSelected =
    initial.rankings.find((ranking) => ranking.weekId === selectedWeekId)?.entries.length ?? 0;

  const atStart = revealCount === 0;
  const atEnd = revealCount >= entriesInSelected;

  return (
    <div className="grid h-dvh grid-cols-[360px_1fr] gap-0 bg-neutral-950 text-slate-100">
      {/* Producer controls. Desktop-only; the producer runs this in a separate
          window from the OBS-captured /admin/stream view. */}
      <aside className="flex min-h-0 flex-col border-r border-white/10 bg-[#0a0c14] p-6">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
            Season {initial.season.number}
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white">Reveal console</h1>
          <p className="mt-1 text-sm text-slate-400">
            Drives{" "}
            <Link
              href="/admin/stream"
              target="_blank"
              className="underline decoration-slate-600 underline-offset-4 hover:text-sky-300"
            >
              /admin/stream
            </Link>{" "}
            (capture this in OBS).
          </p>
        </div>

        <label className="mb-6 block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
            Selected survey
          </span>
          <select
            value={selectedWeekId}
            disabled={isPending}
            onChange={(event) => {
              const next = event.target.value;
              startTransition(() => {
                void setSelectedSurvey(next);
              });
            }}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-base font-semibold text-white outline-none focus:border-sky-400"
          >
            {initial.weeks.map((week) => (
              <option key={week.id} value={week.id}>
                Week {week.weekNumber} — {week.title}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-slate-500">
            Switching resets revealed entries to 0.
          </p>
        </label>

        <div className="mb-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">On air</p>
          <p className="mt-1 text-3xl font-black tracking-tight text-white">
            WK {selectedWeek?.weekNumber ?? "?"}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Revealed{" "}
            <span className="font-bold tabular-nums text-white">
              {Math.min(revealCount, entriesInSelected)}
            </span>{" "}
            of <span className="tabular-nums">{entriesInSelected}</span>
          </p>
        </div>

        <div className="mt-auto flex flex-col gap-3">
          <button
            type="button"
            disabled={isPending || atEnd}
            onClick={() => startTransition(() => void revealNext())}
            className="rounded-xl bg-sky-500 px-4 py-3 text-base font-black uppercase tracking-wider text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 disabled:shadow-none"
          >
            {atEnd ? "Fully revealed" : "Reveal next"}
          </button>
          <button
            type="button"
            disabled={isPending || atStart}
            onClick={() => startTransition(() => void reset())}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold uppercase tracking-wider text-slate-200 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Reset to zero
          </button>
        </div>
      </aside>

      {/* Live preview — exactly what /admin/stream is rendering right now. */}
      <main className="flex min-h-0 flex-col">
        <div className="border-b border-white/10 bg-[#0a0c14] px-6 py-2 text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
          Live preview
        </div>
        <div className="flex flex-1 items-center justify-center overflow-hidden bg-[#05060b] p-4">
          <div className="aspect-video h-full max-h-full w-full max-w-full overflow-hidden rounded-xl shadow-2xl">
            <BroadcastChart state={state} selectedWeekId={selectedWeekId} colorOf={colorOf} />
          </div>
        </div>
      </main>
    </div>
  );
}
