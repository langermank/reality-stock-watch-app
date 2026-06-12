// Admin season detail (issue #42). Server shell loads the season + hands
// off to the SeasonDetail client component, which renders the editable form
// + status-transition console.

import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SeasonDetail, type AdminSeason } from "@/components/admin/SeasonDetail";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminSeasonDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: row } = await supabase
    .from("seasons")
    .select(
      "id, name, status, start_date, end_date, starting_balance, k_constant, base_price",
    )
    .eq("id", id)
    .maybeSingle();
  if (!row) notFound();

  const season: AdminSeason = {
    id: row.id,
    name: row.name,
    status: row.status,
    startDate: row.start_date,
    endDate: row.end_date,
    startingBalance: row.starting_balance,
    kConstant: row.k_constant,
    basePrice: row.base_price,
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <header className="mb-6">
        <Link
          href="/admin/seasons"
          className="text-xs font-semibold uppercase tracking-widest text-neutral-500 hover:text-neutral-300"
        >
          ← Seasons
        </Link>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-neutral-100">
          {season.name}
        </h1>
      </header>
      <SeasonDetail season={season} />
    </div>
  );
}
