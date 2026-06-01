-- ============================================================
-- Reality Stock Watch — Season management (#42)
--
-- Two pieces:
--   1. `enforce_pricing_lock` trigger — backstops the CLAUDE.md hard rule
--      "Pricing constants lock permanently when a season goes Active". Once
--      a season's status crosses into active/ended/results_published, the
--      starting_balance, k_constant, and base_price columns become immutable.
--      Other columns (name, dates, status itself) stay editable so admins
--      can still drive transitions and fix typos.
--
--   2. `publish_season_results(season_id)` — the multi-step ended → results-
--      published transition, in one transaction:
--        a. Final refresh_net_worth() so the snapshot is current
--        b. Insert season_results rows (rank by net_worth desc)
--        c. Award top_3 + top_10 badges (top_10 is inclusive, top_3 is the
--           stricter subset; a #1 user gets both)
--        d. Flip seasons.status to 'results_published'
--      Designed to be called either from the admin server action OR via
--      Claude/SQL when wrapping up a real season.
-- ============================================================

-- ------------------------------------------------------------
-- Trigger: lock pricing constants once a season goes active
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION enforce_pricing_lock() RETURNS TRIGGER AS $$
BEGIN
  -- The status flip itself isn't blocked — only writes to the locked columns.
  -- IS DISTINCT FROM handles the NULL case naturally; even though the columns
  -- are NOT NULL today, future-proofing costs nothing.
  IF OLD.status IN ('active', 'ended', 'results_published')
     AND (NEW.starting_balance IS DISTINCT FROM OLD.starting_balance
          OR NEW.k_constant      IS DISTINCT FROM OLD.k_constant
          OR NEW.base_price      IS DISTINCT FROM OLD.base_price)
  THEN
    RAISE EXCEPTION 'Pricing constants are locked once a season goes active'
      USING ERRCODE = 'check_violation',
            HINT = 'starting_balance, k_constant, and base_price can only be edited during setup/pre_season';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS seasons_pricing_lock ON seasons;
CREATE TRIGGER seasons_pricing_lock
  BEFORE UPDATE ON seasons
  FOR EACH ROW
  EXECUTE FUNCTION enforce_pricing_lock();

-- ------------------------------------------------------------
-- Function: publish_season_results
-- ------------------------------------------------------------
-- SECURITY DEFINER so an admin's user-scoped session can call it without
-- needing direct write access to badges/season_results — the function
-- enforces the gate (status must be 'ended') and runs as the function owner.
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

GRANT EXECUTE ON FUNCTION publish_season_results(uuid) TO authenticated;
