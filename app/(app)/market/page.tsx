import { MarketClient, type MarketContestant, type MarketSeason } from "./MarketClient";
import { createClient } from "@/lib/supabase/server";

export default async function MarketPage() {
  const supabase = await createClient();
  const { data: season } = await supabase
    .from("seasons")
    .select("id, name, status, start_date, starting_balance, k_constant, base_price")
    .in("status", ["active", "pre_season"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const marketSeason = season as MarketSeason | null;

  if (!marketSeason) {
    return (
      <div className="mx-auto flex min-h-full max-w-3xl flex-col px-4 py-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Market
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-neutral-50">Contestants</h1>
        </header>
        <section className="mt-8 rounded-lg border border-neutral-800 bg-neutral-950 p-5">
          <h2 className="text-base font-semibold text-neutral-100">No active season</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-400">
            Contestants will appear here once a season is in pre-season or active trading.
          </p>
        </section>
      </div>
    );
  }

  const { data: contestants } = await supabase
    .from("contestants")
    .select(
      "id, season_id, name, photo_url, bio, status, is_hoh, is_nominated, has_veto, total_shares_outstanding"
    )
    .eq("season_id", marketSeason.id)
    .order("name", { ascending: true });

  return (
    <MarketClient
      season={marketSeason}
      contestants={(contestants ?? []) as MarketContestant[]}
    />
  );
}
