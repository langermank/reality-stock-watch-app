-- ============================================================
-- Reality Stock Watch — Seed Data
-- LOCAL AND STAGING ONLY. Never run on production.
--
-- Fake BB27 season: 10 contestants, 5 test users, trades,
-- holdings, portfolios, surveys in all four states.
--
-- Pricing constants (all TBD in PRD — placeholder values):
--   base_price = 1.00  (share price at zero supply)
--   k_constant = 0.50  (market sensitivity)
--   starting_balance = 1000.00
--
-- Approximate prices at seed time (k=0.50, total supply=975):
--   Angela $4.20 · Janelle $3.80 · Ian $3.44 · Tyler $3.04
--   Nicole A $2.24 · Derek $1.72 · Memphis $1.48
--   Kaysar $1.33 · Da'Vonne $1.21 · Enzo (evicted) $1.08
--
-- All test accounts use password: testtest
-- ============================================================


-- ============================================================
-- USERS
-- Profiles are created automatically by the on_auth_user_created
-- trigger; we UPDATE them afterwards to set real usernames.
-- ============================================================

INSERT INTO auth.users (
  id, instance_id, aud, role,
  email, encrypted_password, email_confirmed_at,
  created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  is_super_admin, confirmation_token, recovery_token,
  email_change_token_new, email_change
) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated',
   'admin@rsw.test', crypt('testtest', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{}',
   false, '', '', '', ''),

  ('bbbbbbbb-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated',
   'sarah@rsw.test', crypt('testtest', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{}',
   false, '', '', '', ''),

  ('cccccccc-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated',
   'mike@rsw.test', crypt('testtest', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{}',
   false, '', '', '', ''),

  ('dddddddd-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated',
   'tara@rsw.test', crypt('testtest', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{}',
   false, '', '', '', ''),

  ('eeeeeeee-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated',
   'jay@rsw.test', crypt('testtest', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{}',
   false, '', '', '', '');

-- Overwrite placeholder usernames created by trigger
UPDATE profiles SET username = 'admin',          is_admin = true WHERE id = 'aaaaaaaa-0000-0000-0000-000000000001';
UPDATE profiles SET username = 'superfan_sarah'                  WHERE id = 'bbbbbbbb-0000-0000-0000-000000000002';
UPDATE profiles SET username = 'rhap_mike'                       WHERE id = 'cccccccc-0000-0000-0000-000000000003';
UPDATE profiles SET username = 'bb_tara'                         WHERE id = 'dddddddd-0000-0000-0000-000000000004';
UPDATE profiles SET username = 'pov_jay'                         WHERE id = 'eeeeeeee-0000-0000-0000-000000000005';


-- ============================================================
-- SEASON
-- ============================================================

INSERT INTO seasons (id, name, status, start_date, end_date, starting_balance, k_constant, base_price) VALUES
  ('00000002-0000-0000-0000-000000000001',
   'Big Brother 27', 'active', '2026-07-10', '2026-09-18',
   1000.00, 0.50, 1.00);


-- ============================================================
-- CONTESTANTS
-- total_shares_outstanding varied to exercise the pricing curve.
-- ============================================================

INSERT INTO contestants (id, season_id, name, bio, status, is_hoh, is_nominated, has_veto, total_shares_outstanding) VALUES
  ('00000003-0000-0000-0000-000000000001', '00000002-0000-0000-0000-000000000001',
   'Angela Rummans',
   'Former athlete known for cold, precise strategic gameplay.',
   'active', false, false, false, 200.00000000),

  ('00000003-0000-0000-0000-000000000002', '00000002-0000-0000-0000-000000000001',
   'Derek Xiao',
   'NYC entrepreneur with a sharp social game and a big smile.',
   'active', false, false, false, 75.00000000),

  ('00000003-0000-0000-0000-000000000003', '00000002-0000-0000-0000-000000000001',
   'Janelle Pierzina',
   'BB legend returning for one more run at the title.',
   'active', false, false, false, 175.00000000),

  ('00000003-0000-0000-0000-000000000004', '00000002-0000-0000-0000-000000000001',
   'Kaysar Ridha',
   'Fan favourite known for bold, high-risk game moves.',
   'active', true, false, false, 45.00000000),

  ('00000003-0000-0000-0000-000000000005', '00000002-0000-0000-0000-000000000001',
   'Memphis Garrett',
   'Laid-back strategist who plays almost entirely under the radar.',
   'active', false, true, false, 60.00000000),

  ('00000003-0000-0000-0000-000000000006', '00000002-0000-0000-0000-000000000001',
   'Nicole Anthony',
   'Long Island sweetheart with a fierce competitive streak.',
   'active', false, false, false, 100.00000000),

  ('00000003-0000-0000-0000-000000000007', '00000002-0000-0000-0000-000000000001',
   'Tyler Crispen',
   'Beachside charmer and two-time finalist who almost won it all.',
   'active', false, false, false, 125.00000000),

  ('00000003-0000-0000-0000-000000000008', '00000002-0000-0000-0000-000000000001',
   'Da''Vonne Rogers',
   'Three-time player with razor-sharp reads on the house.',
   'active', false, false, false, 30.00000000),

  ('00000003-0000-0000-0000-000000000009', '00000002-0000-0000-0000-000000000001',
   'Ian Terry',
   'BB14 winner, fan favourite, and relentless comp beast.',
   'active', false, false, true, 150.00000000),

  ('00000003-0000-0000-0000-000000000010', '00000002-0000-0000-0000-000000000001',
   'Enzo Palumaro',
   'The Meow Meow is back. Jersey attitude, big moves, short stay.',
   'evicted', false, false, false, 15.00000000);


-- ============================================================
-- PORTFOLIOS
-- cash_balance = starting_balance minus dollars spent buying.
-- net_worth = approximate cash + current holding value.
-- ============================================================

INSERT INTO portfolios (id, user_id, season_id, cash_balance, net_worth) VALUES
  ('00000004-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', '00000002-0000-0000-0000-000000000001',  820.00,  987.50),
  ('00000004-0000-0000-0000-000000000002', 'bbbbbbbb-0000-0000-0000-000000000002', '00000002-0000-0000-0000-000000000001',  640.00, 1085.20),
  ('00000004-0000-0000-0000-000000000003', 'cccccccc-0000-0000-0000-000000000003', '00000002-0000-0000-0000-000000000001',  710.00,  998.80),
  ('00000004-0000-0000-0000-000000000004', 'dddddddd-0000-0000-0000-000000000004', '00000002-0000-0000-0000-000000000001',  775.00, 1012.30),
  ('00000004-0000-0000-0000-000000000005', 'eeeeeeee-0000-0000-0000-000000000005', '00000002-0000-0000-0000-000000000001',  910.00,  976.40);


-- ============================================================
-- HOLDINGS
-- ============================================================

INSERT INTO holdings (portfolio_id, user_id, contestant_id, shares_held, average_purchase_price) VALUES
  -- admin: Angela + Tyler
  ('00000004-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', '00000003-0000-0000-0000-000000000001', 40.00000000, 1.8500),
  ('00000004-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', '00000003-0000-0000-0000-000000000007', 30.00000000, 2.2000),

  -- sarah: Janelle + Ian + Nicole A
  ('00000004-0000-0000-0000-000000000002', 'bbbbbbbb-0000-0000-0000-000000000002', '00000003-0000-0000-0000-000000000003', 60.00000000, 2.1000),
  ('00000004-0000-0000-0000-000000000002', 'bbbbbbbb-0000-0000-0000-000000000002', '00000003-0000-0000-0000-000000000009', 45.00000000, 2.4000),
  ('00000004-0000-0000-0000-000000000002', 'bbbbbbbb-0000-0000-0000-000000000002', '00000003-0000-0000-0000-000000000006', 25.00000000, 1.9000),

  -- mike: Angela + Memphis
  ('00000004-0000-0000-0000-000000000003', 'cccccccc-0000-0000-0000-000000000003', '00000003-0000-0000-0000-000000000001', 35.00000000, 1.7000),
  ('00000004-0000-0000-0000-000000000003', 'cccccccc-0000-0000-0000-000000000003', '00000003-0000-0000-0000-000000000005', 55.00000000, 1.4000),

  -- tara: Janelle + Kaysar
  ('00000004-0000-0000-0000-000000000004', 'dddddddd-0000-0000-0000-000000000004', '00000003-0000-0000-0000-000000000003', 50.00000000, 2.0000),
  ('00000004-0000-0000-0000-000000000004', 'dddddddd-0000-0000-0000-000000000004', '00000003-0000-0000-0000-000000000004', 38.00000000, 1.3000),

  -- jay: Tyler
  ('00000004-0000-0000-0000-000000000005', 'eeeeeeee-0000-0000-0000-000000000005', '00000003-0000-0000-0000-000000000007', 20.00000000, 2.0500);


-- ============================================================
-- TRADES
-- Filled trades explain the current holdings.
-- One failed trade exercises the failed state.
-- ============================================================

INSERT INTO trades (user_id, contestant_id, season_id, type, dollar_amount, shares, price_at_execution, fee_amount, state, filled_at) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', '00000003-0000-0000-0000-000000000001', '00000002-0000-0000-0000-000000000001',
   'buy',  75.00, 40.00000000, 1.8500, 0.3800, 'filled', now() - interval '5 days'),

  ('aaaaaaaa-0000-0000-0000-000000000001', '00000003-0000-0000-0000-000000000007', '00000002-0000-0000-0000-000000000001',
   'buy',  68.00, 30.00000000, 2.2000, 0.3400, 'filled', now() - interval '4 days'),

  ('bbbbbbbb-0000-0000-0000-000000000002', '00000003-0000-0000-0000-000000000003', '00000002-0000-0000-0000-000000000001',
   'buy', 130.00, 60.00000000, 2.1000, 0.6500, 'filled', now() - interval '6 days'),

  ('bbbbbbbb-0000-0000-0000-000000000002', '00000003-0000-0000-0000-000000000009', '00000002-0000-0000-0000-000000000001',
   'buy', 110.00, 45.00000000, 2.4000, 0.5500, 'filled', now() - interval '5 days'),

  ('bbbbbbbb-0000-0000-0000-000000000002', '00000003-0000-0000-0000-000000000006', '00000002-0000-0000-0000-000000000001',
   'buy',  48.00, 25.00000000, 1.9000, 0.2400, 'filled', now() - interval '3 days'),

  ('cccccccc-0000-0000-0000-000000000003', '00000003-0000-0000-0000-000000000001', '00000002-0000-0000-0000-000000000001',
   'buy',  60.00, 35.00000000, 1.7000, 0.3000, 'filled', now() - interval '7 days'),

  ('cccccccc-0000-0000-0000-000000000003', '00000003-0000-0000-0000-000000000005', '00000002-0000-0000-0000-000000000001',
   'buy',  78.00, 55.00000000, 1.4000, 0.3900, 'filled', now() - interval '4 days'),

  -- mike partially sold Memphis (demonstrates sell path)
  ('cccccccc-0000-0000-0000-000000000003', '00000003-0000-0000-0000-000000000005', '00000002-0000-0000-0000-000000000001',
   'sell', 30.00, 20.00000000, 1.4800, 0.1500, 'filled', now() - interval '2 days'),

  ('dddddddd-0000-0000-0000-000000000004', '00000003-0000-0000-0000-000000000003', '00000002-0000-0000-0000-000000000001',
   'buy', 102.00, 50.00000000, 2.0000, 0.5100, 'filled', now() - interval '6 days'),

  ('dddddddd-0000-0000-0000-000000000004', '00000003-0000-0000-0000-000000000004', '00000002-0000-0000-0000-000000000001',
   'buy',  50.00, 38.00000000, 1.3000, 0.2500, 'filled', now() - interval '5 days'),

  ('eeeeeeee-0000-0000-0000-000000000005', '00000003-0000-0000-0000-000000000007', '00000002-0000-0000-0000-000000000001',
   'buy',  42.00, 20.00000000, 2.0500, 0.2100, 'filled', now() - interval '3 days');

-- Failed trade: jay tried to buy more Angela than his balance allowed
INSERT INTO trades (user_id, contestant_id, season_id, type, dollar_amount, shares, price_at_execution, fee_amount, state, failed_reason, filled_at) VALUES
  ('eeeeeeee-0000-0000-0000-000000000005', '00000003-0000-0000-0000-000000000001', '00000002-0000-0000-0000-000000000001',
   'buy', 5000.00, 0.00000000, 0.0000, 0.0000, 'failed', 'Insufficient cash balance', NULL);


-- ============================================================
-- SURVEYS (one in each state)
-- ============================================================

INSERT INTO surveys (id, season_id, title, week_number, status, closes_at, published_at, results_published_at) VALUES
  ('00000005-0000-0000-0000-000000000001', '00000002-0000-0000-0000-000000000001',
   'Week 4 Predictions', 4, 'draft',
   null, null, null),

  ('00000005-0000-0000-0000-000000000002', '00000002-0000-0000-0000-000000000001',
   'Week 3: Who Played Best This Week?', 3, 'active',
   now() + interval '20 hours', now() - interval '4 hours', null),

  ('00000005-0000-0000-0000-000000000003', '00000002-0000-0000-0000-000000000001',
   'Week 2: Who''s Most Likely to Win?', 2, 'closed',
   now() - interval '2 days', now() - interval '9 days', null),

  ('00000005-0000-0000-0000-000000000004', '00000002-0000-0000-0000-000000000001',
   'Week 1: First Impressions', 1, 'results_published',
   now() - interval '9 days', now() - interval '16 days', now() - interval '7 days');


-- ============================================================
-- SURVEY QUESTIONS
-- ============================================================

-- Question UUIDs are pinned explicitly so seed responses can reference them.
-- (The form keys answers by question.id; the seed mirrors that.)

-- Week 3 (active)
INSERT INTO survey_questions (id, survey_id, text, type, display_order, options, uses_contestants) VALUES
  ('00000006-0000-0000-0000-000000000301', '00000005-0000-0000-0000-000000000002',
   'Rank the houseguests from best to worst game this week.',
   'ranking', 1, null, true),

  ('00000006-0000-0000-0000-000000000302', '00000005-0000-0000-0000-000000000002',
   'Which competition did you enjoy watching most?',
   'single_choice', 2,
   '["HOH Competition", "Veto Competition", "Have-Not Competition"]', false);

-- Week 1 (results_published) — exercises all three chart types in #79.
INSERT INTO survey_questions (id, survey_id, text, type, display_order, options, uses_contestants) VALUES
  ('00000006-0000-0000-0000-000000000101', '00000005-0000-0000-0000-000000000004',
   'Who was your favourite houseguest based on first impressions?',
   'single_choice', 1, null, true),

  ('00000006-0000-0000-0000-000000000102', '00000005-0000-0000-0000-000000000004',
   'How do you feel about the cast overall?',
   'single_choice', 2,
   '["Love it", "It''s okay", "Disappointed"]', false),

  ('00000006-0000-0000-0000-000000000103', '00000005-0000-0000-0000-000000000004',
   'What stands out about this cast? (Pick all that apply)',
   'multiple_choice', 3,
   '["Strategy", "Drama", "Comp threats", "Underdogs", "Returning players"]', false),

  ('00000006-0000-0000-0000-000000000104', '00000005-0000-0000-0000-000000000004',
   'Rank your top picks to win.',
   'ranking', 4, null, true);


-- ============================================================
-- SURVEY RESPONSES
--
-- Answers are keyed by question UUID — matches what the form produces.
-- Contestant references use the FULL name from `contestants.name` so
-- aggregation lines up cleanly with form-submitted responses.
-- ============================================================

-- Week 3 active survey: two logged-in responses
INSERT INTO survey_responses (survey_id, user_id, answers, is_anonymous, submitted_at) VALUES
  ('00000005-0000-0000-0000-000000000002', 'bbbbbbbb-0000-0000-0000-000000000002',
   '{
     "00000006-0000-0000-0000-000000000301": ["Janelle Pierzina","Ian Terry","Tyler Crispen","Angela Rummans","Nicole Anthony","Memphis Garrett","Kaysar Ridha","Da''Vonne Rogers","Derek Xiao"],
     "00000006-0000-0000-0000-000000000302": "HOH Competition"
   }',
   false, now() - interval '2 hours'),

  ('00000005-0000-0000-0000-000000000002', 'cccccccc-0000-0000-0000-000000000003',
   '{
     "00000006-0000-0000-0000-000000000301": ["Angela Rummans","Tyler Crispen","Ian Terry","Janelle Pierzina","Nicole Anthony","Memphis Garrett","Derek Xiao","Kaysar Ridha","Da''Vonne Rogers"],
     "00000006-0000-0000-0000-000000000302": "Veto Competition"
   }',
   false, now() - interval '1 hour');

-- Week 1 results-published survey: six responses (five logged-in / mock + one anonymous).
-- Hand-tuned for variety so all three chart types show non-trivial aggregation.
INSERT INTO survey_responses (survey_id, user_id, answers, is_anonymous, submitted_at) VALUES
  ('00000005-0000-0000-0000-000000000004', 'bbbbbbbb-0000-0000-0000-000000000002',
   '{
     "00000006-0000-0000-0000-000000000101": "Janelle Pierzina",
     "00000006-0000-0000-0000-000000000102": "Love it",
     "00000006-0000-0000-0000-000000000103": ["Returning players","Strategy","Drama"],
     "00000006-0000-0000-0000-000000000104": ["Janelle Pierzina","Ian Terry","Angela Rummans","Tyler Crispen","Nicole Anthony"]
   }',
   false, now() - interval '16 days'),

  ('00000005-0000-0000-0000-000000000004', 'cccccccc-0000-0000-0000-000000000003',
   '{
     "00000006-0000-0000-0000-000000000101": "Angela Rummans",
     "00000006-0000-0000-0000-000000000102": "Love it",
     "00000006-0000-0000-0000-000000000103": ["Strategy","Comp threats"],
     "00000006-0000-0000-0000-000000000104": ["Angela Rummans","Tyler Crispen","Ian Terry","Janelle Pierzina","Memphis Garrett"]
   }',
   false, now() - interval '15 days'),

  ('00000005-0000-0000-0000-000000000004', 'dddddddd-0000-0000-0000-000000000004',
   '{
     "00000006-0000-0000-0000-000000000101": "Janelle Pierzina",
     "00000006-0000-0000-0000-000000000102": "It''s okay",
     "00000006-0000-0000-0000-000000000103": ["Returning players","Drama"],
     "00000006-0000-0000-0000-000000000104": ["Janelle Pierzina","Angela Rummans","Ian Terry","Tyler Crispen","Memphis Garrett"]
   }',
   false, now() - interval '15 days'),

  ('00000005-0000-0000-0000-000000000004', 'eeeeeeee-0000-0000-0000-000000000005',
   '{
     "00000006-0000-0000-0000-000000000101": "Tyler Crispen",
     "00000006-0000-0000-0000-000000000102": "Love it",
     "00000006-0000-0000-0000-000000000103": ["Underdogs","Comp threats","Drama"],
     "00000006-0000-0000-0000-000000000104": ["Tyler Crispen","Janelle Pierzina","Ian Terry","Angela Rummans","Nicole Anthony"]
   }',
   false, now() - interval '14 days'),

  ('00000005-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000001',
   '{
     "00000006-0000-0000-0000-000000000101": "Ian Terry",
     "00000006-0000-0000-0000-000000000102": "Love it",
     "00000006-0000-0000-0000-000000000103": ["Strategy","Returning players"],
     "00000006-0000-0000-0000-000000000104": ["Ian Terry","Janelle Pierzina","Angela Rummans","Memphis Garrett","Tyler Crispen"]
   }',
   false, now() - interval '13 days'),

  ('00000005-0000-0000-0000-000000000004', null,
   '{
     "00000006-0000-0000-0000-000000000101": "Ian Terry",
     "00000006-0000-0000-0000-000000000102": "Love it",
     "00000006-0000-0000-0000-000000000103": ["Strategy","Comp threats","Underdogs"],
     "00000006-0000-0000-0000-000000000104": ["Ian Terry","Tyler Crispen","Angela Rummans","Janelle Pierzina","Kaysar Ridha"]
   }',
   true, now() - interval '14 days');


