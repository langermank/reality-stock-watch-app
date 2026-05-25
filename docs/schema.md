# Database Schema Spec

*Postgres via Supabase. Spec to review before writing any migrations.*

---

## Approach notes

- All tables use `uuid` primary keys (Supabase default)
- `auth.users` (Supabase managed) handles authentication. A `profiles` table mirrors it for app-specific user data, created automatically via a DB trigger on signup.
- `total_shares_outstanding` on `contestants` is the hot row — updated atomically with every trade. Never update it outside of a trade transaction.
- `net_worth` on `portfolios` is a **cached derived value** — refreshed by Supabase pg_cron every 60 seconds (not after every trade). ~60s leaderboard staleness is acceptable for a game. User's own portfolio view computes net_worth fresh on read.
- All financial writes go through a Postgres **security-definer RPC** (`place_trade`). Users have `SELECT` only on `portfolios`, `holdings`, and `contestants` via RLS — no direct `INSERT/UPDATE` on financial tables from the client.
- All timestamps are `timestamptz` (timezone-aware).
- RLS (Row Level Security) enabled on all tables from day one.
- Enums defined as Postgres enums for type safety.

---

## Enums

```
season_status:     setup | pre_season | active | ended | results_published
contestant_status: active | evicted | winner | runner_up
trade_type:        buy | sell
trade_state:       pending | filled | failed
badge_type:        top_3 | top_10
survey_status:     draft | active | closed | results_published
question_type:     ranking | multiple_choice | single_choice
```

---

## Tables

### profiles
*App-specific user data. Created automatically when a user signs up via Supabase auth trigger.*

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, FK → auth.users(id) ON DELETE CASCADE | Matches Supabase auth user id |
| username | text | NOT NULL, UNIQUE | Auto-generated at signup. Permanent — never updated. |
| avatar_url | text | nullable | |
| is_admin | boolean | NOT NULL, DEFAULT false | Simple flag — no role hierarchy in v1 |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |

**Indexes:** username (unique)
**RLS:** Any authenticated user can read any profile (needed for leaderboard/search). User can only update their own non-admin fields. `is_admin` not user-editable.

---

### seasons

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| name | text | NOT NULL | e.g. "BB27" |
| status | season_status | NOT NULL, DEFAULT 'setup' | |
| start_date | date | nullable | |
| end_date | date | nullable | |
| starting_balance | numeric(12,2) | NOT NULL | Locks when status → active |
| k_constant | numeric(18,8) | NOT NULL | Pricing constant K. Locks when status → active |
| base_price | numeric(12,4) | NOT NULL | Floor price per share. Locks when status → active |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |

**Indexes:** status (for finding active season)
**RLS:** Public read. Admin write only.
**Note:** `starting_balance`, `k_constant`, `base_price` must be enforced as read-only at API level once status = active. DB constraint or trigger recommended.

---

### contestants

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| season_id | uuid | NOT NULL, FK → seasons(id) ON DELETE CASCADE | |
| name | text | NOT NULL | |
| photo_url | text | nullable | |
| bio | text | nullable | |
| status | contestant_status | NOT NULL, DEFAULT 'active' | |
| is_hoh | boolean | NOT NULL, DEFAULT false | Visual flag — no game impact |
| is_nominated | boolean | NOT NULL, DEFAULT false | Visual flag — no game impact |
| has_veto | boolean | NOT NULL, DEFAULT false | Visual flag — no game impact |
| total_shares_outstanding | numeric(18,8) | NOT NULL, DEFAULT 0 | ⚠️ HOT ROW — only update inside a trade transaction, never outside |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |

**Indexes:** season_id, status
**RLS:** Public read. Admin write only.

---

### portfolios
*One per user per season. Created when user first accesses a season.*

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| user_id | uuid | NOT NULL, FK → profiles(id) ON DELETE CASCADE | |
| season_id | uuid | NOT NULL, FK → seasons(id) ON DELETE CASCADE | |
| cash_balance | numeric(12,2) | NOT NULL | Starts at season.starting_balance |
| net_worth | numeric(12,2) | NOT NULL | Cached: cash + sum of all holding liquidation values. Updated after every trade. |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |

