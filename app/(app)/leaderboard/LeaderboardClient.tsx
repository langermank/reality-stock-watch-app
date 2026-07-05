"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

export type Badge = { type: "top_3" | "top_10"; season: string };

/** Row shape returned by the get_leaderboard / get_user_rank RPCs. */
export type LeaderboardRow =
  Database["public"]["Functions"]["get_leaderboard"]["Returns"][number];

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  username: string;
  avatarUrl: string | null;
  netWorth: number;
  isSelf: boolean;
  badges: Badge[];
};

export type SeasonOption = { id: string; name: string };

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function initialsFor(name: string): string {
  return name
    .split(/[\s_]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function normalize(rows: LeaderboardRow[] | null): LeaderboardEntry[] {
  return (rows ?? []).map((r) => ({
    rank: Number(r.rank),
    userId: r.user_id,
    username: r.username,
    avatarUrl: r.avatar_url ?? null,
    netWorth: Number(r.net_worth),
    isSelf: Boolean(r.is_self),
    // badges is jsonb in the RPC — the shape is guaranteed by leaderboard_badges().
    badges: Array.isArray(r.badges) ? (r.badges as Badge[]) : [],
  }));
}

function badgeLabel(b: Badge): string {
  const kind = b.type === "top_3" ? "Top 3" : "Top 10";
  return `${kind} · ${b.season}`;
}

export function LeaderboardClient({
  activeSeason,
  completedSeasons,
  initialEntries,
  pageSize,
}: {
  activeSeason: SeasonOption | null;
  completedSeasons: SeasonOption[];
  initialEntries: LeaderboardEntry[];
  pageSize: number;
}) {
  const [tab, setTab] = useState<"current" | "alltime">(
    activeSeason ? "current" : "alltime"
  );

  return (
    <div className="mx-auto flex min-h-full max-w-3xl flex-col px-4 py-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
          Leaderboard
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-neutral-50">Standings</h1>
      </header>

      {/* Tabs — Current Season hidden once no season is active */}
      <div className="mt-5 flex gap-6 border-b border-neutral-800">
        {activeSeason && (
          <TabButton active={tab === "current"} onClick={() => setTab("current")}>
            Current Season
          </TabButton>
        )}
        <TabButton active={tab === "alltime"} onClick={() => setTab("alltime")}>
          All-Time
        </TabButton>
      </div>

      {tab === "current" && activeSeason ? (
        <CurrentSeasonTab
          season={activeSeason}
          initialEntries={initialEntries}
          pageSize={pageSize}
        />
      ) : (
        <AllTimeTab completedSeasons={completedSeasons} />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "-mb-px border-b-2 pb-3 text-sm font-semibold transition-colors",
        active
          ? "border-neutral-100 text-neutral-100"
          : "border-transparent text-neutral-500 hover:text-neutral-300",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function CurrentSeasonTab({
  season,
  initialEntries,
  pageSize,
}: {
  season: SeasonOption;
  initialEntries: LeaderboardEntry[];
  pageSize: number;
}) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(initialEntries);
  const [search, setSearch] = useState("");
  const [hasMore, setHasMore] = useState(initialEntries.length === pageSize);
  const [loading, setLoading] = useState(false);
  const [pinned, setPinned] = useState<LeaderboardEntry | null>(null);
  const selfRowRef = useRef<HTMLLIElement | null>(null);

  // Debounced search → reload from offset 0 with the query.
  useEffect(() => {
    const handle = setTimeout(async () => {
      const supabase = createClient();
      const { data } = await supabase.rpc("get_leaderboard", {
        p_season_id: season.id,
        p_limit: pageSize,
        p_offset: 0,
        p_search: search.trim() || undefined,
      });
      const rows = normalize(data);
      setEntries(rows);
      setHasMore(rows.length === pageSize);
    }, 250);
    return () => clearTimeout(handle);
     
  }, [search, season.id, pageSize]);

  async function loadMore() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase.rpc("get_leaderboard", {
        p_season_id: season.id,
        p_limit: pageSize,
        p_offset: entries.length,
        p_search: search.trim() || undefined,
      });
      const rows = normalize(data);
      setEntries((prev) => [...prev, ...rows]);
      setHasMore(rows.length === pageSize);
    } finally {
      setLoading(false);
    }
  }

  async function findMe() {
    // If the user's row is already on screen, just scroll + highlight it.
    const onScreen = entries.find((e) => e.isSelf);
    if (onScreen) {
      setPinned(null);
      selfRowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const supabase = createClient();
    const { data } = await supabase.rpc("get_user_rank", {
      p_season_id: season.id,
    });
    const rows = normalize(data);
    setPinned(rows[0] ?? null);
  }

  return (
    <div>
      {/* Search + Find me */}
      <div className="mt-5 flex gap-2">
        <div className="relative flex-1">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by username"
            aria-label="Search by username"
            className="w-full rounded-lg border border-neutral-800 bg-neutral-900 py-2.5 pl-9 pr-3 text-sm text-neutral-100 placeholder-neutral-600 focus:border-neutral-600 focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={findMe}
          className="shrink-0 rounded-lg border border-neutral-700 px-4 text-sm font-semibold text-neutral-200 transition-colors hover:bg-neutral-900"
        >
          Find me
        </button>
      </div>

      {/* Pinned own row (when not already on screen) */}
      {pinned && (
        <div className="mt-4">
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-neutral-500">
            Your rank
          </p>
          <Row entry={pinned} highlight />
        </div>
      )}

      {entries.length === 0 ? (
        <div className="mt-6 rounded-lg border border-neutral-800 bg-neutral-950 p-6 text-center">
          <p className="text-sm font-medium text-neutral-200">
            {search.trim() ? `No players found for “${search.trim()}”` : "No players yet"}
          </p>
          <p className="mt-1.5 text-sm text-neutral-500">
            {search.trim()
              ? "Try a different username."
              : "Be the first to trade and climb the board."}
          </p>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-neutral-800" role="list">
          {entries.map((e) => (
            <li key={e.userId} ref={e.isSelf ? selfRowRef : undefined}>
              <Row entry={e} highlight={e.isSelf} />
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="rounded-lg border border-neutral-700 px-5 py-2.5 text-sm font-semibold text-neutral-200 transition-colors hover:bg-neutral-900 disabled:opacity-50"
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}

function Row({ entry, highlight }: { entry: LeaderboardEntry; highlight?: boolean }) {
  return (
    <div
      className={[
        "grid grid-cols-[2rem_auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-2 py-3",
        highlight ? "bg-emerald-600/10 ring-1 ring-inset ring-emerald-600/40" : "",
      ].join(" ")}
    >
      <span className="text-center text-sm font-semibold tabular-nums text-neutral-400">
        {entry.rank}
      </span>
      <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-neutral-900 text-xs font-semibold text-neutral-300 ring-1 ring-neutral-800">
        {entry.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={entry.avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          initialsFor(entry.username)
        )}
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium text-neutral-100">
            {entry.username}
          </span>
          {entry.isSelf && (
            <span className="rounded bg-emerald-600/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-emerald-400">
              You
            </span>
          )}
        </span>
        {entry.badges.length > 0 && (
          <span className="mt-1 flex flex-wrap gap-1">
            {entry.badges.map((b, i) => (
              <span
                key={i}
                className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-400"
              >
                {badgeLabel(b)}
              </span>
            ))}
          </span>
        )}
      </span>
      <span className="text-right text-sm font-semibold tabular-nums text-neutral-50">
        {currency.format(entry.netWorth)}
      </span>
    </div>
  );
}

function AllTimeTab({ completedSeasons }: { completedSeasons: SeasonOption[] }) {
  const [seasonId, setSeasonId] = useState<string>(completedSeasons[0]?.id ?? "");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  // Starts true when a season will load on mount; the select's onChange flips
  // it back on for season switches — the effect itself only fetches.
  const [loading, setLoading] = useState(completedSeasons.length > 0);

  useEffect(() => {
    // seasonId is always non-empty when completedSeasons exist (the select has
    // no empty option); when there are no seasons the list never renders, so
    // entries can keep their initial [] without an explicit reset here.
    if (!seasonId) return;
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("season_results")
        .select("user_id, final_rank, final_net_worth, profiles(username, avatar_url)")
        .eq("season_id", seasonId)
        .order("final_rank", { ascending: true });

      if (cancelled) return;
      const rows = (data ?? []).map((r) => ({
        rank: Number(r.final_rank),
        userId: r.user_id,
        username: r.profiles?.username ?? "Unknown",
        avatarUrl: r.profiles?.avatar_url ?? null,
        netWorth: Number(r.final_net_worth),
        isSelf: false,
        badges: [] as Badge[],
      }));
      setEntries(rows);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [seasonId]);

  if (completedSeasons.length === 0) {
    return (
      <div className="mt-6 rounded-lg border border-neutral-800 bg-neutral-950 p-6 text-center">
        <p className="text-sm font-medium text-neutral-200">No completed seasons yet</p>
        <p className="mt-1.5 text-sm text-neutral-500">
          The all-time leaderboard unlocks when a season ends.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mt-5">
        <label htmlFor="alltime-season" className="sr-only">
          Season
        </label>
        <select
          id="alltime-season"
          value={seasonId}
          onChange={(e) => {
            setSeasonId(e.target.value);
            setLoading(true);
          }}
          className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:border-neutral-600 focus:outline-none"
        >
          {completedSeasons.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="mt-6 text-center text-sm text-neutral-500">Loading…</p>
      ) : entries.length === 0 ? (
        <div className="mt-6 rounded-lg border border-neutral-800 bg-neutral-950 p-6 text-center">
          <p className="text-sm font-medium text-neutral-200">No results for this season</p>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-neutral-800" role="list">
          {entries.map((e) => (
            <li key={e.userId}>
              <Row entry={e} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