-- ============================================================
-- LIVESTREAM REVEAL FIXTURES (#65)
--
-- Frozen fan-aggregate ranking snapshots per survey, feeding the
-- broadcast trajectory chart, plus the producer's live reveal pointer.
-- This is the "now" path behind lib/reveal/source.ts; it flips to real
-- close-time aggregation later with no consumer changes.
--
--   Weeks 1 & 2 (results_published / closed) — fully revealed.
--   Week 3 (active) — the LIVE week, mid-reveal (4 of 9 shown).
--   Enzo (…0010) is absent from week 3 — evicted — so his chart line
--   ends at week 2 (presence-based eviction).
--
-- score = Borda points (N − position); higher = better (Y-axis magnitude).
-- ============================================================

INSERT INTO survey_aggregate_rankings (survey_id, contestant_id, rank, score) VALUES
  -- Week 1 — survey …0004 (results_published), N = 10
  ('00000005-0000-0000-0000-000000000004', '00000003-0000-0000-0000-000000000003',  1, 10),  -- Janelle
  ('00000005-0000-0000-0000-000000000004', '00000003-0000-0000-0000-000000000001',  2,  9),  -- Angela
  ('00000005-0000-0000-0000-000000000004', '00000003-0000-0000-0000-000000000009',  3,  8),  -- Ian
  ('00000005-0000-0000-0000-000000000004', '00000003-0000-0000-0000-000000000007',  4,  7),  -- Tyler
  ('00000005-0000-0000-0000-000000000004', '00000003-0000-0000-0000-000000000006',  5,  6),  -- Nicole
  ('00000005-0000-0000-0000-000000000004', '00000003-0000-0000-0000-000000000005',  6,  5),  -- Memphis
  ('00000005-0000-0000-0000-000000000004', '00000003-0000-0000-0000-000000000004',  7,  4),  -- Kaysar
  ('00000005-0000-0000-0000-000000000004', '00000003-0000-0000-0000-000000000002',  8,  3),  -- Derek
  ('00000005-0000-0000-0000-000000000004', '00000003-0000-0000-0000-000000000008',  9,  2),  -- Da'Vonne
  ('00000005-0000-0000-0000-000000000004', '00000003-0000-0000-0000-000000000010', 10,  1),  -- Enzo

  -- Week 2 — survey …0003 (closed), N = 10
  ('00000005-0000-0000-0000-000000000003', '00000003-0000-0000-0000-000000000001',  1, 10),  -- Angela ▲
  ('00000005-0000-0000-0000-000000000003', '00000003-0000-0000-0000-000000000003',  2,  9),  -- Janelle ▼
  ('00000005-0000-0000-0000-000000000003', '00000003-0000-0000-0000-000000000007',  3,  8),  -- Tyler ▲
  ('00000005-0000-0000-0000-000000000003', '00000003-0000-0000-0000-000000000009',  4,  7),  -- Ian ▼
  ('00000005-0000-0000-0000-000000000003', '00000003-0000-0000-0000-000000000005',  5,  6),  -- Memphis ▲
  ('00000005-0000-0000-0000-000000000003', '00000003-0000-0000-0000-000000000006',  6,  5),  -- Nicole ▼
  ('00000005-0000-0000-0000-000000000003', '00000003-0000-0000-0000-000000000008',  7,  4),  -- Da'Vonne ▲
  ('00000005-0000-0000-0000-000000000003', '00000003-0000-0000-0000-000000000004',  8,  3),  -- Kaysar ▼
  ('00000005-0000-0000-0000-000000000003', '00000003-0000-0000-0000-000000000002',  9,  2),  -- Derek ▼
  ('00000005-0000-0000-0000-000000000003', '00000003-0000-0000-0000-000000000010', 10,  1),  -- Enzo

  -- Week 3 — survey …0002 (active, LIVE), N = 9 (Enzo evicted, absent)
  ('00000005-0000-0000-0000-000000000002', '00000003-0000-0000-0000-000000000003',  1,  9),  -- Janelle ▲
  ('00000005-0000-0000-0000-000000000002', '00000003-0000-0000-0000-000000000001',  2,  8),  -- Angela ▼
  ('00000005-0000-0000-0000-000000000002', '00000003-0000-0000-0000-000000000009',  3,  7),  -- Ian ▲
  ('00000005-0000-0000-0000-000000000002', '00000003-0000-0000-0000-000000000007',  4,  6),  -- Tyler ▼
  ('00000005-0000-0000-0000-000000000002', '00000003-0000-0000-0000-000000000006',  5,  5),  -- Nicole ▲
  ('00000005-0000-0000-0000-000000000002', '00000003-0000-0000-0000-000000000004',  6,  4),  -- Kaysar ▲
  ('00000005-0000-0000-0000-000000000002', '00000003-0000-0000-0000-000000000005',  7,  3),  -- Memphis ▼
  ('00000005-0000-0000-0000-000000000002', '00000003-0000-0000-0000-000000000002',  8,  2),  -- Derek ▲
  ('00000005-0000-0000-0000-000000000002', '00000003-0000-0000-0000-000000000008',  9,  1);  -- Da'Vonne ▼

-- Producer reveal pointer: live on week 3, 4 of 9 entries revealed.
INSERT INTO survey_reveal_state (season_id, selected_survey_id, reveal_count) VALUES
  ('00000002-0000-0000-0000-000000000001', '00000005-0000-0000-0000-000000000002', 4);
