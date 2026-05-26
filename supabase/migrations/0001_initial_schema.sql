-- ============================================================
-- Reality Stock Watch — Initial Schema
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE season_status AS ENUM (
  'setup', 'pre_season', 'active', 'ended', 'results_published'
);

CREATE TYPE contestant_status AS ENUM (
  'active', 'evicted', 'winner', 'runner_up'
);

CREATE TYPE trade_type AS ENUM ('buy', 'sell');

CREATE TYPE trade_state AS ENUM ('pending', 'filled', 'failed');

CREATE TYPE badge_type AS ENUM ('top_3', 'top_10');

CREATE TYPE survey_status AS ENUM (
  'draft', 'active', 'closed', 'results_published'
);

CREATE TYPE question_type AS ENUM (
  'ranking', 'multiple_choice', 'single_choice'
);

-- ============================================================
-- PROFILES
-- Mirror of auth.users for app-specific data.
-- Created automatically via trigger on signup.
-- ============================================================

CREATE TABLE profiles (
  id          uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    text        NOT NULL UNIQUE,
  avatar_url  text,
  is_admin    boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX profiles_username_idx ON profiles (username);

-- Trigger: create profile row on auth.users insert
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, username)
  VALUES (
    NEW.id,
    -- Auto-generate placeholder; app layer overwrites with BB-themed username
    'user_' || substr(NEW.id::text, 1, 8)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- SEASONS
-- ============================================================

CREATE TABLE seasons (
  id               uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text           NOT NULL,
  status           season_status  NOT NULL DEFAULT 'setup',
  start_date       date,
  end_date         date,
  starting_balance numeric(12,2)  NOT NULL,
  k_constant       numeric(18,8)  NOT NULL,
  base_price       numeric(12,4)  NOT NULL,
  created_at       timestamptz    NOT NULL DEFAULT now()
);

CREATE INDEX seasons_status_idx ON seasons (status);

-- Enforce at most one active season at a time
CREATE UNIQUE INDEX seasons_one_active_idx ON seasons (status)
  WHERE status = 'active';

-- Prevent editing pricing constants once season is active
CREATE OR REPLACE FUNCTION lock_active_season_constants()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status = 'active' AND (
    NEW.starting_balance IS DISTINCT FROM OLD.starting_balance OR
    NEW.k_constant       IS DISTINCT FROM OLD.k_constant OR
    NEW.base_price       IS DISTINCT FROM OLD.base_price
  ) THEN
    RAISE EXCEPTION 'Pricing constants (starting_balance, k_constant, base_price) are locked once a season is active';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER seasons_lock_constants
  BEFORE UPDATE ON seasons
  FOR EACH ROW EXECUTE FUNCTION lock_active_season_constants();

-- ============================================================
-- CONTESTANTS
-- total_shares_outstanding is the HOT ROW — only ever updated
-- inside the place_trade transaction, never outside.
-- ============================================================

CREATE TABLE contestants (
  id                       uuid               PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id                uuid               NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  name                     text               NOT NULL,
  photo_url                text,
  bio                      text,
  status                   contestant_status  NOT NULL DEFAULT 'active',
  is_hoh                   boolean            NOT NULL DEFAULT false,
  is_nominated             boolean            NOT NULL DEFAULT false,
  has_veto                 boolean            NOT NULL DEFAULT false,
  total_shares_outstanding numeric(18,8)      NOT NULL DEFAULT 0,
  created_at               timestamptz        NOT NULL DEFAULT now()
);

CREATE INDEX contestants_season_id_idx ON contestants (season_id);
CREATE INDEX contestants_status_idx    ON contestants (status);

-- ============================================================
-- PORTFOLIOS
-- One per user per season. Created when user first accesses a season.
-- ============================================================

CREATE TABLE portfolios (
  id            uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid         NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  season_id     uuid         NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  cash_balance  numeric(12,2) NOT NULL,
  net_worth     numeric(12,2) NOT NULL,
  created_at    timestamptz  NOT NULL DEFAULT now(),
  UNIQUE (user_id, season_id)
);

CREATE INDEX portfolios_user_id_idx   ON portfolios (user_id);
CREATE INDEX portfolios_season_id_idx ON portfolios (season_id);
CREATE INDEX portfolios_net_worth_idx ON portfolios (net_worth DESC);

-- ============================================================
-- HOLDINGS
-- User's current position in one contestant. Upserted on every trade.
-- Row is deleted when shares_held reaches 0.
-- ============================================================

CREATE TABLE holdings (
  id                     uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id           uuid         NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  user_id                uuid         NOT NULL REFERENCES profiles(id),
  contestant_id          uuid         NOT NULL REFERENCES contestants(id),
  shares_held            numeric(18,8) NOT NULL DEFAULT 0,
  average_purchase_price numeric(12,4) NOT NULL,
  updated_at             timestamptz  NOT NULL DEFAULT now(),
  created_at             timestamptz  NOT NULL DEFAULT now(),
  UNIQUE (portfolio_id, contestant_id)
);

CREATE INDEX holdings_portfolio_id_idx   ON holdings (portfolio_id);
CREATE INDEX holdings_contestant_id_idx  ON holdings (contestant_id);
CREATE INDEX holdings_user_id_idx        ON holdings (user_id);

-- ============================================================
-- TRADES
-- ============================================================

CREATE TABLE trades (
  id                  uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid         NOT NULL REFERENCES profiles(id),
  contestant_id       uuid         NOT NULL REFERENCES contestants(id),
  season_id           uuid         NOT NULL REFERENCES seasons(id),
  type                trade_type   NOT NULL,
  dollar_amount       numeric(12,2) NOT NULL,
  shares              numeric(18,8) NOT NULL,
  price_at_execution  numeric(12,4) NOT NULL,
  fee_amount          numeric(12,4) NOT NULL DEFAULT 0,
  state               trade_state  NOT NULL DEFAULT 'pending',
  failed_reason       text,
  created_at          timestamptz  NOT NULL DEFAULT now(),
  filled_at           timestamptz
);

CREATE INDEX trades_user_created_idx     ON trades (user_id, created_at DESC);
CREATE INDEX trades_contestant_id_idx    ON trades (contestant_id);
CREATE INDEX trades_state_idx            ON trades (state);
CREATE INDEX trades_season_id_idx        ON trades (season_id);

-- ============================================================
-- SEASON RESULTS
-- Snapshot created when season moves to results_published.
-- ============================================================

CREATE TABLE season_results (
  id              uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid         NOT NULL REFERENCES profiles(id),
  season_id       uuid         NOT NULL REFERENCES seasons(id),
  final_rank      integer      NOT NULL,
  final_net_worth numeric(12,2) NOT NULL,
  created_at      timestamptz  NOT NULL DEFAULT now(),
  UNIQUE (user_id, season_id)
);

CREATE INDEX season_results_season_rank_idx ON season_results (season_id, final_rank);

-- ============================================================
-- BADGES
-- ============================================================

CREATE TABLE badges (
  id          uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid         NOT NULL REFERENCES profiles(id),
  season_id   uuid         NOT NULL REFERENCES seasons(id),
  type        badge_type   NOT NULL,
  awarded_at  timestamptz  NOT NULL DEFAULT now(),
  UNIQUE (user_id, season_id, type)
);

CREATE INDEX badges_user_id_idx ON badges (user_id);

-- ============================================================
-- SURVEYS
-- ============================================================

CREATE TABLE surveys (
  id                    uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id             uuid          NOT NULL REFERENCES seasons(id),
  title                 text          NOT NULL,
  week_number           integer       NOT NULL,
  status                survey_status NOT NULL DEFAULT 'draft',
  closes_at             timestamptz,
  published_at          timestamptz,
  results_published_at  timestamptz,
  created_at            timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX surveys_season_status_idx ON surveys (season_id, status);

-- Enforce at most one active survey per season
CREATE UNIQUE INDEX surveys_one_active_per_season_idx ON surveys (season_id, status)
  WHERE status = 'active';

-- ============================================================
-- SURVEY QUESTIONS
-- ============================================================

CREATE TABLE survey_questions (
  id               uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id        uuid          NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  text             text          NOT NULL,
  type             question_type NOT NULL,
  display_order    integer       NOT NULL,
  options          jsonb,
  uses_contestants boolean       NOT NULL DEFAULT false,
  created_at       timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX survey_questions_survey_order_idx ON survey_questions (survey_id, display_order);

-- ============================================================
-- SURVEY RESPONSES
-- One row per person per survey. Answers stored as JSONB.
-- Anonymous submissions are never retroactively linked to accounts.
-- ============================================================

CREATE TABLE survey_responses (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id    uuid        NOT NULL REFERENCES surveys(id),
  user_id      uuid        REFERENCES profiles(id),
  answers      jsonb       NOT NULL,
  is_anonymous boolean     NOT NULL DEFAULT false,
  submitted_at timestamptz NOT NULL DEFAULT now()
);

-- One response per logged-in user per survey
CREATE UNIQUE INDEX survey_responses_user_survey_idx
  ON survey_responses (survey_id, user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX survey_responses_survey_id_idx ON survey_responses (survey_id);
CREATE INDEX survey_responses_user_id_idx   ON survey_responses (user_id);

-- ============================================================
-- PUSH SUBSCRIPTIONS
-- ============================================================

CREATE TABLE push_subscriptions (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint   text        NOT NULL UNIQUE,
  p256dh     text        NOT NULL,
  auth_key   text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX push_subscriptions_user_id_idx ON push_subscriptions (user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons           ENABLE ROW LEVEL SECURITY;
ALTER TABLE contestants       ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios        ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades            ENABLE ROW LEVEL SECURITY;
ALTER TABLE season_results    ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges            ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys           ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_questions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses  ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- profiles: any authed user can read; user can update own non-admin fields; is_admin not user-editable
CREATE POLICY "profiles: public read"
  ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "profiles: user update own"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND is_admin = (SELECT is_admin FROM profiles WHERE id = auth.uid()));

-- seasons: public read; admin write
CREATE POLICY "seasons: public read"
  ON seasons FOR SELECT USING (true);

CREATE POLICY "seasons: admin write"
  ON seasons FOR ALL TO authenticated
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()))
  WITH CHECK ((SELECT is_admin FROM profiles WHERE id = auth.uid()));

-- contestants: public read; admin write
CREATE POLICY "contestants: public read"
  ON contestants FOR SELECT USING (true);

CREATE POLICY "contestants: admin write"
  ON contestants FOR ALL TO authenticated
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()))
  WITH CHECK ((SELECT is_admin FROM profiles WHERE id = auth.uid()));

-- portfolios: user reads own; all writes via place_trade RPC only
CREATE POLICY "portfolios: user read own"
  ON portfolios FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- holdings: user reads own; all writes via place_trade RPC only
CREATE POLICY "holdings: user read own"
  ON holdings FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- trades: user reads own; admin reads all; all writes via place_trade RPC only
CREATE POLICY "trades: user read own"
  ON trades FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "trades: admin read all"
  ON trades FOR SELECT TO authenticated
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()));

