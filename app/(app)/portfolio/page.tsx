import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PortfolioClient, type PortfolioData } from "./PortfolioClient";

export default async function PortfolioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Portfolio is scoped to the current tradeable (active) season.
  const { data: season } = await supabase
    .from("seasons")
    .select("id, name, status, starting_balance, base_price, k_constant")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!season) {
    return (
      <div className="mx-auto flex min-h-full max-w-3xl flex-col px-4 py-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Portfolio
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-neutral-50">Your portfolio</h1>
        </header>
        <section className="mt-8 rounded-lg border border-neutral-800 bg-neutral-950 p-5">
          <h2 className="text-base font-semibold text-neutral-100">No active season</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-400">
            Your holdings and trade history will appear here once trading opens.
          </p>
        </section>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = season as any;

  const { data: contestants } = await supabase
    .from("contestants")
    .select("id, name, photo_url, status, total_shares_outstanding")
    .eq("season_id", s.id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contestantRows = (contestants ?? []) as any[];
  const contestantIds = contestantRows.map((c) => c.id as string);

  const [portfolioResult, holdingsResult, tradesResult] = await Promise.all([
    supabase
      .from("portfolios")
      .select("cash_balance")
      .eq("user_id", user.id)
      .eq("season_id", s.id)
      .maybeSingle(),
    contestantIds.length
      ? supabase
          .from("holdings")
          .select("contestant_id, shares_held, average_purchase_price")
          .eq("user_id", user.id)
          .in("contestant_id", contestantIds)
      : Promise.resolve({ data: [] }),
    supabase
      .from("trades")
      .select("id, contestant_id, type, dollar_amount, shares, price_at_execution, fee_amount, created_at")
      .eq("user_id", user.id)
      .eq("season_id", s.id)
      .eq("state", "filled")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const portfolio = portfolioResult.data as any;
  const startingBalance = parseFloat(s.starting_balance);

  const data: PortfolioData = {
    season: {
      id: s.id,
      base_price: s.base_price,
      k_constant: s.k_constant,
    },
    startingBalance,
    // A brand-new player has no portfolio row yet (created on first trade) —
    // fall back to the season's starting balance so they still see their cash.
    cashBalance: portfolio ? parseFloat(portfolio.cash_balance) : startingBalance,
    contestants: contestantRows.map((c) => ({
      id: c.id,
      name: c.name,
      photo_url: c.photo_url,
      status: c.status,
      total_shares_outstanding: c.total_shares_outstanding,
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    holdings: ((holdingsResult.data ?? []) as any[]).map((h) => ({
      contestant_id: h.contestant_id,
      shares_held: h.shares_held,
      average_purchase_price: h.average_purchase_price,
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialTrades: ((tradesResult.data ?? []) as any[]).map((t) => ({
      id: t.id,
      contestant_id: t.contestant_id,
      type: t.type,
      dollar_amount: t.dollar_amount,
      shares: t.shares,
      price_at_execution: t.price_at_execution,
      fee_amount: t.fee_amount,
      created_at: t.created_at,
    })),
  };

  return <PortfolioClient data={data} userId={user.id} />;
}
