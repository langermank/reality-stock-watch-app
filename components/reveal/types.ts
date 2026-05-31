// View types for the broadcast trajectory chart + reveal console.
//
// Adapted from `big-brother-season-data-vis`'s `domain.ts` to Reality Stock
// Watch:
//   - `Player.color`          -> derived from id (no color column here)
//   - `Player.imageUrl`       -> `Contestant.photoUrl` (our `photo_url`)
//   - `Player.eliminatedWeek` -> dropped; eviction is derived from presence
//
// The data seam (`lib/reveal/source.ts`) emits these shapes; the chart, live
// wrapper, and producer console consume them.

export type ContestantStatus = "active" | "evicted" | "jury" | "winner";

/** A tradeable contestant, mirroring our `contestants` row (camelCased subset). */
export type Contestant = {
  id: string;
  seasonId: string;
  name: string;
  /** Maps to `contestants.photo_url`; may be null when no photo exists. */
  photoUrl: string | null;
  status: ContestantStatus;
};

/** One contestant's standing within a single week's ranking. */
export type RankingEntry = {
  contestantId: string;
  /** 1 = top of the ranking. */
  rank: number;
  /** Y-axis magnitude (Borda points or avg-rank score). Higher = better. */
  score: number;
  /**
   * Whether this entry has been revealed on stream. For prior (closed) weeks
   * this is always true. For the live week it is gated by `revealCount`.
   * The chart NEVER draws an unrevealed entry.
   */
  revealed: boolean;
};

/** Aggregate ranking for a single week / survey. */
export type WeekRanking = {
  weekId: string;
  weekNumber: number;
  entries: RankingEntry[];
};

export type Week = {
  id: string;
  seasonId: string;
  weekNumber: number;
  title: string;
};

/** Per-contestant movement vs. the previous week. */
export type ContestantMovement = {
  contestantId: string;
  rank: number;
  previousRank: number | null;
  movement: number;
  visualRank: number;
};

export type StatCard = {
  label: string;
  contestantId: string | null;
  value: string;
  detail: string;
  tone: "up" | "steady" | "down";
};

/**
 * Everything the chart needs to render, with reveal gating already applied.
 * Mirrors the original `PublicState` so #65b can feed it real data over
 * Realtime without reshaping the component.
 */
export type BroadcastState = {
  season: { id: string; number: number };
  weeks: Week[];
  contestants: Contestant[];
  rankings: WeekRanking[];
  movements: ContestantMovement[];
  stats: StatCard[];
};
