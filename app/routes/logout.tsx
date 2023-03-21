import type { LoaderArgs } from "@remix-run/node";
import { getWebAuth } from "../services/web-authenticator";

export const loader = async ({ request }: LoaderArgs) => {
  const webAuth = await getWebAuth();

  return webAuth.logout(request, {
    redirectTo: "/login",
  });
};

export function Logout() {
  return <span>you're now logged out</span>;
}
