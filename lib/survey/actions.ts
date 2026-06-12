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
//     and is_anonymous = true. On success, sets a signed cookie carrying the
//     new response id so a subsequent signup can retroactively claim it (#80).
//
// Both write the `answers` jsonb as { [questionId]: answer } where answer is
// a string (single_choice), string[] (multiple_choice), or string[] (ranking,
// best-first). Names are stored — matching the seed and the design doc.

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { serviceClient } from "@/lib/supabase/service";
import {
  ANON_SURVEY_COOKIE,
  ANON_SURVEY_COOKIE_MAX_AGE_SECONDS,
  buildAnonSurveyCookieValue,
  readAnonSurveyCookieValue,
} from "./anon-cookie";

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
  const survey = surveyRow;
  if (!survey) return { ok: false, error: "no-survey" };
  if (survey.status !== "active") return { ok: false, error: "not-active" };

  const { error } = await supabase.from("survey_responses").insert({
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
  const { data: row } = await serviceClient
    .from("surveys")
    .select("status")
    .eq("id", surveyId)
    .maybeSingle();
  const survey = row;
  if (!survey) return { ok: false, error: "no-survey" };
  if (survey.status !== "active") return { ok: false, error: "not-active" };

  // Double-submit guard: anonymous responses have no unique index (user_id is
  // null), so the signed cookie from a prior submit is the dedup signal. It
  // only stops casual resubmits (reload + send again) — clearing cookies
  // defeats it — but that matches the per-user index's intent for anon users.
  const cookieStore = await cookies();
  const priorResponseId = readAnonSurveyCookieValue(
    cookieStore.get(ANON_SURVEY_COOKIE)?.value,
  );
  if (priorResponseId) {
    const { data: prior } = await serviceClient.from("survey_responses")
      .select("survey_id")
      .eq("id", priorResponseId)
      .maybeSingle();
    if (prior?.survey_id === surveyId) {
      return { ok: false, error: "already-submitted" };
    }
  }

  const { data: inserted, error } = await serviceClient.from("survey_responses")
    .insert({
      survey_id: surveyId,
      user_id: null,
      answers,
      is_anonymous: true,
    })
    .select("id")
    .single();
  if (error || !inserted?.id) return { ok: false, error: "unknown" };

  // Drop a signed cookie so a subsequent signup can claim this response
  // (consumed in app/auth/callback/route.ts). Same-site=lax so the cookie
  // survives OAuth round-trips; httpOnly so client JS can't read it.
  cookieStore.set(ANON_SURVEY_COOKIE, buildAnonSurveyCookieValue(inserted.id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: ANON_SURVEY_COOKIE_MAX_AGE_SECONDS,
  });

  return { ok: true };
}
