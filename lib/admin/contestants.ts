"use server";

// Admin contestant management server actions (issue #43).
//
// `contestants` already has admin-write RLS (see migration 0001), so writes
// flow through the user-scoped server client and the policy gates them. No
// service-role escalation needed.
//
// One business rule is enforced here rather than at the DB layer (per the
// design doc: "only one HoH at a time — enforce in UI, not DB"): toggling
// is_hoh ON for a contestant clears it from every other contestant in the
// same season. is_nominated and has_veto are plain per-row toggles.
//
// revalidatePath() pings the admin contestants route so the server re-renders
// after a mutation without the client needing to refetch manually.

import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

import type { ContestantStatus } from "@/lib/supabase/types";

export type { ContestantStatus };
export type ContestantFlag = "is_hoh" | "is_nominated" | "has_veto";

export type UpdateResult =
  | { ok: true }
  | { ok: false; error: string };

export async function updateContestant(
  id: string,
  fields: {
    name?: string;
    photo_url?: string | null;
    bio?: string | null;
    status?: ContestantStatus;
  },
): Promise<UpdateResult> {
  if (!(await assertAdmin())) return { ok: false, error: "not-authorized" };
  if (Object.keys(fields).length === 0) return { ok: true };

  const supabase = await createClient();
  const { error } = await supabase.from("contestants")
    .update(fields)
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/contestants");
  return { ok: true };
}

export async function setContestantFlag(
  id: string,
  flag: ContestantFlag,
  value: boolean,
): Promise<UpdateResult> {
  if (!(await assertAdmin())) return { ok: false, error: "not-authorized" };
  const supabase = await createClient();

  // HoH is the only flag with a single-occupant rule. When turning it ON,
  // clear it from every other contestant in the same season first.
  if (flag === "is_hoh" && value) {
    const { data: seasonRow } = await supabase.from("contestants")
      .select("season_id")
      .eq("id", id)
      .maybeSingle();
    const seasonId = seasonRow?.season_id;
    if (seasonId) {
      const { error: clearError } = await supabase.from("contestants")
        .update({ is_hoh: false })
        .eq("season_id", seasonId)
        .neq("id", id);
      if (clearError) return { ok: false, error: clearError.message };
    }
  }

  const fields: Partial<Record<ContestantFlag, boolean>> = { [flag]: value };
  const { error } = await supabase.from("contestants")
    .update(fields)
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/contestants");
  return { ok: true };
}
