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

  // Cast mirrors the profiles read in app/(app)/layout.tsx — generated
  // types don't narrow the dynamic .from("profiles") chain cleanly.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = (await (supabase as any)
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single()) as { data: { is_admin: boolean } | null };

  if (!profile?.is_admin) redirect("/");

  return { supabase, user };
}
