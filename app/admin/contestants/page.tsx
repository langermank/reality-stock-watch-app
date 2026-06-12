// Admin contestants page (issue #43).
//
// Lists every contestant for the active season with an inline edit affordance.
// Admin-gated by app/admin/layout.tsx (requireAdmin). Server-rendered + force-
// dynamic since contestant state changes per-request (status flips, flag
// toggles).

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  ContestantTable,
  type AdminContestant,
} from "@/components/admin/ContestantTable";

export const dynamic = "force-dynamic";

export default async function AdminContestantsPage() {
  const supabase = await createClient();

  // Active season — there's only one at a time (enforced by partial unique index).
  const { data: seasonRow } = await supabase
    .from("seasons")
    .select("id, name")
    .eq("status", "active")
    .maybeSingle();
  const season = seasonRow;

  if (!season) {
    return (
      <Shell title="Contestants">
        <p className="text-sm text-neutral-400">
          No active season. Create one to manage contestants.
        </p>
      </Shell>
    );
  }

  const { data } = await supabase
    .from("contestants")
    .select(
      "id, name, photo_url, bio, status, is_hoh, is_nominated, has_veto, total_shares_outstanding",
    )
    .eq("season_id", season.id)
    .order("name");
  const rows = data ?? [];

  const contestants: AdminContestant[] = rows.map((row) => ({
    id: row.id,
    name: row.name,
    photoUrl: row.photo_url,
    bio: row.bio,
    status: row.status,
    isHoh: row.is_hoh,
    isNominated: row.is_nominated,
    hasVeto: row.has_veto,
    totalSharesOutstanding: row.total_shares_outstanding,
  }));

  return (
    <Shell title="Contestants" subtitle={season.name}>
      {contestants.length === 0 ? (
        <p className="text-sm text-neutral-400">
          No contestants yet for this season.
        </p>
      ) : (
        <ContestantTable contestants={contestants} />
      )}
    </Shell>
  );
}

function Shell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/admin"
            className="text-xs font-semibold uppercase tracking-widest text-neutral-500 hover:text-neutral-300"
          >
            ← Admin
          </Link>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-neutral-100">
            {title}
          </h1>
          {subtitle && <p className="mt-1 text-sm text-neutral-400">{subtitle}</p>}
        </div>
      </header>
      {children}
    </div>
  );
}
