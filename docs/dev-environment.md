# Development Environment & Iteration Plan

*How we build, test, and iterate before and after beta launch.*

---

## Environments

| Environment | Supabase | Netlify | Who uses it |
|-------------|----------|---------|-------------|
| Local | Supabase CLI (Docker, runs on your machine) | `pnpm dev` | You, while building |
| Staging | Separate Supabase project | Netlify preview URLs (auto-deploy per PR) | You + Taran reviewing PRs |
| Production | Supabase production project | `main` branch deploy | Beta users |

Supabase free tier allows 2 active projects — staging and production is exactly 2.

---

## Keeping the DB clean

**Rule: all schema changes are migration files in the repo. Never edit schema directly in the Supabase dashboard on staging or production.**

All schema changes go through the Supabase CLI migration workflow:

```
supabase/
  migrations/
    0001_initial_schema.sql
    0002_add_index_xyz.sql
    ...
  seed.sql
```

Migrations run in order: local → staging → production, applied with `supabase db push` (the CLI is the source of truth — the Supabase MCP tools are read-only for us, never `apply_migration`). The Supabase dashboard is read-only for schema on staging and prod. This prevents drift between environments.

See **`docs/migrations.md`** for the full apply workflow, project refs, and the runbook for reconciling drifted migration history.

---

## Fake season (seed script)

`supabase/seed.sql` contains a test BB season that runs on local and staging only — never production.

Seed includes:
- A fake BB season in `active` state with realistic pricing constants
- ~10 fake contestants at varied `total_shares_outstanding` levels (to test pricing curve behavior across different supply levels)
- A handful of test user accounts with portfolios and starting balances
- Pre-seeded trades so the leaderboard has data to display
- At least one survey in each state (draft, active, closed, results_published)

A reset mechanism (wipe + re-seed) is available for when staging gets messy. Admin-only, staging-only.

---

## Iteration workflow

```
local dev
  → push branch
    → PR opens
      → Netlify preview deploys automatically (staging Supabase env vars)
        → Taran reviews on preview URL (no local setup needed)
          → merge to main
            → production deploys
```

Taran never needs to run anything locally. Every PR generates a live URL he can click through to review features before they go to beta users.

---

## What to set up before writing application code

In order:

1. **Supabase CLI** — install and init local Supabase in the repo (`supabase init`)
2. **Initial migration** — write `0001_initial_schema.sql` from `docs/schema.md`
3. **Seed script** — write `supabase/seed.sql` with fake season, contestants, users, trades
4. **Supabase projects** — create two projects: `rsw-staging` and `rsw-production`
5. **Netlify env vars** — wire staging Supabase URL/keys to preview deploys, prod keys to main
6. **Verify migration runs** — confirm `supabase db reset` applies migrations + seed cleanly on local

---

## Environment variables

Each environment needs its own set. Never share keys between staging and production.

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY     ← server-only, never exposed to client
VAPID_PUBLIC_KEY              ← push notifications
VAPID_PRIVATE_KEY             ← server-only
```

Staging values go in Netlify's environment variables scoped to preview deploys.
Production values go in Netlify's environment variables scoped to the production branch.
Local values go in `.env.local` (gitignored).

---

## What never goes in production

- Seed data or test users
- The reset/wipe endpoint
- Any `console.log` of sensitive values
- Direct schema edits via Supabase dashboard
