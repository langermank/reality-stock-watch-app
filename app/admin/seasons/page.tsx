// Admin seasons list (issue #42). No "create new season" button — new seasons
// are bootstrapped via Claude from a CBS URL or similar source (see
// docs/admin-recipes.md). This page is for managing in-flight + historical
// seasons.

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { SeasonStatus } from "@/lib/admin/season-types";

export const dynamic = "force-dynamic";

type SeasonRow = {
  id: string;
  name: string;
  status: SeasonStatus;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
};

const STATUS_LABELS: Record<SeasonStatus, string> = {
  setup: "Setup",
  pre_season: "Pre-season",
  active: "Active",
  ended: "Ended",
  results_published: "Results published",
};

const STATUS_CLASSES: Record<SeasonStatus, string> = {
  setup: "bg-neutral-500/15 text-neutral-300 border-neutral-500/30",
  pre_season: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  active: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  ended: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  results_published: "bg-sky-500/15 text-sky-300 border-sky-500/30",
};

export default async function AdminSeasonsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("seasons")
    .select("id, name, status, start_date, end_date, created_at")
    .order("created_at", { ascending: false });
  const seasons = (data as SeasonRow[] | null) ?? [];

  return (
    <div className="mx-auto max-w-3xl p-6">
      <header className="mb-6">
        <Link
          href="/admin"
          className="text-xs font-semibold uppercase tracking-widest text-neutral-500 hover:text-neutral-300"
        >
          ← Admin
        </Link>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-neutral-100">
          Seasons
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          {seasons.length} {seasons.length === 1 ? "season" : "seasons"}. New
          seasons are bootstrapped from source URLs via Claude — see{" "}
          <code className="rounded bg-white/[0.04] px-1.5 py-0.5 text-xs">
            docs/admin-recipes.md
          </code>
          .
        </p>
      </header>

      {seasons.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm text-neutral-400">
          No seasons yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {seasons.map((season) => (
            <li
              key={season.id}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
            >
              <Link
                href={`/admin/seasons/${season.id}`}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-4 p-4"
              >
                <div>
                  <p className="text-base font-semibold text-neutral-100">
                    {season.name}
                  </p>
                  {(season.start_date || season.end_date) && (
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {season.start_date ?? "?"} — {season.end_date ?? "?"}
                    </p>
                  )}
                </div>
                <span className="hidden text-xs text-neutral-500 sm:block">
                  created {new Date(season.created_at).toLocaleDateString()}
                </span>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLASSES[season.status]}`}
                >
                  {STATUS_LABELS[season.status]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
