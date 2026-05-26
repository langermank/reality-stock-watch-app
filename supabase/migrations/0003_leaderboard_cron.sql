-- ============================================================
-- Reality Stock Watch — Leaderboard net_worth pg_cron refresh
-- Issue #35
--
-- Staleness: leaderboard updates ~every 60 seconds (pg_cron
-- minimum granularity). For a game leaderboard this is
-- acceptable — sub-second freshness is unnecessary and would
-- be expensive to maintain. Portfolios updated inside
-- place_trade stay accurate for the trading user; this job
-- catches drift from other users' trades changing liquidation
-- values.
-- ============================================================

-- ============================================================
-- HELPER: compute_liquidation_value
--
-- Returns what a user receives selling `p_shares_held` of a
-- contestant with `p_contestant_shares` shares outstanding,
-- given that the total across all contestants in the season
-- is `p_total_all_shares`.
--
-- Sell proceeds integral (from pricing-formula.md):
--   proceeds(n) = n × base_price
--               + K × [ 2(S−T) × (√(T−n) − √T)
--                      + (2/3) × ((T−n)^(3/2) − T^(3/2)) ]
--
-- where:
--   n = shares_held to sell
--   S = contestant total_shares_outstanding
--   T = effective_total (max of total_all_shares, MIN_SUPPLY_FLOOR)
--
-- Fee rate of 0.02 (2%) is deducted from gross proceeds.
-- Returns 0 if shares_held <= 0 (no holding / tiny rounding).
-- ============================================================

CREATE OR REPLACE FUNCTION compute_liquidation_value(
  p_shares_held        numeric,  -- n: shares being sold
  p_contestant_shares  numeric,  -- S: shares outstanding for this contestant
  p_total_all_shares   numeric,  -- raw sum across all contestants in season
  p_k                  numeric,  -- K constant from seasons row
  p_base_price         numeric   -- base_price from seasons row
)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_min_supply_floor  constant numeric := 1.0;
  v_fee_rate          constant numeric := 0.02;
  v_T                 numeric;  -- effective total
  v_n                 numeric;  -- shares to sell (clamped)
  v_S                 numeric;  -- contestant shares outstanding
  v_T_minus_n         numeric;  -- T − n
  v_gross             numeric;
BEGIN
  -- Nothing to liquidate
  IF p_shares_held <= 0 THEN
    RETURN 0;
  END IF;

  v_T := GREATEST(p_total_all_shares, v_min_supply_floor);
  v_n := p_shares_held;
  v_S := p_contestant_shares;

  -- Can't sell more shares than contestant has outstanding
  -- (guards against data anomalies)
  IF v_n > v_S THEN
    v_n := v_S;
  END IF;

  v_T_minus_n := v_T - v_n;

  -- Clamp: effective total can't drop below floor after sale
  IF v_T_minus_n < v_min_supply_floor THEN
    v_T_minus_n := v_min_supply_floor;
  END IF;

  -- Integral: proceeds(n) = n × base_price
  --   + K × [ 2(S−T) × (√(T−n) − √T) + (2/3) × ((T−n)^(3/2) − T^(3/2)) ]
  v_gross := v_n * p_base_price
    + p_k * (
        2.0 * (v_S - v_T) * (sqrt(v_T_minus_n) - sqrt(v_T))
        + (2.0 / 3.0) * (power(v_T_minus_n, 1.5) - power(v_T, 1.5))
      );

  -- Proceeds can't be negative (e.g. very tiny holdings at floor)
  IF v_gross < 0 THEN
    v_gross := 0;
  END IF;

  RETURN v_gross * (1.0 - v_fee_rate);
END;
$$;

-- ============================================================
-- MAIN: refresh_net_worth
--
-- Recalculates net_worth for every portfolio belonging to an
-- active season, then bulk-updates portfolios in one statement.
--
-- net_worth = cash_balance + SUM(liquidation_value per holding)
--
-- Portfolios with zero holdings get net_worth = cash_balance.
--
-- SECURITY DEFINER so pg_cron (running as superuser) can bypass
-- RLS which restricts portfolio rows to their owning user.
-- ============================================================

CREATE OR REPLACE FUNCTION refresh_net_worth()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE portfolios p
  SET    net_worth = calc.new_net_worth
  FROM (
    -- One row per portfolio in an active season
    SELECT
      p2.id                                             AS portfolio_id,
      p2.cash_balance + COALESCE(hsum.liquidation, 0)  AS new_net_worth
    FROM portfolios p2
    JOIN seasons s ON s.id = p2.season_id AND s.status = 'active'
    LEFT JOIN LATERAL (
      -- Sum liquidation values across all holdings for this portfolio
      SELECT SUM(
        compute_liquidation_value(
          h.shares_held,
          c.total_shares_outstanding,
          season_totals.total_all,
          s.k_constant,
          s.base_price
        )
      ) AS liquidation
      FROM holdings h
      JOIN contestants c ON c.id = h.contestant_id
      -- Pre-aggregate total_shares_outstanding for this season once per portfolio eval
      CROSS JOIN (
        SELECT COALESCE(SUM(c2.total_shares_outstanding), 0) AS total_all
        FROM contestants c2
        WHERE c2.season_id = s.id
      ) AS season_totals
      WHERE h.portfolio_id = p2.id
    ) hsum ON true
  ) AS calc
  WHERE p.id = calc.portfolio_id
    -- Skip rows that haven't actually changed (avoids unnecessary WAL/index churn)
    AND p.net_worth IS DISTINCT FROM calc.new_net_worth;
END;
$$;

-- ============================================================
-- pg_cron schedule — every minute (minimum pg_cron granularity)
--
-- Wrapped in an idempotent DO block: unschedules any existing
-- job with the same name before creating the new one, so
-- re-running this migration is safe.
-- ============================================================

DO $$
BEGIN
  -- Remove existing job if present (idempotent re-run safety)
  PERFORM cron.unschedule('refresh-net-worth');
EXCEPTION
  WHEN others THEN
    -- cron.unschedule raises if the job doesn't exist; that's fine
    NULL;
END;
$$;

SELECT cron.schedule(
  'refresh-net-worth',   -- job name
  '* * * * *',           -- every minute (pg_cron minimum granularity)
  'SELECT refresh_net_worth()'
);
