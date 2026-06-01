// Signed-cookie helper for the anon→signup carry-over (issue #80).
//
// When a fan submits the public survey anonymously and then signs up, we want
// to retroactively tie the existing `survey_responses` row to the new user
// instead of leaving them detached. The bridge is a short-lived signed cookie:
//   - anon submit  → set cookie carrying the response id (1h httpOnly sameSite=lax)
//   - auth callback → read + verify cookie, update the row, clear the cookie
//
// HMAC-SHA256 with `SUPABASE_SERVICE_ROLE_KEY` as the signing secret. That key
// is already a required server-only env var, so this introduces no new secret
// to manage. Cookie format: `<responseId>.<base64url-hmac>` — readable in dev
// tools, tamper-evident, and trivial to verify with constant-time comparison.

import { createHmac, timingSafeEqual } from "node:crypto";

export const ANON_SURVEY_COOKIE = "rsw_anon_survey";

/** 1 hour — long enough for a leisurely OAuth signup, short enough that an
 *  abandoned anon submission doesn't loiter forever. */
export const ANON_SURVEY_COOKIE_MAX_AGE_SECONDS = 60 * 60;

function signingKey(): Buffer {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required to sign anon-survey cookies");
  }
  return Buffer.from(key, "utf8");
}

function sign(payload: string): string {
  return createHmac("sha256", signingKey())
    .update(payload)
    .digest("base64url");
}

export function buildAnonSurveyCookieValue(responseId: string): string {
  return `${responseId}.${sign(responseId)}`;
}

/**
 * Verify the cookie and return the embedded response id if valid, else null.
 * Returns null for any tampering / malformed input — never throws — so callers
 * can treat "no valid cookie" and "no cookie" uniformly.
 */
export function readAnonSurveyCookieValue(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const dot = raw.indexOf(".");
  if (dot < 0) return null;
  const responseId = raw.slice(0, dot);
  const provided = raw.slice(dot + 1);
  if (!responseId || !provided) return null;

  const expected = sign(responseId);
  // Constant-time compare. timingSafeEqual requires equal lengths.
  let expectedBuf: Buffer;
  let providedBuf: Buffer;
  try {
    expectedBuf = Buffer.from(expected, "base64url");
    providedBuf = Buffer.from(provided, "base64url");
  } catch {
    return null;
  }
  if (expectedBuf.length !== providedBuf.length) return null;
  return timingSafeEqual(expectedBuf, providedBuf) ? responseId : null;
}
