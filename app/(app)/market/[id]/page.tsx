import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ContestantDetailClient from "./ContestantDetailClient";
import type { MarketContestant, MarketSeason } from "../MarketClient";

export default async function ContestantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: rawContestant } = await supabase
    .from("contestants")
    .select(
      "id, season_id, name, photo_url, bio, status, is_hoh, is_nominated, has_veto, total_shares_outstanding"
    )
    .eq("id", id)
    .maybeSingle();

  if (!rawContestant) notFound();
  const contestant = rawContestant as MarketContestant;

  const { data: rawSeason } = await supabase
    .from("seasons")
    .select("id, name, status, start_date, starting_balance, k_constant, base_price")
    .eq("id", contestant.season_id)
    .in("status", ["active", "pre_season"])
    .maybeSingle();

  if (!rawSeason) notFound();
  const season = rawSeason as MarketSeason;

  const [holdingResult, tradesResult, allContestantsResult] = await Promise.all([
    supabase
      .from("holdings")
      .select("shares_held, average_purchase_price")
      .eq("contestant_id", id)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("trades")
      .select("price_at_execution, created_at")
      .eq("contestant_id", id)
      .eq("state", "filled")
      .order("created_at", { ascending: true })
      .limit(200),
    supabase
      .from("contestants")
      .select("id, total_shares_outstanding")
      .eq("season_id", season.id),
  ]);

  return (
    <ContestantDetailClient
      contestant={contestant}
      season={season}
      holding={holdingResult.data}
      trades={tradesResult.data ?? []}
      allContestants={allContestantsResult.data ?? []}
    />
  );
}
