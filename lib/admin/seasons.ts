"use server";

// Admin season management actions (issue #42).
//
// New-season creation lives outside the app — Claude orchestrates it from
// the source URL (see docs/admin-recipes.md). What's here is the operational
// machinery: edit the in-flight season's metadata, drive its status forward,
// publish results.
//
// State machine (forward-only):
//
//   setup ──▶ pre_season ──▶ active ──▶ ended ──▶ results_published
//
// Pricing constants (starting_balance, k_constant, base_price) lock once the
// season crosses into `active`. The DB trigger added in 0007 is the backstop;
// the UI hides the fields, but anyone — Claude included — bypassing the UI
// gets a `check_violation` from Postgres.

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { nextSeasonStatus, type SeasonStatus } from "./season-types";

type ActionResult =
  | { ok: true }
  | { ok: false; error: string };

type SeasonRow = {
  id: string;
  status: SeasonStatus;
};

async function loadSeason(id: string): Promise<SeasonRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("seasons")
    .select("id, status")
    .eq("id", id)
    .maybeSingle();
  return data as SeasonRow | null;
}

// ─────────────────────────────────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────────────────────────────────

/**
 * Update editable season fields. The DB trigger blocks writes to the pricing
 * columns once status crosses into active, so this action accepts them
 * optimistically and surfaces the trigger's exception as the action error.
 */
export async function updateSeasonMeta(
  id: string,
  fields: {
    name?: string;
    start_date?: string | null;
    end_date?: string | null;
    starting_balance?: number;
    k_constant?: number;
    base_price?: number;
  },
): Promise<ActionResult> {
  if (Object.keys(fields).length === 0) return { ok: true };
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("seasons") as any).update(fields).eq("id", id);
  if (error) {
    // Surface the trigger's hint when present.
    return {
      ok: false,
      error: error.message.includes("Pricing constants")
        ? "Pricing constants are locked — they can only be edited during setup or pre-season."
        : error.message,
    };
  }
  revalidatePath("/admin/seasons");
  revalidatePath(`/admin/seasons/${id}`);
  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────────────
// Status transitions
// ─────────────────────────────────────────────────────────────────────────

/**
 * Move a season one step forward in its state machine. Refuses any non-
 * sequential transition. The terminal step (ended → results_published) goes
 * through `publishSeasonResults` instead, since it has side effects.
 */
export async function advanceSeasonStatus(id: string): Promise<ActionResult> {
  const season = await loadSeason(id);
  if (!season) return { ok: false, error: "not-found" };
  const next = nextSeasonStatus(season.status);
  if (!next) return { ok: false, error: "already-terminal" };
  if (next === "results_published") {
    return { ok: false, error: "use-publish-season-results" };
  }

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("seasons") as any)
    .update({ status: next })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/seasons");
  revalidatePath(`/admin/seasons/${id}`);
  return { ok: true };
}

/**
 * Wrap the multi-step terminal transition. The SQL function handles the
 * snapshot + badges + status flip in one transaction.
 */
export async function publishSeasonResults(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).rpc("publish_season_results", {
    p_season_id: id,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/seasons");
  revalidatePath(`/admin/seasons/${id}`);
  return { ok: true };
}
