// Types + pure helpers for season management. Kept separate from
// lib/admin/seasons.ts because that file is `"use server"` and can only
// export async server actions.

export type SeasonStatus =
  | "setup"
  | "pre_season"
  | "active"
  | "ended"
  | "results_published";

const NEXT_STATUS: Record<SeasonStatus, SeasonStatus | null> = {
  setup: "pre_season",
  pre_season: "active",
  active: "ended",
  ended: "results_published",
  results_published: null,
};

export function nextSeasonStatus(status: SeasonStatus): SeasonStatus | null {
  return NEXT_STATUS[status];
}
