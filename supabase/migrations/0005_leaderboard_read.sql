-- ============================================================
-- Reality Stock Watch — Leaderboard read functions
-- Issue #40
-- ============================================================
--
-- portfolios RLS is own-row only (auth.uid() = user_id), so a client
-- cannot read everyone's net_worth to build a ranking. These
-- SECURITY DEFINER functions expose ONLY public ranking columns
-- (rank, username, avatar, net_worth, badges) — never cash_balance —
-- so the leaderboard works without loosening portfolios RLS.
--
-- Ranking is computed at query time over the cached portfolios.net_worth
-- column (refreshed ~every 60s by the pg_cron job in 0003). Search
-- filters the returned rows but rank still reflects true standing.
-- ============================================================

-- Badges for a user across all seasons, as a JSON array labelled with
-- the season name (badges persist across seasons).
CREATE OR REPLACE FUNCTION leaderboard_badges(p_user_id uuid)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object('type', b.type, 'season', s.name)
      ORDER BY b.awarded_at
    ),
    '[]'::jsonb
  )
  FROM badges b
  JOIN seasons s ON s.id = b.season_id
  WHERE b.user_id = p_user_id;
$$;

-- ------------------------------------------------------------
-- get_leaderboard: paginated current-season ranking.
--   p_search filters displayed rows by username (rank preserved).
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_leaderboard(
  p_season_id uuid,
  p_limit     int DEFAULT 25,
  p_offset    int DEFAULT 0,
  p_search    text DEFAULT NULL
)
RETURNS TABLE (
  rank      bigint,
  user_id   uuid,
  username  text,
  avatar_url text,
  net_worth numeric,
  is_self   boolean,
  badges    jsonb
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  WITH ranked AS (
    SELECT
      RANK() OVER (ORDER BY po.net_worth DESC) AS rank,
      po.user_id,
      pr.username,
      pr.avatar_url,
      po.net_worth
    FROM portfolios po
    JOIN profiles pr ON pr.id = po.user_id
    WHERE po.season_id = p_season_id
  )
  SELECT
    r.rank,
    r.user_id,
    r.username,
    r.avatar_url,
    r.net_worth,
    r.user_id = auth.uid() AS is_self,
    leaderboard_badges(r.user_id) AS badges
  FROM ranked r
  WHERE p_search IS NULL
     OR p_search = ''
     OR r.username ILIKE '%' || p_search || '%'
  ORDER BY r.rank, r.username
  LIMIT GREATEST(p_limit, 0)
  OFFSET GREATEST(p_offset, 0);
$$;

-- ------------------------------------------------------------
-- get_user_rank: the caller's own row for the "Find me" shortcut,
--   even when they fall outside the currently loaded page.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_user_rank(p_season_id uuid)
RETURNS TABLE (
  rank      bigint,
  user_id   uuid,
  username  text,
  avatar_url text,
  net_worth numeric,
  is_self   boolean,
  badges    jsonb
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  WITH ranked AS (
    SELECT
      RANK() OVER (ORDER BY po.net_worth DESC) AS rank,
      po.user_id,
      pr.username,
      pr.avatar_url,
      po.net_worth
    FROM portfolios po
    JOIN profiles pr ON pr.id = po.user_id
    WHERE po.season_id = p_season_id
  )
  SELECT
    r.rank,
    r.user_id,
    r.username,
    r.avatar_url,
    r.net_worth,
    true AS is_self,
    leaderboard_badges(r.user_id) AS badges
  FROM ranked r
  WHERE r.user_id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION leaderboard_badges(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_leaderboard(uuid, int, int, text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_rank(uuid) TO authenticated;
