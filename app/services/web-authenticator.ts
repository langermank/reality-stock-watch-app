import type { SessionData } from "./session-storage";
import type { Session } from "@remix-run/server-runtime";

import type { AuthenticateOptions } from "remix-auth";
import { Authenticator, AuthorizationError } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { getAppDomain } from "./app";
import { getSessionStorage } from "./session-storage";

export type LoginType = "password" | "authProvider";
export type AuthenticatorDataType = SessionData | Error | null;

class WebAuthenticator {
  auth: Authenticator<SessionData | Error | null>;

  constructor(sessionStorage: Awaited<ReturnType<typeof getSessionStorage>>) {
    this.auth = new Authenticator(sessionStorage);
  }

  _createAuthenticator(sessionStorage: Awaited<ReturnType<typeof getSessionStorage>>) {
    this.auth = new Authenticator(sessionStorage, {
      sessionKey: "authToken",
      sessionErrorKey: "authError",
    });
  }

  authenticate(
    strategy: string,
    request: Request,
    options?: Pick<
      AuthenticateOptions,
      "successRedirect" | "failureRedirect" | "throwOnError" | "context"
    >
  ): Promise<AuthenticatorDataType> {
    return this.auth.authenticate(strategy, request, options);
  }

  logout(
    request: Request | Session,
    options: {
      redirectTo: string;
    }
  ): Promise<never> {
    return this.auth.logout(request, options);
  }

  singup() {}
}

let webAuth: Authenticator<AuthenticatorDataType> | null = null;
export const getWebAuth = async () => {
  if (webAuth) return webAuth;

  const appDomain = await getAppDomain();
  const sessionStorage = await getSessionStorage(appDomain.getWebConfig()?.sessionMasterSecret);

  webAuth = new Authenticator<AuthenticatorDataType>(sessionStorage, {
    sessionKey: "authToken",
    sessionErrorKey: "authError",
  });

  webAuth.use(
    new FormStrategy(async ({ form }) => {
      let loginType = form.get("loginType");
      if (!loginType) loginType = "password";

      if (loginType === "password") {
        const username = form.get("username");
        if (!username) throw new AuthorizationError("username required");

        const password = form.get("password");
        if (!password) throw new AuthorizationError("password required");

        const token = await appDomain.authenticator.login(username.toString(), password.toString());

        if (!token) throw new AuthorizationError("credentials invalid");

        return {
          username: username.toString(),
          token: token,
        };
      }

      //todo: auth providers

      return {
        username: "",
        token: "",
      } as SessionData;
    })
  );

  return webAuth;
};
