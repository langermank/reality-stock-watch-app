"use client";

// Broadcast trajectory chart — pure presentational component.
//
// Ported from `big-brother-season-data-vis/src/components/StreamVisualization.tsx`.
// SVG geometry kept faithful (lines, dots, hover, leaderboard sidebar, stat
// cards). Styling redesigned for OBS/livestream capture: near-black backdrop,
// oversized type, thick strokes, large avatars — tuned to stay legible on a
// big screen and survive stream-encoder compression.
//
// Fetches nothing. Receives a fully reveal-gated `BroadcastState`, the selected
// week id, and a contestant→color map. `BroadcastLive` (chrome-less view at
// /admin/stream) and `RevealConsole` (producer panel at /admin/reveal) both
// feed it; their Realtime subscriptions are what make reveals animate in live.

import { useMemo, useState, type CSSProperties } from "react";
import type { BroadcastState, WeekRanking } from "./types";
import { calculateVisualRank, orderEntries } from "./rankings";

type Props = {
  state: BroadcastState;
  selectedWeekId: string;
  /** Stable color per contestant id (see colors.ts). */
  colorOf: (contestantId: string) => string;
  // ---- Ephemeral interaction overrides (#78) ----
  /** When set, overrides local hover so a remote sender can drive the highlight. */
  forcedHoveredId?: string | null;
  /** When set, a contestant id stays highlighted regardless of hover — the
   *  click-to-focus state. */
  focusedId?: string | null;
  /** Fired when hover changes locally. Senders broadcast this. */
  onHoverChange?: (contestantId: string | null) => void;
  /** Fired when a contestant row is clicked. Senders use this to toggle focus. */
  onContestantClick?: (contestantId: string) => void;
  /** Fired when a week vertical is clicked. Senders broadcast a scrub. */
  onWeekClick?: (weekId: string) => void;
  /** Fired when a week vertical is hovered; null when no week is hovered. */
  onWeekHover?: (weekId: string | null) => void;
};

// SVG viewBox geometry — ported verbatim from the original. The chart scales to
// its container via `viewBox`, so these are abstract units, not pixels.
const chart = {
  left: 150,
  right: 230,
  top: 56,
  bottom: 72,
  width: 1280,
  height: 720,
};

function contestantById(state: BroadcastState, contestantId: string) {
  return state.contestants.find((contestant) => contestant.id === contestantId);
}

function activeCount(ranking: WeekRanking) {
  return Math.max(ranking.entries.length, 1);
}

function movementLabel(movement: number) {
  if (movement > 0) return `▲${movement}`;
  if (movement < 0) return `▼${Math.abs(movement)}`;
  return "—";
}

function movementClass(movement: number) {
  if (movement > 0) return "text-emerald-300";
  if (movement < 0) return "text-rose-300";
  return "text-slate-400";
}

function movementFill(movement: number) {
  if (movement > 0) return "fill-emerald-300";
  if (movement < 0) return "fill-rose-300";
  return "fill-slate-500";
}