**Constraints:** UNIQUE(user_id, season_id)
**Indexes:** user_id, season_id, net_worth DESC (for leaderboard sort)
**RLS:** User can `SELECT` their own portfolio. No direct `INSERT/UPDATE` — all writes via `place_trade` RPC (security-definer).

---

### holdings
*A user's current position in one contestant. Upserted on every trade.*

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| portfolio_id | uuid | NOT NULL, FK → portfolios(id) ON DELETE CASCADE | |
| user_id | uuid | NOT NULL, FK → profiles(id) | Denormalized for query convenience |
| contestant_id | uuid | NOT NULL, FK → contestants(id) | |
| shares_held | numeric(18,8) | NOT NULL, DEFAULT 0 | Fractional. If reaches 0, row can be soft-kept or deleted. |
| average_purchase_price | numeric(12,4) | NOT NULL | Weighted average across all buys |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |

**Constraints:** UNIQUE(portfolio_id, contestant_id)
**Indexes:** portfolio_id, contestant_id, user_id
**RLS:** User can `SELECT` their own holdings. No direct `INSERT/UPDATE` — all writes via `place_trade` RPC.
**Note:** `average_purchase_price` recalculates on each buy: `(old_shares * old_avg + new_shares * new_price) / total_shares`. Sells do not affect average purchase price.

---

### trades

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| user_id | uuid | NOT NULL, FK → profiles(id) | |
| contestant_id | uuid | NOT NULL, FK → contestants(id) | |
| season_id | uuid | NOT NULL, FK → seasons(id) | Denormalized for query convenience |
| type | trade_type | NOT NULL | buy or sell |
| dollar_amount | numeric(12,2) | NOT NULL | What the user requested to spend/receive |
| shares | numeric(18,8) | NOT NULL | Fractional shares executed |
| price_at_execution | numeric(12,4) | NOT NULL | Actual price per share at time of execution |
| fee_amount | numeric(12,4) | NOT NULL, DEFAULT 0 | Transaction fee (% of dollar_amount). TBD %. |
| state | trade_state | NOT NULL, DEFAULT 'pending' | pending→filled or pending→failed |
| failed_reason | text | nullable | Populated if state = failed |
| created_at | timestamptz | NOT NULL, DEFAULT now() | When trade was placed |
| filled_at | timestamptz | nullable | When trade was processed |

**Indexes:** user_id + created_at DESC (trade history), contestant_id (per-contestant activity), state, season_id
**RLS:** User can read their own trades. Admin can read all.
**Note:** In beta, trades move from pending → filled/failed near-instantly. `pending` state reserved for future queue upgrade — schema must not change when queue is added.

---

### season_results
*Snapshot created when a season moves to results_published.*

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| user_id | uuid | NOT NULL, FK → profiles(id) | |
| season_id | uuid | NOT NULL, FK → seasons(id) | |
| final_rank | integer | NOT NULL | |
| final_net_worth | numeric(12,2) | NOT NULL | Snapshot — does not change after creation |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |

**Constraints:** UNIQUE(user_id, season_id)
**Indexes:** season_id + final_rank (for all-time leaderboard queries)
**RLS:** Public read. System write only (created by admin action, not user).
**Note:** All-time leaderboard scoring method TBD — final_rank is stored so any aggregation method can be computed later.

---

### badges

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| user_id | uuid | NOT NULL, FK → profiles(id) | |
| season_id | uuid | NOT NULL, FK → seasons(id) | |
| type | badge_type | NOT NULL | top_3 or top_10 |
| awarded_at | timestamptz | NOT NULL, DEFAULT now() | |

**Constraints:** UNIQUE(user_id, season_id, type)
**Indexes:** user_id (for profile display)
**RLS:** Public read. System write only.

---

