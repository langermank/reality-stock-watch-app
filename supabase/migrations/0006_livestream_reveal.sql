-- ============================================================
-- Reality Stock Watch — Livestream reveal
-- Issue #63 (part of #61)
--
-- Two tables backing the producer livestream reveal feature:
--
--   survey_aggregate_rankings — a FROZEN snapshot of the fan-
--     aggregate ranking for a survey (one row per contestant).
--     Unlike pricing (always derived, never stored), this is
--     deliberately stored: it is computed once when a survey
--     closes, then revealed progressively on stream. There is NO
--     `revealed` column — reveal visibility is DERIVED from
--     survey_reveal_state.reveal_count (top-first, rank-ascending),
--     mirroring the ported reveal logic.
--
--   survey_reveal_state — the producer's live reveal pointer for a
--     season: which survey is on screen and how many entries are
--     revealed. Updated from the admin control panel and broadcast
--     to the chart view via Supabase Realtime.
--
-- Access: admin-only (read AND write). Nothing here is public — the
-- broadcast view loads in the producer's authenticated session and
-- OBS captures that window.
-- ============================================================

-- ------------------------------------------------------------
-- survey_aggregate_rankings
-- ------------------------------------------------------------
CREATE TABLE survey_aggregate_rankings (
  survey_id     uuid    NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  contestant_id uuid    NOT NULL REFERENCES contestants(id) ON DELETE CASCADE,
  rank          integer NOT NULL,          -- 1 = top
  score         numeric NOT NULL,          -- aggregate magnitude (Borda points / avg-rank)
  PRIMARY KEY (survey_id, contestant_id)
);

-- Fetch a survey's ranking ordered for reveal (rank ascending).
CREATE INDEX idx_survey_aggregate_rankings_survey_rank
  ON survey_aggregate_rankings (survey_id, rank);

-- ------------------------------------------------------------
-- survey_reveal_state  (one active reveal pointer per season)
-- ------------------------------------------------------------
CREATE TABLE survey_reveal_state (
  season_id          uuid        PRIMARY KEY REFERENCES seasons(id) ON DELETE CASCADE,
  selected_survey_id uuid        REFERENCES surveys(id) ON DELETE SET NULL,
  reveal_count       integer     NOT NULL DEFAULT 0 CHECK (reveal_count >= 0),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- RLS — admin only (read + write). No public/authenticated read:
-- the whole feature is gated, so non-admins get nothing.
-- ------------------------------------------------------------
ALTER TABLE survey_aggregate_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_reveal_state       ENABLE ROW LEVEL SECURITY;

CREATE POLICY "survey_aggregate_rankings: admin full access"
  ON survey_aggregate_rankings FOR ALL TO authenticated
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()))
  WITH CHECK ((SELECT is_admin FROM profiles WHERE id = auth.uid()));

CREATE POLICY "survey_reveal_state: admin full access"
  ON survey_reveal_state FOR ALL TO authenticated
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()))
  WITH CHECK ((SELECT is_admin FROM profiles WHERE id = auth.uid()));

-- ------------------------------------------------------------
-- Realtime — broadcast reveal-pointer changes to the chart view.
-- REPLICA IDENTITY FULL so UPDATEs carry the whole row to clients
-- (clients read selected_survey_id + reveal_count off the payload).
-- Supabase ships a `supabase_realtime` publication by default.
-- RLS still applies to Realtime, so only the admin session receives it.
-- ------------------------------------------------------------
ALTER TABLE survey_reveal_state REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE survey_reveal_state;
