import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type TradeType = "buy" | "sell";

/** Human-readable messages for the failure reasons the RPC can return. */
const ERROR_MESSAGES: Record<string, string> = {
  invalid_dollar_amount: "Enter an amount greater than $0.",
  no_active_season: "Trading isn't open right now.",
  contestant_not_found: "That contestant isn't available to trade.",
  insufficient_funds: "Not enough cash — adjust your amount.",
  no_holding: "You don't own any shares to sell.",
  compute_error: "Something went wrong pricing your trade. Try again.",
};

/** POST /api/trade — places an at-market buy or sell via the place_trade RPC. */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: { contestantId?: string; type?: TradeType; dollarAmount?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const { contestantId, type, dollarAmount } = body;

  if (!contestantId || (type !== "buy" && type !== "sell")) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const amount = Number(dollarAmount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { ok: false, error: ERROR_MESSAGES.invalid_dollar_amount },
      { status: 400 }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc("place_trade", {
    p_user_id: user.id,
    p_contestant_id: contestantId,
    p_type: type,
    p_dollar_amount: amount,
  });

  if (error) {
    return NextResponse.json(
      { ok: false, error: "Something went wrong — your trade was not placed." },
      { status: 500 }
    );
  }

  // The RPC returns jsonb: { ok, ... } on success or { ok: false, error } on a handled failure.
  if (!data?.ok) {
    const reason = data?.error as string | undefined;
    return NextResponse.json(
      {
        ok: false,
        reason,
        error: (reason && ERROR_MESSAGES[reason]) || "Your trade could not be placed.",
      },
      { status: 200 }
    );
  }

  return NextResponse.json({
    ok: true,
    tradeId: data.trade_id,
    shares: Number(data.shares),
    priceAtExecution: Number(data.price_at_execution),
    feeAmount: Number(data.fee_amount),
  });
}
