import { requireAdmin } from "@/lib/admin";

/**
 * Admin shell. Enforces the is_admin gate for every /admin/* route.
 *
 * Intentionally chrome-less: the livestream broadcast view is captured by
 * OBS from the producer's authenticated window, so this layout adds no nav
 * or header that would bleed into the capture. Individual admin pages render
 * their own headers; the broadcast view stays bare.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return <div className="min-h-dvh">{children}</div>;
}
