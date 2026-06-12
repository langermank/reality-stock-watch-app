import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Server-side admin gate — the single source of truth for admin access.
 *
 * Redirects unauthenticated users to /login and authenticated non-admins
 * to / (home). On success returns the Supabase client and user so callers
 * can reuse them without a second round-trip.
 *
 * `is_admin` is not user-editable (enforced in profiles RLS), so the flag
 * is trustworthy. Middleware already blocks anonymous access to /admin/*;
 * this adds the is_admin requirement, which needs a DB read and so lives
 * here rather than in middleware.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/");

  return { supabase, user };
}

/**
 * Non-redirecting admin check for server actions. Server actions are directly
 * invocable POST endpoints — the layout's requireAdmin() does NOT gate them —
 * so every admin action must verify the caller itself rather than relying on
 * RLS alone (an RLS-filtered update affects 0 rows and reports no error, so
 * actions would otherwise return success after doing nothing).
 */
export async function assertAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  return Boolean(profile?.is_admin);
}