### surveys

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| season_id | uuid | NOT NULL, FK → seasons(id) | |
| title | text | NOT NULL | |
| week_number | integer | NOT NULL | |
| status | survey_status | NOT NULL, DEFAULT 'draft' | |
| closes_at | timestamptz | nullable | For auto-close and 1-hour reminder push notification |
| published_at | timestamptz | nullable | When survey went active |
| results_published_at | timestamptz | nullable | When results were made visible |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |

**Indexes:** season_id + status (for finding active survey)
**RLS:** Authenticated users can read active/results_published surveys. Admin full access.

---

### survey_questions

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| survey_id | uuid | NOT NULL, FK → surveys(id) ON DELETE CASCADE | |
| text | text | NOT NULL | Question prompt |
| type | question_type | NOT NULL | ranking, multiple_choice, single_choice |
| display_order | integer | NOT NULL | Admin-controlled sort order |
| options | jsonb | nullable | MC/SC: array of option strings. Ranking with custom items: array of strings. Null if ranking uses season contestants. |
| uses_contestants | boolean | NOT NULL, DEFAULT false | If true, ranking options are pulled from the season's active contestants at submission time |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |

**Indexes:** survey_id + display_order
**RLS:** Same as surveys.

---

### survey_responses
*One row per person per survey. Answers stored as JSONB.*

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| survey_id | uuid | NOT NULL, FK → surveys(id) | |
| user_id | uuid | nullable, FK → profiles(id) | Null if anonymous |
| answers | jsonb | NOT NULL | { "[question_id]": answer_value } |
| is_anonymous | boolean | NOT NULL, DEFAULT false | |
| submitted_at | timestamptz | NOT NULL, DEFAULT now() | |

**Constraints:** UNIQUE(survey_id, user_id) WHERE user_id IS NOT NULL — one logged-in response per survey
**Indexes:** survey_id, user_id
**RLS:** User can insert and read their own response. Admin can read all. Anonymous responses: insert-only via service role key on public endpoint.
**Note:** Anonymous submissions are never retroactively linked to a user account, even if they sign up after submitting.

---

### push_subscriptions
*Stores Web Push API subscriptions per user for PWA push notifications.*

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| user_id | uuid | NOT NULL, FK → profiles(id) ON DELETE CASCADE | |
| endpoint | text | NOT NULL, UNIQUE | Web Push endpoint URL |
| p256dh | text | NOT NULL | Client public key |
| auth_key | text | NOT NULL | Auth secret (`auth` is a reserved word) |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |

**Indexes:** user_id
**RLS:** User can only read/write their own subscriptions.

---

## Key relationships summary

```
auth.users ──── profiles ──┬── portfolios ──── holdings ──── contestants ──── seasons
                           ├── trades                    └── (total_shares_outstanding)
                           ├── badges
                           ├── season_results
                           ├── survey_responses
                           └── push_subscriptions

seasons ──┬── contestants
          ├── surveys ──── survey_questions
          │            └── survey_responses
          └── season_results
```

---

## Open questions

- [ ] **Holdings at zero shares** — when a user sells their entire position, should the holding row be deleted or kept with `shares_held = 0`? Keeping it preserves history but adds noise. Deleting is cleaner. Recommend delete and rely on trades table for history.
- [ ] **Transaction fee %** — `fee_amount` column exists, value TBD. Fee is deducted from dollar_amount before shares are calculated on buy; deducted from proceeds on sell.
- [ ] **Net worth update trigger** — `portfolios.net_worth` must be recalculated after every trade. Options: (a) application-level update in trade transaction, (b) Postgres trigger. Application-level recommended for control and testability.
- [ ] **Leaderboard query** — `portfolios` sorted by `net_worth DESC` with `JOIN profiles` for username and `LEFT JOIN badges` for badge display. Write this query early and test against realistic data volume.
- [ ] **Season constraint: one active season** — should the DB enforce that only one season can have status = active at a time? Recommend a partial unique index: `UNIQUE(status) WHERE status = 'active'`.
- [ ] **Survey constraint: one active survey per season** — similar. Partial unique index: `UNIQUE(season_id, status) WHERE status = 'active'`.
