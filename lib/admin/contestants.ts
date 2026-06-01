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
import { createClient } from "@/lib/supabase/server";

export type ContestantStatus = "active" | "evicted" | "winner" | "runner_up";
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
  if (Object.keys(fields).length === 0) return { ok: true };

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("contestants") as any)
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
  const supabase = await createClient();

  // HoH is the only flag with a single-occupant rule. When turning it ON,
  // clear it from every other contestant in the same season first.
  if (flag === "is_hoh" && value) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: seasonRow } = await (supabase.from("contestants") as any)
      .select("season_id")
      .eq("id", id)
      .maybeSingle();
    const seasonId = (seasonRow as { season_id: string } | null)?.season_id;
    if (seasonId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: clearError } = await (supabase.from("contestants") as any)
        .update({ is_hoh: false })
        .eq("season_id", seasonId)
        .neq("id", id);
      if (clearError) return { ok: false, error: clearError.message };
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("contestants") as any)
    .update({ [flag]: value })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/contestants");
  return { ok: true };
}
