import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { buildAnonSurveyCookieValue, readAnonSurveyCookieValue } from "./anon-cookie";

// The helper signs with SUPABASE_SERVICE_ROLE_KEY. Stamp a deterministic value
// for the test so we don't depend on whatever the test runner inherits.
const ORIGINAL = process.env.SUPABASE_SERVICE_ROLE_KEY;

beforeAll(() => {
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-secret-test-secret-test-secret";
});
afterAll(() => {
  if (ORIGINAL === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  else process.env.SUPABASE_SERVICE_ROLE_KEY = ORIGINAL;
});

const RESPONSE_ID = "11111111-2222-3333-4444-555555555555";

describe("anon-survey cookie", () => {
  it("round-trips a valid cookie", () => {
    const value = buildAnonSurveyCookieValue(RESPONSE_ID);
    expect(readAnonSurveyCookieValue(value)).toBe(RESPONSE_ID);
  });

  it("rejects undefined / null / empty", () => {
    expect(readAnonSurveyCookieValue(undefined)).toBeNull();
    expect(readAnonSurveyCookieValue(null)).toBeNull();
    expect(readAnonSurveyCookieValue("")).toBeNull();
  });

  it("rejects malformed values (no signature separator)", () => {
    expect(readAnonSurveyCookieValue("no-dot-anywhere")).toBeNull();
    expect(readAnonSurveyCookieValue(`${RESPONSE_ID}.`)).toBeNull();
    expect(readAnonSurveyCookieValue(`.${RESPONSE_ID}`)).toBeNull();
  });

  it("rejects a tampered response id", () => {
    const value = buildAnonSurveyCookieValue(RESPONSE_ID);
    // Flip the payload but keep the original signature.
    const sigStart = value.indexOf(".");
    const tampered = `${RESPONSE_ID.replace("1", "9")}${value.slice(sigStart)}`;
    expect(readAnonSurveyCookieValue(tampered)).toBeNull();
  });

  it("rejects a wrong signature", () => {
    const value = buildAnonSurveyCookieValue(RESPONSE_ID);
    const sigStart = value.indexOf(".");
    const tampered = `${value.slice(0, sigStart)}.AAAA${value.slice(sigStart + 1)}`;
    expect(readAnonSurveyCookieValue(tampered)).toBeNull();
  });

  it("rejects a signature from a different secret", () => {
    const value = buildAnonSurveyCookieValue(RESPONSE_ID);
    process.env.SUPABASE_SERVICE_ROLE_KEY = "different-secret-different-secret";
    expect(readAnonSurveyCookieValue(value)).toBeNull();
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-secret-test-secret-test-secret";
  });
});
