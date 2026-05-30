// In-memory fixtures so the broadcast chart runs in isolation (issue #65a).
//
// Ported from `big-brother-season-data-vis/src/lib/mockData.ts`, reshaped to
// Reality Stock Watch types. Differences from the source fixtures:
//   - No `color` column — colors are derived from id at render (see colors.ts).
//   - No `eliminatedWeek` — eviction is by PRESENCE (a contestant drops out of
//     later weekly orders). e.g. `kelley` is absent from week 7's order, so the
//     chart line simply ends after week 6.
//   - `imageUrl` -> `photoUrl`, populated with deterministic avatar URLs so the
//     sidebar shows photos without any backend.
//
// #65b replaces this entirely with seeded `survey_aggregate_rankings` over the
// data seam; the component never knows the difference.

import type { Contestant, Week, WeekRanking } from "./types";

export const mockSeason = {
  id: "season-30",
  number: 30,
};

const ROSTER: Array<[id: string, name: string]> = [
  ["rachel", "Rachel"],
  ["ashley", "Ashley"],
  ["will", "Will"],
  ["morgan", "Morgan"],
  ["ava", "Ava"],
  ["vince", "Vince"],
  ["lauren", "Lauren"],
  ["katherine", "Katherine"],
  ["mickey", "Mickey"],
  ["keanu", "Keanu"],
  ["kelley", "Kelley"],
  ["joey", "Joey"],
  ["jessica", "Jessica"],
];

export const mockContestants: Contestant[] = ROSTER.map(([id, name]) => ({
  id,
  seasonId: mockSeason.id,
  name,
  // Deterministic placeholder avatar so the chart has photos in isolation.
  photoUrl: `https://i.pravatar.cc/96?u=${id}`,
  status: "active",
}));

const TOTAL_WEEKS = 7;
/** The live week being revealed on stream. */
export const mockSelectedWeekId = `week-${TOTAL_WEEKS}`;
/** How many of the live week's entries the producer has revealed so far. */
export const mockRevealCount = 3;

export const mockWeeks: Week[] = Array.from({ length: TOTAL_WEEKS }, (_, index) => {
  const weekNumber = index + 1;
  return {
    id: `week-${weekNumber}`,
    seasonId: mockSeason.id,
    weekNumber,
    title: `Week ${weekNumber}`,
  };
});

// Top-first ordering per week. A contestant absent from a week's order is
// treated as evicted from that week onward (presence-based eviction).
const weeklyOrders: string[][] = [
  ["rachel", "morgan", "lauren", "mickey", "ashley", "katherine", "will", "joey", "jessica", "ava", "vince", "keanu", "kelley"],
  ["ava", "rachel", "mickey", "morgan", "will", "joey", "katherine", "jessica", "ashley", "lauren", "vince", "kelley", "keanu"],
  ["ava", "rachel", "mickey", "morgan", "will", "joey", "ashley", "jessica", "katherine", "lauren", "vince", "kelley"],
  ["ava", "rachel", "ashley", "will", "lauren", "jessica", "katherine", "vince", "keanu", "morgan", "mickey", "kelley"],
  ["rachel", "ava", "ashley", "will", "lauren", "morgan", "jessica", "vince", "keanu", "mickey", "kelley"],
  ["rachel", "ava", "will", "katherine", "lauren", "keanu", "vince", "ashley", "morgan", "mickey", "kelley"],
  ["rachel", "ashley", "will", "morgan", "ava", "vince", "lauren", "katherine", "mickey", "keanu"],
];

export const mockRankings: WeekRanking[] = weeklyOrders.map((order, index) => ({
  weekId: `week-${index + 1}`,
  weekNumber: index + 1,
  entries: order.map((contestantId, orderIndex) => ({
    contestantId,
    rank: orderIndex + 1,
    // Borda-flavored score (higher = better) with mild weekly drift for spread.
    score: Math.round((100 - orderIndex * 5.7 + index * 1.3) * 10) / 10,
    // Raw fixture reveal flag; reveal gating is applied by buildBroadcastState.
    revealed: index + 1 < TOTAL_WEEKS,
  })),
}));
