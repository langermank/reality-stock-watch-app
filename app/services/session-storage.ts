import crypto from "crypto";
import type { SessionStorage } from "@remix-run/node";
import { createCookieSessionStorage } from "@remix-run/node";

export type SessionData = {
  username: string;
  token: string;
};

let sessionStorage: SessionStorage<SessionData, SessionData> | null = null;
export const getSessionStorage = async (sessionMasterSecret: string | undefined) => {
  if (!sessionStorage) {
    let sessionSecret = sessionMasterSecret;
    if (!sessionSecret) {
      console.warn("No session secret was configured. Generating a random secret");
      console.warn("If in prod, this can invalidate users current sessions");
      sessionSecret = crypto.randomBytes(32).toString("base64");
    }

    sessionStorage = createCookieSessionStorage({
      cookie: {
        name: "__authtoken",
        sameSite: "lax",
        path: "/",
        secrets: [sessionSecret],
        secure: true,
      },
    });
  }

  const { getSession, commitSession, destroySession } = sessionStorage;
  return { getSession, commitSession, destroySession };
};
