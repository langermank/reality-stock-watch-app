"use server";

// Survey submission (issue #41).
//
// Two paths:
//   - submitResponse: logged-in user. Goes through the user-scoped server
//     client; RLS enforces auth.uid() = user_id and the per-user unique index
//     prevents double-submit.
//   - submitAnonymousResponse: public-link user. Uses the service-role client
//     (server-only) because there is no RLS INSERT policy for the anon role,
//     and we validate the survey is `active` ourselves. user_id stays null
//     and is_anonymous = true.
//
// Both write the `answers` jsonb as { [questionId]: answer } where answer is
// a string (single_choice), string[] (multiple_choice), or string[] (ranking,
// best-first). Names are stored — matching the seed and the design doc.

import { createClient } from "@/lib/supabase/server";
import { serviceClient } from "@/lib/supabase/service";

export type AnswerValue = string | string[];

export type SubmitResult =
  | { ok: true }
  | { ok: false; error: "no-survey" | "not-active" | "already-submitted" | "unknown" };

export async function submitResponse(
  surveyId: string,
  answers: Record<string, AnswerValue>,
): Promise<SubmitResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "unknown" };

  // Confirm survey is active before writing. RLS already gates this read, but
  // the explicit check turns a silent insert-then-no-op into a clean error.
  const { data: surveyRow } = await supabase
    .from("surveys")
    .select("status")
    .eq("id", surveyId)
    .maybeSingle();
  const survey = surveyRow as { status: string } | null;
  if (!survey) return { ok: false, error: "no-survey" };
  if (survey.status !== "active") return { ok: false, error: "not-active" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("survey_responses") as any).insert({
    survey_id: surveyId,
    user_id: user.id,
    answers,
    is_anonymous: false,
  });
  if (error) {
    // 23505 = unique_violation (per-user unique index).
    if ("code" in error && (error as { code: string }).code === "23505") {
      return { ok: false, error: "already-submitted" };
    }
    return { ok: false, error: "unknown" };
  }
  return { ok: true };
}

export async function submitAnonymousResponse(
  surveyId: string,
  answers: Record<string, AnswerValue>,
): Promise<SubmitResult> {
  // Validate the survey is active. Use the service client so this works even
  // before any auth check, but we still gate the WRITE on status === 'active'
  // here in code (anon users can't see closed/draft surveys).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: row } = await (serviceClient as any)
    .from("surveys")
    .select("status")
    .eq("id", surveyId)
    .maybeSingle();
  const survey = row as { status: string } | null;
  if (!survey) return { ok: false, error: "no-survey" };
  if (survey.status !== "active") return { ok: false, error: "not-active" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (serviceClient.from("survey_responses") as any).insert({
    survey_id: surveyId,
    user_id: null,
    answers,
    is_anonymous: true,
  });
  if (error) return { ok: false, error: "unknown" };
  return { ok: true };
}
