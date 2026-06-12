import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  LeaderboardClient,
  type LeaderboardEntry,
  type LeaderboardRow,
  type SeasonOption,
} from "./LeaderboardClient";

const PAGE_SIZE = 25;

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Current (tradeable) season, if any.
  const { data: activeSeason } = await supabase
    .from("seasons")
    .select("id, name")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Completed seasons for the All-Time filter.
  const { data: completed } = await supabase
    .from("seasons")
    .select("id, name")
    .in("status", ["ended", "results_published"])
    .order("created_at", { ascending: false });

  const completedSeasons: SeasonOption[] = completed ?? [];

  let initialEntries: LeaderboardEntry[] = [];
  if (activeSeason) {
    const { data } = await supabase.rpc("get_leaderboard", {
      p_season_id: activeSeason.id,
      p_limit: PAGE_SIZE,
      p_offset: 0,
    });
    initialEntries = normalizeEntries(data);
  }

  return (
    <LeaderboardClient
      activeSeason={activeSeason ?? null}
      completedSeasons={completedSeasons}
      initialEntries={initialEntries}
      pageSize={PAGE_SIZE}
    />
  );
}

function normalizeEntries(rows: LeaderboardRow[] | null): LeaderboardEntry[] {
  return (rows ?? []).map((r) => ({
    rank: Number(r.rank),
    userId: r.user_id,
    username: r.username,
    avatarUrl: r.avatar_url ?? null,
    netWorth: Number(r.net_worth),
    isSelf: Boolean(r.is_self),
    // badges is jsonb in the RPC — the shape is guaranteed by leaderboard_badges().
    badges: Array.isArray(r.badges) ? (r.badges as LeaderboardEntry["badges"]) : [],
  }));
}
