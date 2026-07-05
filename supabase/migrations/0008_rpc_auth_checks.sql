-- ============================================================
-- Reality Stock Watch — RPC authorization hardening
--
-- Two holes, found in a security review:
--
--   1. place_trade(p_user_id, ...) never verified that p_user_id matches
--      auth.uid(). It is SECURITY DEFINER and executable by any authenticated
--      user directly via PostgREST (the Next.js route is not the only entry
--      point), so any logged-in user could trade with another user's cash or
--      dump their holdings by passing a victim's id from devtools.
--
--   2. publish_season_results() only checked the season's status — not the
--      caller. Any authenticated user could trigger the irreversible
--      ended → results_published transition (snapshot + badges + status flip)
--      the moment a season hit `ended`.
--
-- Additionally, neither 0002 nor 0007 revoked the default PUBLIC EXECUTE
-- privilege Postgres grants on new functions, so the explicit GRANTs to
-- `authenticated` were not actually the boundary — `anon` could call these
-- RPCs too. This migration fixes the privileges for every RPC we ship.
--
-- Both guards deliberately pass when auth.uid() IS NULL: that only happens
-- outside PostgREST JWT contexts (SQL editor / service_role ops — e.g. the
-- `select publish_season_results(...)` recipe in docs/admin-recipes.md).
-- Those contexts could write the underlying tables directly anyway; the
-- guard's job is to stop JWT-bearing users, and an authenticated JWT always
-- carries a sub claim, so auth.uid() is never NULL for them.
--
-- place_trade is redefined IN FULL (body identical to 0002 except the new
-- step 0) so that the latest migration is always the complete, guarded
-- source of truth — copy from here, not 0002, when changing trade logic.
-- ============================================================

