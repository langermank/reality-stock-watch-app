"use server";

// Producer reveal-state mutations (issue #66).
//
// Three actions, mirroring the frozen reveal model (decision #7): single
// integer reveal_count, top-first, single "Reveal Next" + "Reset" + week
// select. Writes flow through Supabase Realtime to every subscriber — the
// producer's embedded preview AND the broadcast view in the OBS-captured
// window — so the producer's clicks animate everywhere live.
//
// Authorization is the same chain as every other admin write: middleware
// requires a session for /admin/*; AdminLayout calls requireAdmin() for the
// is_admin gate; the table's RLS enforces it again at the DB. We don't
// duplicate the gate here — but we do error out if the write returns nothing,
// which would indicate RLS rejection in the unlikely case any of those failed.

import { createClient } from "@/lib/supabase/server";

const SEASON_STATUS_ACTIVE = "active" as const;

/**
 * The active season's id — every action targets the season's single reveal
 * pointer row. Returns null when no season is active (the panel should be
 * showing an empty state in that case; we no-op rather than throw).
 */
async function getActiveSeasonId(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("seasons")
    .select("id")
    .eq("status", SEASON_STATUS_ACTIVE)
    .maybeSingle();
  return (data as { id: string } | null)?.id ?? null;
}

/**
 * Switch the survey on screen. Resets reveal_count to 0 — switching
 * mid-stream should never accidentally reveal entries from the new survey.
 */
export async function setSelectedSurvey(surveyId: string): Promise<void> {
  const seasonId = await getActiveSeasonId();
  if (!seasonId) return;

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("survey_reveal_state")
    .upsert(
      {
        season_id: seasonId,
        selected_survey_id: surveyId,
        reveal_count: 0,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "season_id" },
    );
}

/**
 * Reveal the next entry. Clamps to the selected survey's entry count so the
 * producer can't tick past the end. No-op if no survey is selected.
 */
export async function revealNext(): Promise<void> {
  const seasonId = await getActiveSeasonId();
  if (!seasonId) return;

  const supabase = await createClient();
  const { data: state } = await supabase
    .from("survey_reveal_state")
    .select("selected_survey_id, reveal_count")
    .eq("season_id", seasonId)
    .maybeSingle();
  const current = state as
    | { selected_survey_id: string | null; reveal_count: number }
    | null;
  if (!current?.selected_survey_id) return;

  const { count } = await supabase
    .from("survey_aggregate_rankings")
    .select("contestant_id", { count: "exact", head: true })
    .eq("survey_id", current.selected_survey_id);
  const entries = count ?? 0;

  const next = Math.min(current.reveal_count + 1, entries);
  if (next === current.reveal_count) return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("survey_reveal_state")
    .update({ reveal_count: next, updated_at: new Date().toISOString() })
    .eq("season_id", seasonId);
}

/**
 * Return the current survey to zero revealed entries. Leaves selected_survey
 * unchanged — Reset is for re-running a reveal, not for clearing the picker.
 */
export async function reset(): Promise<void> {
  const seasonId = await getActiveSeasonId();
  if (!seasonId) return;

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("survey_reveal_state")
    .update({ reveal_count: 0, updated_at: new Date().toISOString() })
    .eq("season_id", seasonId);
}
