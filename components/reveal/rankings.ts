// Ranking + reveal math for the broadcast chart (issue #65a).
//
// Ported from `big-brother-season-data-vis/src/lib/rankings.ts`, behavior-
// preserving, with two adaptations for Reality Stock Watch:
//   1. `playerId` -> `contestantId` throughout.
//   2. Eviction is derived from PRESENCE, not an `eliminatedWeek` column. A
//      contestant who appears in week N-1 but not week N is treated as removed
//      between those weeks. This replaces the original's `eliminatedWeek`
//      checks in `calculateMovement` / `getActiveContestantsForWeek`.
//
// NOTE: This is a local, presentational port so the component runs in isolation.
// The frozen canonical port lives in `lib/reveal/rankings.ts` (issue #65b) and
// is locked with parity tests there; this copy is reconciled at integration.

import type {
  Contestant,
  ContestantMovement,
  RankingEntry,
  StatCard,
  Week,
  WeekRanking,
} from "./types";

export function entriesForWeek(rankings: WeekRanking[], weekNumber: number) {
  return rankings.find((ranking) => ranking.weekNumber === weekNumber)?.entries ?? [];
}

export function orderEntries(entries: RankingEntry[]) {
  return entries.slice().sort((a, b) => a.rank - b.rank);
}

/**
 * Apply reveal gating for a single week. Entries are ordered top-first and the
 * first `revealCount` become visible (in addition to anything pre-revealed).
 * Mirrors the original `visibleEntriesForWeek`.
 */
export function visibleEntriesForWeek(
  rankings: WeekRanking[],
  weekNumber: number,
  revealCount: number,
) {
  return orderEntries(entriesForWeek(rankings, weekNumber)).map((entry, index) => ({
    ...entry,
    revealed: index < revealCount || entry.revealed,
  }));
}

/**
 * Map a 1-based rank to a 1..11 visual band so weeks with different roster
 * sizes line up vertically. Unchanged from the original.
 */
export function calculateVisualRank(rank: number, activeCount: number) {
  if (activeCount <= 1) {
    return 1;
  }
  return 1 + ((rank - 1) / (activeCount - 1)) * 10;
}

/**
 * Net rank change vs. the previous week, corrected for contestants removed
 * (evicted) from above.
 *
 * Original logic counted "removed above" using `eliminatedWeek === weekNumber`.
 * We instead derive removal from presence: a contestant ranked above the
 * subject last week who is absent from this week's ranking. This keeps the
 * movement number honest (you don't get credited for rising past someone who
 * was simply evicted).
 */
export function calculateMovement(
  contestantId: string,
  weekNumber: number,
  rankings: WeekRanking[],
) {
  const currentEntries = entriesForWeek(rankings, weekNumber);
  const previousEntries = entriesForWeek(rankings, weekNumber - 1);
  const current = currentEntries.find((entry) => entry.contestantId === contestantId);
  const previous = previousEntries.find((entry) => entry.contestantId === contestantId);

  if (!current || !previous) {
    return 0;
  }

  const currentIds = new Set(currentEntries.map((entry) => entry.contestantId));
  const removedAbove = previousEntries.filter(
    (entry) => entry.rank < previous.rank && !currentIds.has(entry.contestantId),
  ).length;

  const expectedRank = previous.rank - removedAbove;
  return expectedRank - current.rank;
}

export function calculateMovements(
  selectedWeekNumber: number,
  rankings: WeekRanking[],
): ContestantMovement[] {
  const entries = orderEntries(entriesForWeek(rankings, selectedWeekNumber));
  const previousEntries = entriesForWeek(rankings, selectedWeekNumber - 1);
  const activeCount = Math.max(entries.length, 1);

  return entries.map((entry) => ({
    contestantId: entry.contestantId,
    rank: entry.rank,
    previousRank:
      previousEntries.find((previous) => previous.contestantId === entry.contestantId)?.rank ??
      null,
    movement: calculateMovement(entry.contestantId, selectedWeekNumber, rankings),
    visualRank: calculateVisualRank(entry.rank, activeCount),
  }));
}