-- ------------------------------------------------------------
-- 1. place_trade — reject p_user_id spoofing
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION place_trade(
  p_user_id       uuid,
  p_contestant_id uuid,
  p_type          trade_type,
  p_dollar_amount numeric
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  -- Constants
  FEE_RATE        constant numeric := 0.02;
  MIN_SUPPLY_FLOOR constant numeric := 1.0;
  -- Binary-search bounds / iterations
  MAX_ITER        constant integer := 64;
  TOL             constant numeric := 0.000001; -- 1e-6 share precision

  -- Season / contestant state
  v_season        seasons%ROWTYPE;
  v_contestant    contestants%ROWTYPE;
  v_season_total  numeric; -- sum of all total_shares_outstanding for season
  v_eff_total     numeric; -- max(v_season_total, MIN_SUPPLY_FLOOR)

  -- Portfolio
  v_portfolio     portfolios%ROWTYPE;

  -- Pricing locals
  v_effective_D   numeric; -- dollar_amount after fee
  v_fee_amount    numeric;
  v_S             numeric; -- contestant shares before trade
  v_T             numeric; -- effective_total before trade

  -- Binary search
  v_lo            numeric;
  v_hi            numeric;
  v_mid           numeric;
  v_cost_mid      numeric;
  v_shares        numeric;

  -- Cost helpers for sell
  v_proceeds      numeric;

  -- Holding state
  v_holding       holdings%ROWTYPE;
  v_new_avg_price numeric;

  -- Trade record
  v_trade_id      uuid;
  v_price_exec    numeric;

  -- Helper function inline result
  v_cost          numeric;
BEGIN
  -- ----------------------------------------------------------------
  -- 0. Authorization: a JWT caller may only trade as themselves.
  --    auth.uid() IS NULL only outside PostgREST (SQL editor /
  --    service_role ops) — those bypass by design.
  -- ----------------------------------------------------------------
  IF auth.uid() IS NOT NULL AND auth.uid() <> p_user_id THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthorized');
  END IF;

  -- ----------------------------------------------------------------
  -- 1. Validate dollar amount
  -- ----------------------------------------------------------------
  IF p_dollar_amount <= 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_dollar_amount');
  END IF;

  -- ----------------------------------------------------------------
  -- 2. Load and validate season (must be active)
  -- ----------------------------------------------------------------
  SELECT * INTO v_season
  FROM seasons
  WHERE status = 'active'
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_active_season');
  END IF;

  -- ----------------------------------------------------------------
  -- 3. Load and lock contestant (must belong to active season)
  -- ----------------------------------------------------------------
  SELECT * INTO v_contestant
  FROM contestants
  WHERE id = p_contestant_id
    AND season_id = v_season.id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'contestant_not_found');
  END IF;

  -- ----------------------------------------------------------------
  -- 4. Compute effective total supply across the season
  -- ----------------------------------------------------------------
  SELECT COALESCE(SUM(total_shares_outstanding), 0)
  INTO v_season_total
  FROM contestants
  WHERE season_id = v_season.id;

  v_eff_total := GREATEST(v_season_total, MIN_SUPPLY_FLOOR);

  -- ----------------------------------------------------------------
  -- 5. Load or create portfolio (lock for update)
  -- ----------------------------------------------------------------
  SELECT * INTO v_portfolio
  FROM portfolios
  WHERE user_id = p_user_id
    AND season_id = v_season.id
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO portfolios (user_id, season_id, cash_balance, net_worth)
    VALUES (p_user_id, v_season.id, v_season.starting_balance, v_season.starting_balance)
    RETURNING * INTO v_portfolio;
  END IF;

  -- ----------------------------------------------------------------
  -- 6. Fee + effective spend
  -- ----------------------------------------------------------------
  v_fee_amount  := ROUND(p_dollar_amount * FEE_RATE, 4);
  v_effective_D := p_dollar_amount - v_fee_amount;

  -- ----------------------------------------------------------------
  -- 7. Snapshot pre-trade state
  -- ----------------------------------------------------------------
  v_S := v_contestant.total_shares_outstanding;
  v_T := v_eff_total;

  -- ----------------------------------------------------------------
  -- 8. Insert trade as 'pending'
  -- ----------------------------------------------------------------
  INSERT INTO trades (
    user_id, contestant_id, season_id,
    type, dollar_amount, shares, price_at_execution, fee_amount,
    state
  ) VALUES (
    p_user_id, p_contestant_id, v_season.id,
    p_type, p_dollar_amount,
    0,   -- filled in below
    0,   -- filled in below
    v_fee_amount,
    'pending'
  ) RETURNING id INTO v_trade_id;

  -- ----------------------------------------------------------------
  -- 9. BUY path
  -- ----------------------------------------------------------------
  IF p_type = 'buy' THEN

    -- 9a. Check funds (gross amount must be covered)
    IF v_portfolio.cash_balance < p_dollar_amount THEN
      UPDATE trades SET state = 'failed', failed_reason = 'insufficient_funds'
        WHERE id = v_trade_id;
      RETURN jsonb_build_object('ok', false, 'error', 'insufficient_funds');
    END IF;

    -- 9b. Binary search: find n such that cost(n) ≈ v_effective_D
    --   cost(n) = n * base_price
    --             + K * [2*(S - T)*(sqrt(T+n) - sqrt(T))
    --             + (2/3)*((T+n)^1.5 - T^1.5)]
    v_lo := 0;
    -- Upper bound: if price were just base_price, n = effective_D / base_price
    -- In practice price is higher, so this is a safe ceiling.
    v_hi := v_effective_D / v_season.base_price * 2 + 1;

    v_shares := 0;
    FOR i IN 1..MAX_ITER LOOP
      v_mid := (v_lo + v_hi) / 2;

      v_cost_mid :=
        v_mid * v_season.base_price
        + v_season.k_constant * (
            2 * (v_S - v_T) * (sqrt(v_T + v_mid) - sqrt(v_T))
            + (2.0/3.0) * (power(v_T + v_mid, 1.5) - power(v_T, 1.5))
          );

      IF ABS(v_cost_mid - v_effective_D) < TOL THEN
        v_shares := v_mid;
        EXIT;
      END IF;

      IF v_cost_mid < v_effective_D THEN
        v_lo := v_mid;
      ELSE
        v_hi := v_mid;
      END IF;

      v_shares := v_mid;
    END LOOP;

    IF v_shares <= 0 THEN
      UPDATE trades SET state = 'failed', failed_reason = 'compute_error'
        WHERE id = v_trade_id;
      RETURN jsonb_build_object('ok', false, 'error', 'compute_error');
    END IF;

    v_price_exec := ROUND(v_effective_D / v_shares, 4);

    -- 9c. Debit cash
    UPDATE portfolios
      SET cash_balance = cash_balance - p_dollar_amount
      WHERE id = v_portfolio.id;

    -- 9d. Update contestant supply
    UPDATE contestants
      SET total_shares_outstanding = total_shares_outstanding + v_shares
      WHERE id = p_contestant_id;

    -- 9e. Upsert holding — recalculate average_purchase_price
    SELECT * INTO v_holding
    FROM holdings
    WHERE portfolio_id = v_portfolio.id AND contestant_id = p_contestant_id;

    IF FOUND THEN
      -- Weighted average of old + new
      v_new_avg_price := ROUND(
        (v_holding.shares_held * v_holding.average_purchase_price + v_shares * v_price_exec)
        / (v_holding.shares_held + v_shares),
        4
      );
      UPDATE holdings
        SET shares_held            = shares_held + v_shares,
            average_purchase_price = v_new_avg_price,
            updated_at             = now()
        WHERE id = v_holding.id;
    ELSE
      INSERT INTO holdings (portfolio_id, user_id, contestant_id, shares_held, average_purchase_price)
      VALUES (v_portfolio.id, p_user_id, p_contestant_id, v_shares, v_price_exec);
    END IF;

  -- ----------------------------------------------------------------
  -- 10. SELL path
  -- ----------------------------------------------------------------
  ELSE -- p_type = 'sell'

    -- 10a. Load holding
    SELECT * INTO v_holding
    FROM holdings
    WHERE portfolio_id = v_portfolio.id AND contestant_id = p_contestant_id;

    IF NOT FOUND THEN
      UPDATE trades SET state = 'failed', failed_reason = 'no_holding'
        WHERE id = v_trade_id;
      RETURN jsonb_build_object('ok', false, 'error', 'no_holding');
    END IF;

    -- 10b. Binary search: find n such that gross_proceeds(n) ≈ p_dollar_amount.
    --   Fee is deducted from gross proceeds after the search (see step 10e).
    --   When selling n shares, supply drops from S to S-n and T to T-n.
    --   proceeds(n) = n * base_price
    --                 + K * [2*(S - T)*(sqrt(T) - sqrt(T-n))
    --                 + (2/3)*(T^1.5 - (T-n)^1.5)]
    --   (mirror image of buy cost with decreasing supply)
    v_lo := 0;
    v_hi := LEAST(v_holding.shares_held, p_dollar_amount / v_season.base_price * 2 + 1);

    -- Clamp to shares owned
    IF v_hi > v_holding.shares_held THEN
      v_hi := v_holding.shares_held;
    END IF;

    v_shares := 0;
    FOR i IN 1..MAX_ITER LOOP
      v_mid := (v_lo + v_hi) / 2;

      -- proceeds for selling v_mid shares
      v_cost_mid :=
        v_mid * v_season.base_price
        + v_season.k_constant * (
            2 * (v_S - v_T) * (sqrt(v_T) - sqrt(v_T - v_mid))
            + (2.0/3.0) * (power(v_T, 1.5) - power(v_T - v_mid, 1.5))
          );

      IF ABS(v_cost_mid - p_dollar_amount) < TOL THEN
        v_shares := v_mid;
        EXIT;
      END IF;

      IF v_cost_mid < p_dollar_amount THEN
        v_lo := v_mid;
      ELSE
        v_hi := v_mid;
      END IF;

      v_shares := v_mid;
    END LOOP;

    -- Cap at shares owned
    IF v_shares > v_holding.shares_held THEN
      v_shares := v_holding.shares_held;
    END IF;

    IF v_shares <= 0 THEN
      UPDATE trades SET state = 'failed', failed_reason = 'compute_error'
        WHERE id = v_trade_id;
      RETURN jsonb_build_object('ok', false, 'error', 'compute_error');
    END IF;

    -- Recompute actual proceeds at final share count
    v_proceeds :=
      v_shares * v_season.base_price
      + v_season.k_constant * (
          2 * (v_S - v_T) * (sqrt(v_T) - sqrt(v_T - v_shares))
          + (2.0/3.0) * (power(v_T, 1.5) - power(v_T - v_shares, 1.5))
        );

    v_price_exec := ROUND(v_proceeds / v_shares, 4);

    -- Net cash received = proceeds - fee
    v_fee_amount := ROUND(v_proceeds * FEE_RATE, 4);
    v_proceeds   := v_proceeds - v_fee_amount;

    -- 10c. Credit cash
    UPDATE portfolios
      SET cash_balance = cash_balance + v_proceeds
      WHERE id = v_portfolio.id;

    -- 10d. Update contestant supply
    UPDATE contestants
      SET total_shares_outstanding = total_shares_outstanding - v_shares
      WHERE id = p_contestant_id;

    -- 10e. Update or delete holding
    IF v_holding.shares_held - v_shares < TOL THEN
      DELETE FROM holdings WHERE id = v_holding.id;
    ELSE
      UPDATE holdings
        SET shares_held = shares_held - v_shares,
            updated_at  = now()
        WHERE id = v_holding.id;
    END IF;

  END IF;

  -- ----------------------------------------------------------------
  -- 11. Finalize trade record
  -- ----------------------------------------------------------------
  UPDATE trades
    SET shares             = ROUND(v_shares, 8),
        price_at_execution = v_price_exec,
        fee_amount         = v_fee_amount,
        state              = 'filled',
        filled_at          = now()
    WHERE id = v_trade_id;

  -- ----------------------------------------------------------------
  -- 12. Return success
  -- ----------------------------------------------------------------
  RETURN jsonb_build_object(
    'ok',               true,
    'trade_id',         v_trade_id,
    'shares',           ROUND(v_shares, 8),
    'price_at_execution', v_price_exec,
    'fee_amount',       v_fee_amount
  );