export function BroadcastChart({
  state,
  selectedWeekId,
  colorOf,
  forcedHoveredId,
  focusedId,
  onHoverChange,
  onContestantClick,
  onWeekClick,
  onWeekHover,
}: Props) {
  const [localHovered, setLocalHovered] = useState<string | null>(null);

  // Effective highlight: forced > focused > local. forcedHoveredId !== undefined
  // means a remote sender is driving us; null means "actively no hover" (clear
  // the highlight). focusedId is sustained click-state.
  const hovered =
    forcedHoveredId !== undefined ? forcedHoveredId : (focusedId ?? localHovered);

  const setHovered = (next: string | null) => {
    setLocalHovered(next);
    onHoverChange?.(next);
  };

  const selectedWeek =
    state.weeks.find((week) => week.id === selectedWeekId) ?? state.weeks.at(-1);
  const selectedRanking = state.rankings.find(
    (ranking) => ranking.weekId === selectedWeek?.id,
  );
  const selectedEntries = orderEntries(selectedRanking?.entries ?? []);
  const selectedWeekNumber = selectedWeek?.weekNumber ?? 1;
  const movementByContestant = useMemo(
    () => new Map(state.movements.map((movement) => [movement.contestantId, movement])),
    [state.movements],
  );

  // X positions per week + Y per entry. Faithful port of the original geometry:
  //   x = left + drawableWidth * weekIndex / max(weeks-1, 1)
  //   y = top  + ((visualRank - 1) / 10) * drawableHeight
  // visualRank maps a 1-based rank into a 1..11 band so weeks with different
  // roster sizes line up vertically.
  const geometry = useMemo(() => {
    const drawableWidth = chart.width - chart.left - chart.right;
    const drawableHeight = chart.height - chart.top - chart.bottom;
    const weekSpan = Math.max(state.weeks.length - 1, 1);

    return state.rankings.map((ranking, weekIndex) => {
      const x = chart.left + (drawableWidth * weekIndex) / weekSpan;
      return {
        ...ranking,
        x,
        points: ranking.entries.map((entry) => ({
          ...entry,
          weekNumber: ranking.weekNumber,
          x,
          y:
            chart.top +
            ((calculateVisualRank(entry.rank, activeCount(ranking)) - 1) / 10) * drawableHeight,
        })),
      };
    });
  }, [state.rankings, state.weeks.length]);

  const gridBands = ["Top", "Upper", "Median", "Lower", "Bottom"];

  return (
    <div className="grid h-full w-full grid-cols-[minmax(300px,0.26fr)_1fr] gap-5 bg-[#05060b] p-6 text-slate-100">
      {/* Leaderboard sidebar — the selected (live) week's ranking, gated. */}
      <aside className="flex min-h-0 flex-col rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-5 shadow-2xl">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-slate-500">
              Season {state.season.number}
            </p>
            <h1 className="text-4xl font-black leading-none tracking-tight text-white">
              Fan Rankings
            </h1>
          </div>
          <span className="rounded-lg bg-sky-500 px-3 py-1.5 text-lg font-black text-white shadow-lg shadow-sky-500/30">
            WK {selectedWeekNumber}
          </span>
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-hidden">
          {selectedEntries.map((entry) => {
            const contestant = contestantById(state, entry.contestantId);
            const movement = movementByContestant.get(entry.contestantId)?.movement ?? 0;
            const isRevealed = entry.revealed;
            const color = colorOf(entry.contestantId);
            const isDimmed = isRevealed && hovered !== null && hovered !== entry.contestantId;

            return (
              <div
                key={entry.contestantId}
                role={isRevealed ? "button" : undefined}
                onMouseEnter={() => isRevealed && setHovered(entry.contestantId)}
                onMouseLeave={() => isRevealed && setHovered(null)}
                onClick={() => isRevealed && onContestantClick?.(entry.contestantId)}
                className={`grid grid-cols-[48px_56px_1fr_auto] items-center gap-3 rounded-xl border p-2.5 transition-opacity ${
                  isRevealed
                    ? "border-white/10 bg-white/[0.04]"
                    : "border-dashed border-white/[0.08] bg-white/[0.015]"
                } ${isDimmed ? "opacity-40" : "opacity-100"}`}
              >
                <span
                  className={`grid h-11 w-11 place-items-center rounded-xl text-2xl font-black tabular-nums ${
                    isRevealed && entry.rank <= 3
                      ? "text-[#05060b]"
                      : isRevealed
                        ? "bg-white/5 text-slate-200"
                        : "bg-white/[0.03] text-slate-600"
                  }`}
                  style={
                    isRevealed && entry.rank <= 3
                      ? { backgroundColor: color, boxShadow: `0 0 24px ${color}66` }
                      : undefined
                  }
                >
                  {entry.rank}
                </span>
                <span
                  className="grid h-12 w-12 place-items-center overflow-hidden rounded-full border-[3px]"
                  style={{
                    borderColor: isRevealed ? color : "rgba(255,255,255,0.08)",
                    background: "#0b0d16",
                  }}
                >
                  {isRevealed && contestant?.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className="h-full w-full object-cover"
                      src={contestant.photoUrl}
                      alt=""
                    />
                  ) : null}
                </span>
                <span className="truncate text-2xl font-black tracking-tight text-white">
                  {isRevealed ? contestant?.name : "• • •"}
                </span>
                {isRevealed ? (
                  <span className={`text-xl font-black tabular-nums ${movementClass(movement)}`}>
                    {movementLabel(movement)}
                  </span>
                ) : (
                  <span />
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main column: trajectory chart + stat cards. */}
      <main className="grid min-w-0 grid-rows-[1fr_150px] gap-5">
        <section className="relative min-h-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0c14] shadow-2xl">
          {/* Subtle vignette for broadcast depth. */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_0%,rgba(56,189,248,0.07),transparent_60%)]" />
          <svg
            className="relative h-full w-full"
            viewBox={`0 0 ${chart.width} ${chart.height}`}
            role="img"
            preserveAspectRatio="xMidYMid meet"
          >
            <title>Week-by-week fan ranking trajectory</title>

            {/* Horizontal grid bands. */}
            {gridBands.map((label, index) => {
              const y = chart.top + ((chart.height - chart.top - chart.bottom) * index) / 4;
              const edge = index === 0 || index === gridBands.length - 1;
              return (
                <g key={label}>
                  <line
                    x1={chart.left}
                    x2={chart.width - chart.right}
                    y1={y}
                    y2={y}
                    stroke={edge ? "#2a3550" : "#1a2236"}
                    strokeWidth={edge ? 2 : 1}
                    strokeDasharray={edge ? "0" : "4 10"}
                  />
                  <text
                    x={chart.left - 18}
                    y={y + 7}
                    textAnchor="end"
                    className="fill-slate-500 text-[20px] font-black uppercase tracking-wider"
                  >
                    {label}
                  </text>
                </g>
              );
            })}

            {/* Week verticals + axis labels. */}
            {geometry.map((week) => {
              const clickable = Boolean(onWeekClick);
              return (
                <g key={week.weekId}>
                  <line
                    x1={week.x}
                    x2={week.x}
                    y1={chart.top}
                    y2={chart.height - chart.bottom}
                    stroke={week.weekNumber === selectedWeekNumber ? "#38bdf8" : "#1a2236"}
                    strokeWidth={week.weekNumber === selectedWeekNumber ? 2.5 : 1}
                    strokeDasharray="3 9"
                  />
                  <text
                    x={week.x}
                    y={chart.height - 26}
                    textAnchor="middle"
                    className={`text-[22px] font-black ${
                      week.weekNumber === selectedWeekNumber ? "fill-sky-300" : "fill-slate-500"
                    }`}
                  >
                    WK {week.weekNumber}
                  </text>
                  {/* Generous click + hover target so scrubbing doesn't require pixel-precision. */}
                  {(clickable || onWeekHover) && (
                    <rect
                      x={week.x - 40}
                      y={chart.top}
                      width={80}
                      height={chart.height - chart.top - chart.bottom + 20}
                      fill="transparent"
                      style={{ cursor: clickable ? "pointer" : "default" }}
                      onClick={() => onWeekClick?.(week.weekId)}
                      onMouseEnter={() => onWeekHover?.(week.weekId)}
                      onMouseLeave={() => onWeekHover?.(null)}
                    />
                  )}
                </g>
              );
            })}

            {/* One trajectory line per contestant. Only REVEALED points are
                drawn; an unrevealed live-week point hides that segment. A line
                also simply ends when the contestant stops appearing (eviction
                by presence). */}
            {state.contestants.map((contestant) => {
              const points = geometry
                .map((week) => week.points.find((point) => point.contestantId === contestant.id))
                .filter((point): point is NonNullable<typeof point> => Boolean(point?.revealed));
              if (points.length === 0) return null;

              const color = colorOf(contestant.id);
              const path = points
                .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
                .join(" ");
              const isHovered = hovered === contestant.id;
              const active = hovered === null || isHovered;

              return (
                <g key={contestant.id} opacity={active ? 1 : 0.14}>
                  {/* Soft glow underlay for broadcast pop. */}
                  <path
                    d={path}
                    fill="none"
                    stroke={color}
                    strokeWidth={isHovered ? 14 : 9}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.22}
                  />
                  <path
                    d={path}
                    fill="none"
                    stroke={color}
                    strokeWidth={isHovered ? 7 : 4.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="broadcast-line"
                    style={{ "--path-length": 1400 } as CSSProperties}
                  />
                  {points.map((point) => (
                    <circle
                      key={`${contestant.id}-${point.weekNumber}`}
                      cx={point.x}
                      cy={point.y}
                      r={isHovered ? 11 : 8}
                      fill={color}
                      stroke="#05060b"
                      strokeWidth={4}
                      className="broadcast-dot"
                    />
                  ))}
                </g>
              );
            })}

            {/* End-of-line name labels for the selected week's revealed entries. */}
            {selectedEntries.map((entry) => {
              const contestant = contestantById(state, entry.contestantId);
              const point = geometry
                .find((week) => week.weekNumber === selectedWeekNumber)
                ?.points.find((candidate) => candidate.contestantId === entry.contestantId);
              const movement = movementByContestant.get(entry.contestantId)?.movement ?? 0;

              if (!contestant || !point || !entry.revealed) return null;
              const dim = hovered !== null && hovered !== contestant.id;

              return (
                <g key={`label-${entry.contestantId}`} opacity={dim ? 0.2 : 1}>
                  <text
                    x={chart.width - chart.right + 22}
                    y={point.y - 6}
                    className="fill-white text-[26px] font-black"
                  >
                    {contestant.name}
                  </text>
                  <text
                    x={chart.width - chart.right + 22}
                    y={point.y + 22}
                    className={`text-[20px] font-black ${movementFill(movement)}`}
                  >
                    #{entry.rank} {movementLabel(movement)}
                  </text>
                </g>
              );
            })}
          </svg>
        </section>

        {/* Stat cards. */}
        <section className="grid grid-cols-3 gap-5">
          {state.stats.map((stat) => (
            <article
              key={stat.label}
              className="flex flex-col justify-center rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center shadow-xl"
            >
              <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-500">
                {stat.label}
              </p>
              <h2
                className={`mt-1 truncate text-4xl font-black tracking-tight ${
                  stat.tone === "up"
                    ? "text-emerald-300"
                    : stat.tone === "down"
                      ? "text-rose-300"
                      : "text-sky-300"
                }`}
              >
                {stat.value}
              </h2>
              <p className="mt-1.5 text-lg font-semibold text-slate-400">{stat.detail}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