-- season_results: public read
CREATE POLICY "season_results: public read"
  ON season_results FOR SELECT USING (true);

-- badges: public read
CREATE POLICY "badges: public read"
  ON badges FOR SELECT USING (true);

-- surveys: authenticated users read active/results_published; admin full access
CREATE POLICY "surveys: authenticated read active"
  ON surveys FOR SELECT TO authenticated
  USING (status IN ('active', 'results_published'));

CREATE POLICY "surveys: admin full access"
  ON surveys FOR ALL TO authenticated
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()))
  WITH CHECK ((SELECT is_admin FROM profiles WHERE id = auth.uid()));

-- survey_questions: same as surveys
CREATE POLICY "survey_questions: authenticated read active"
  ON survey_questions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM surveys
      WHERE surveys.id = survey_questions.survey_id
        AND surveys.status IN ('active', 'results_published')
    )
  );

CREATE POLICY "survey_questions: admin full access"
  ON survey_questions FOR ALL TO authenticated
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()))
  WITH CHECK ((SELECT is_admin FROM profiles WHERE id = auth.uid()));

-- survey_responses: user insert/read own; admin reads all
CREATE POLICY "survey_responses: user insert"
  ON survey_responses FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "survey_responses: user read own"
  ON survey_responses FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "survey_responses: admin read all"
  ON survey_responses FOR SELECT TO authenticated
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()));

-- push_subscriptions: user manages own
CREATE POLICY "push_subscriptions: user manage own"
  ON push_subscriptions FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
