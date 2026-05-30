// Data seam for the livestream reveal feature (issue #65).
//
// One module the broadcast view (and later the producer panel, #66) reads
// from. Today it returns the seeded `survey_aggregate_rankings` snapshots;
// later the SAME signature reads rankings produced by close-time aggregation
// of real fan responses (#41). Consumers never know which is live.
//
// Reads run in the producer's authenticated (admin) session — the reveal
// tables are admin-only via RLS, so no public path exists. The view types
// are the chart's presentational shapes (components/reveal/types); the seam
// adapts raw rows into them so the chart is unchanged by the data source.
//
// NOTE: Supabase's generated `Database` types don't narrow the `.from().select()`
// chains cleanly in this project (see lib/admin.ts), so query results are cast
// to explicit row shapes — the established convention in the server reads.

import { createClient } from "@/lib/supabase/server";
import type {
  Contestant,
  ContestantStatus,
  RankingEntry,
  Week,
  WeekRanking,
} from "@/components/reveal/types";

export type RevealData = {
  season: { id: string; number: number };
  contestants: Contestant[];
  weeks: Week[];
  rankings: WeekRanking[];
  /** The week (survey) the producer currently has on screen. */
  selectedWeekId: string;
  /** How many of the selected week's entries are revealed (top-first). */
  revealCount: number;
};

type RankingRow = {
  survey_id: string;
  contestant_id: string;
  rank: number;
  score: string;
};

/**
 * Pull a season "number" out of its name ("Big Brother 27" -> 27). The seasons
 * table has no numeric column; the chart only uses this for the header label.
 */
export function seasonNumberFromName(name: string): number {
  const match = name.match(/(\d+)/);
  return match ? Number(match[1]) : 1;
}

/**
 * Group raw aggregate-ranking rows into per-week rankings (component shape).
 * Pure + exported so it can be unit-tested without a database. Only weeks that
 * actually have ranking rows are returned; entries are ordered top-first and
 * `revealed` is left false here — reveal gating is applied downstream by
 * `buildBroadcastState` against the live `revealCount`.
 */
export function buildWeekRankings(
  rows: RankingRow[],
  weeks: Pick<Week, "id" | "weekNumber">[],
): WeekRanking[] {
  const weekById = new Map(weeks.map((week) => [week.id, week]));
  const bySurvey = new Map<string, RankingRow[]>();
  for (const row of rows) {
    const list = bySurvey.get(row.survey_id) ?? [];
    list.push(row);
    bySurvey.set(row.survey_id, list);
  }

  const rankings: WeekRanking[] = [];
  for (const [surveyId, surveyRows] of bySurvey) {
    const week = weekById.get(surveyId);
    if (!week) continue;
    const entries: RankingEntry[] = surveyRows
      .slice()
      .sort((a, b) => a.rank - b.rank)
      .map((row) => ({
        contestantId: row.contestant_id,
        rank: row.rank,
        score: Number(row.score),
        revealed: false,
      }));
    rankings.push({ weekId: surveyId, weekNumber: week.weekNumber, entries });
  }

  return rankings.sort((a, b) => a.weekNumber - b.weekNumber);
}

/**
 * Load everything the broadcast chart needs for the active season: contestants,
 * the weeks (surveys) that have aggregate rankings, those rankings, and the
 * producer's current reveal pointer. Returns null when there is no active
 * season or no ranking data to show yet.
 */
export async function getRevealData(): Promise<RevealData | null> {
  const supabase = await createClient();

  const { data: seasonRow } = await supabase
    .from("seasons")
    .select("id, name")
    .eq("status", "active")
    .maybeSingle();

  const season = seasonRow as { id: string; name: string } | null;
  if (!season) return null;

  const [{ data: cRows }, { data: sRows }, { data: rRow }] = await Promise.all([
    supabase.from("contestants").select("id, name, photo_url, status").eq("season_id", season.id),
    supabase.from("surveys").select("id, week_number, title").eq("season_id", season.id),
    supabase
      .from("survey_reveal_state")
      .select("selected_survey_id, reveal_count")
      .eq("season_id", season.id)
      .maybeSingle(),
  ]);

  const contestantRows = (cRows ?? []) as Array<{
    id: string;
    name: string;
    photo_url: string | null;
    status: string;
  }>;
  const surveys = (sRows ?? []) as Array<{ id: string; week_number: number; title: string }>;
  const revealRow = rRow as { selected_survey_id: string | null; reveal_count: number } | null;

  const surveyIds = surveys.map((survey) => survey.id);
  if (surveyIds.length === 0) return null;

  const { data: rkRows } = await supabase
    .from("survey_aggregate_rankings")
    .select("survey_id, contestant_id, rank, score")
    .in("survey_id", surveyIds);

  const allWeeks: Week[] = surveys.map((survey) => ({
    id: survey.id,
    seasonId: season.id,
    weekNumber: survey.week_number,
    title: survey.title,
  }));

  const rankings = buildWeekRankings((rkRows ?? []) as RankingRow[], allWeeks);
  if (rankings.length === 0) return null;

  // Keep only weeks that have rankings, ordered for the X-axis.
  const rankedWeekIds = new Set(rankings.map((ranking) => ranking.weekId));
  const weeks = allWeeks
    .filter((week) => rankedWeekIds.has(week.id))
    .sort((a, b) => a.weekNumber - b.weekNumber);

  const contestants: Contestant[] = contestantRows.map((row) => ({
    id: row.id,
    seasonId: season.id,
    name: row.name,
    photoUrl: row.photo_url,
    status: row.status as ContestantStatus,
  }));

  const selectedWeekId =
    (revealRow?.selected_survey_id && rankedWeekIds.has(revealRow.selected_survey_id)
      ? revealRow.selected_survey_id
      : weeks.at(-1)?.id) ?? weeks[0].id;

  return {
    season: { id: season.id, number: seasonNumberFromName(season.name) },
    contestants,
    weeks,
    rankings,
    selectedWeekId,
    revealCount: revealRow?.reveal_count ?? 0,
  };
}
