"use server";

// Anon → signup carry-over (#80) — server action.
//
// Called from any path that lands an authenticated user with a still-valid
// anon-survey cookie:
//   - /auth/callback  (OAuth + email-confirmation signups — earliest hit)
//   - LoginForm       (email+password sign-ins that skip /auth/callback)
//
// "use server" because we need to mutate cookies (delete the consumed one).
// Server components can't do that — only server actions and route handlers.
// Idempotent: cookie is single-use, so concurrent calls converge — the second
// one finds no cookie and bails.

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { serviceClient } from "@/lib/supabase/service";
import { ANON_SURVEY_COOKIE, readAnonSurveyCookieValue } from "./anon-cookie";

/** Try to attach the anonymous survey response identified by the cookie to
 *  the currently authenticated user. Silently does nothing if there's no
 *  user, no valid cookie, the row no longer qualifies, or the user already
 *  has a response for that survey. */
export async function claimAnonymousSurveyResponse(): Promise<void> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(ANON_SURVEY_COOKIE)?.value;
  const responseId = readAnonSurveyCookieValue(raw);
  if (!responseId) {
    if (raw) cookieStore.delete(ANON_SURVEY_COOKIE);
    return;
  }
  // Always drop the cookie — single-use, succeed or not.
  cookieStore.delete(ANON_SURVEY_COOKIE);

  // Authenticate via the user-scoped server client (reads the session cookie).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // Read the row via service client — the row is still anonymous so the
  // user-scoped read policy doesn't apply yet (owners only).
  const { data: row } = await serviceClient.from("survey_responses")
    .select("id, survey_id, user_id, is_anonymous")
    .eq("id", responseId)
    .maybeSingle();
  if (!row || !row.is_anonymous || row.user_id) return;

  // Skip if the user already has a response for this survey — the per-user
  // unique index would block the update anyway. Their original submission
  // wins; the anonymous one stays anonymous.
  const { count } = await serviceClient.from("survey_responses")
    .select("id", { count: "exact", head: true })
    .eq("survey_id", row.survey_id)
    .eq("user_id", user.id);
  if ((count ?? 0) > 0) return;

  await serviceClient.from("survey_responses")
    .update({ user_id: user.id, is_anonymous: false })
    .eq("id", row.id);
}
