import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Refreshes auth session and enforces route protection. */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Protected: authenticated routes. Prefix-matched so nested routes like
  // /market/[id] are covered — but /survey/[id]/public stays open (the
  // anonymous share link). Route groups like (app) never appear in URLs.
  const isPublicSurveyRoute =
    pathname.startsWith("/survey/") && pathname.endsWith("/public");
  const isAppRoute =
    !isPublicSurveyRoute &&
    ["/market", "/portfolio", "/survey", "/leaderboard"].some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );

  // Protected: admin only
  const isAdminRoute = pathname.startsWith("/admin");

  if (!user && isAppRoute) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      return NextResponse.redirect(loginUrl);
    }
    // Admin check handled in the admin layout (requires DB read)
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