EXCEPTION WHEN OTHERS THEN
  -- Mark any pending trade as failed if we can
  BEGIN
    IF v_trade_id IS NOT NULL THEN
      UPDATE trades
        SET state = 'failed', failed_reason = SQLERRM
        WHERE id = v_trade_id AND state = 'pending';
    END IF;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  RETURN jsonb_build_object('ok', false, 'error', SQLERRM);
END;
$$;

-- ------------------------------------------------------------
-- 2. publish_season_results — require is_admin for JWT callers
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION publish_season_results(p_season_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status season_status;
BEGIN
  -- Authorization: JWT callers must be admins. auth.uid() IS NULL only in
  -- SQL-editor / service_role contexts (the docs/admin-recipes.md path).
  IF auth.uid() IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin
  ) THEN
    RAISE EXCEPTION 'Only admins can publish season results';
  END IF;

  -- Gate: only an 'ended' season can graduate. Anything else is a no-op
  -- error so the caller learns the state machine fast.
  SELECT status INTO v_status FROM seasons WHERE id = p_season_id;
  IF v_status IS NULL THEN
    RAISE EXCEPTION 'Season % not found', p_season_id;
  END IF;
  IF v_status <> 'ended' THEN
    RAISE EXCEPTION 'Season must be in `ended` state before publishing results (currently %)', v_status;
  END IF;

  -- Final net_worth refresh so the snapshot matches what users see.
  PERFORM refresh_net_worth();

  -- Snapshot the final standings. ROW_NUMBER over net_worth desc is the
  -- canonical rank; ties broken arbitrarily by portfolio.id ordering — which
  -- mirrors how get_leaderboard's RANK() window resolves ties anyway.
  INSERT INTO season_results (user_id, season_id, final_rank, final_net_worth)
  SELECT
    user_id,
    p_season_id,
    ROW_NUMBER() OVER (ORDER BY net_worth DESC, id),
    net_worth
  FROM portfolios
  WHERE season_id = p_season_id
  ON CONFLICT (user_id, season_id) DO NOTHING;

  -- Award badges. top_10 is the inclusive bucket (ranks 1-10); top_3 is the
  -- stricter subset (ranks 1-3). A rank-1 user gets BOTH badges by design —
  -- get_leaderboard already returns badges as a list, so stacking is fine.
  -- ON CONFLICT DO NOTHING makes the function idempotent on re-runs.
  INSERT INTO badges (user_id, season_id, type)
  SELECT user_id, p_season_id, 'top_10'::badge_type
  FROM season_results
  WHERE season_id = p_season_id AND final_rank BETWEEN 1 AND 10
  ON CONFLICT (user_id, season_id, type) DO NOTHING;

  INSERT INTO badges (user_id, season_id, type)
  SELECT user_id, p_season_id, 'top_3'::badge_type
  FROM season_results
  WHERE season_id = p_season_id AND final_rank BETWEEN 1 AND 3
  ON CONFLICT (user_id, season_id, type) DO NOTHING;

  -- Finally flip status.
  UPDATE seasons SET status = 'results_published' WHERE id = p_season_id;
END;
$$;

-- ------------------------------------------------------------
-- 3. Privilege hygiene — Postgres grants EXECUTE to PUBLIC by
--    default on new functions, so the GRANTs in 0002/0005/0007
--    were never the real boundary (anon had access too). Make
--    `authenticated` the actual floor for every RPC we expose.
-- ------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION place_trade(uuid, uuid, trade_type, numeric) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION publish_season_results(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION get_leaderboard(uuid, int, int, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION get_user_rank(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION leaderboard_badges(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION refresh_net_worth() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION place_trade(uuid, uuid, trade_type, numeric) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION publish_season_results(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_leaderboard(uuid, int, int, text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_rank(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION leaderboard_badges(uuid) TO authenticated;