function contestantName(contestants: Contestant[], contestantId: string | null) {
  return contestants.find((contestant) => contestant.id === contestantId)?.name ?? "No data";
}

export function calculateStats(
  selectedWeekNumber: number,
  rankings: WeekRanking[],
  contestants: Contestant[],
): StatCard[] {
  const movements = calculateMovements(selectedWeekNumber, rankings);
  const improved = movements.reduce<ContestantMovement | null>(
    (best, movement) => (best === null || movement.movement > best.movement ? movement : best),
    null,
  );
  const dropped = movements.reduce<ContestantMovement | null>(
    (worst, movement) => (worst === null || movement.movement < worst.movement ? movement : worst),
    null,
  );

  const recentWeeks = rankings
    .filter((ranking) => ranking.weekNumber <= selectedWeekNumber)
    .slice(-4);

  const consistency = contestants
    .map((contestant) => {
      const ranks = recentWeeks
        .map((ranking) => ranking.entries.find((entry) => entry.contestantId === contestant.id)?.rank)
        .filter((rank): rank is number => typeof rank === "number");

      if (ranks.length < 2) {
        return null;
      }

      const average = ranks.reduce((sum, rank) => sum + rank, 0) / ranks.length;
      const variance =
        ranks.reduce((sum, rank) => sum + Math.abs(rank - average), 0) / ranks.length;
      return { contestantId: contestant.id, variance, bestRank: Math.min(...ranks) };
    })
    .filter(
      (entry): entry is { contestantId: string; variance: number; bestRank: number } =>
        entry !== null,
    )
    .sort((a, b) => a.variance - b.variance || a.bestRank - b.bestRank)[0];

  return [
    {
      label: "Most Improved",
      contestantId: improved?.contestantId ?? null,
      value: contestantName(contestants, improved?.contestantId ?? null),
      detail:
        improved && improved.movement > 0
          ? `Rose ${improved.movement} ${improved.movement === 1 ? "spot" : "spots"} this week`
          : "No upward movement this week",
      tone: "up",
    },
    {
      label: "Most Consistent",
      contestantId: consistency?.contestantId ?? null,
      value: contestantName(contestants, consistency?.contestantId ?? null),
      detail: consistency ? "Held the steadiest recent ranking arc" : "Needs more weeks of data",
      tone: "steady",
    },
    {
      label: "Biggest Drop",
      contestantId: dropped?.contestantId ?? null,
      value: contestantName(contestants, dropped?.contestantId ?? null),
      detail:
        dropped && dropped.movement < 0
          ? `Fell ${Math.abs(dropped.movement)} ${Math.abs(dropped.movement) === 1 ? "spot" : "spots"} this week`
          : "No downward movement this week",
      tone: "down",
    },
  ];
}

/**
 * Apply reveal gating across all weeks and compute movements + stats for the
 * selected week. Mirrors the original `buildPublicState`: prior weeks are fully
 * revealed, the selected week is gated by `revealCount` (top-first), later
 * weeks stay hidden.
 */
export function buildBroadcastState(args: {
  season: { id: string; number: number };
  weeks: Week[];
  contestants: Contestant[];
  rankings: WeekRanking[];
  selectedWeekId: string;
  revealCount: number;
}) {
  const { season, weeks, contestants, rankings, selectedWeekId, revealCount } = args;
  const selectedWeek = weeks.find((week) => week.id === selectedWeekId) ?? weeks.at(-1);
  const selectedWeekNumber = selectedWeek?.weekNumber ?? 1;

  const hydratedRankings = rankings.map((ranking) => ({
    ...ranking,
    entries: orderEntries(ranking.entries).map((entry, index) => ({
      ...entry,
      revealed:
        ranking.weekNumber < selectedWeekNumber ||
        (ranking.weekNumber === selectedWeekNumber && index < revealCount) ||
        entry.revealed,
    })),
  }));

  return {
    season,
    weeks,
    contestants,
    rankings: hydratedRankings,
    movements: calculateMovements(selectedWeekNumber, rankings),
    stats: calculateStats(selectedWeekNumber, rankings, contestants),
  };
}
