# Running the app locally

*The runbook. For the philosophy of environments + migration workflow, see [dev-environment.md](dev-environment.md). For how migrations ship to prod, see [migrations.md](migrations.md).*

---

## TL;DR — the daily loop is two commands

```bash
supabase start    # once when you sit down (or after a Docker restart)
pnpm dev          # your work loop
```

Open **http://localhost:3000**.

---

## The mental model

**Supabase = Postgres + Auth + Storage + Realtime, running in Docker.** When you run `supabase start`, the CLI **automatically applies every migration in `supabase/migrations/`** AND **runs `supabase/seed.sql`**. There is no separate "run migrations" step — it's wrapped into start.

**Next.js = your app, on `:3000`.** `pnpm dev` runs it against the local Supabase stack. `.env.local` is committed and already points at `127.0.0.1:54321`, so no env setup is needed.

---

## Cold start (after a reboot or fresh clone)

1. Make sure **Docker Desktop is running** (`docker ps` should not error).
2. `supabase start` — first run pulls images, ~2 minutes. Subsequent starts: ~10s.
3. `pnpm dev` (separate terminal).
4. Visit `http://localhost:3000`.
5. Sign in. Seed accounts (all password `testtest`):

   | Email | Role |
   |---|---|
   | `admin@rsw.test` | Admin (sees `/admin`) |
   | `sarah@rsw.test` | Regular user with trades + survey responses |
   | `mike@rsw.test`, `tara@rsw.test`, `jay@rsw.test` | Regular users |

The seed creates BB27 with 10 contestants, 4 surveys (one in each state), portfolios, and trades.

---

## When you change a migration

1. Add a new file at the next number:
   ```
   supabase/migrations/0008_my_change.sql
   ```
2. Re-seed local DB:
   ```bash
   supabase db reset
   ```
   ~10s — drops + recreates the local DB, re-applies all migrations, re-runs seed.

The dev server picks up the new schema automatically; no restart needed.

**You don't push migrations to prod manually.** CI applies them via `supabase db push` when a PR merges to `main`. See [migrations.md](migrations.md).

---

## When local DB gets weird

```bash
supabase db reset
```

Always safe. Wipes local DB, re-applies migrations, re-runs seed. Nothing in local is permanent or sacred.

---

## URLs while running

| | URL |
|---|---|
| App | http://localhost:3000 |
| **Supabase Studio** (DB UI — run queries, browse tables) | **http://localhost:54323** |
| API endpoint your app talks to | http://localhost:54321 |

Studio is the underrated one — open it when something looks weird in the app and you want to see the actual rows. Faster than clicking through `/admin` for raw inspection.

---

## Cheatsheet

```bash
# Stack
supabase start           # boot the local stack
supabase stop            # shut down (frees Docker resources)
supabase status          # show URLs + diagnose if anything's off

# DB
supabase db reset        # nuke + reseed local
supabase db query --local "select count(*) from contestants;"   # ad-hoc SQL

# App
pnpm dev                 # Next.js on :3000
pnpm typecheck           # tsc --noEmit
pnpm test                # vitest run
pnpm build               # production build — useful sanity check before pushing
```

---

## Testing admin features fast

Flipping survey or season statuses through the admin UI takes clicks. For testing, open Studio (`:54323`) and run SQL directly:

```sql
-- Make week 3 the results-published survey
update surveys set status = 'results_published' where id = '00000005-0000-0000-0000-000000000002';

-- Reset BB27 back to seed defaults
supabase db reset    -- (in your terminal)
```

Same goes for testing `publish_season_results()`, contestant flag toggles, etc. — direct SQL is faster than the UI when you're iterating on app behavior.

---

## When Supabase won't start

If `supabase start` errors with something like *"failed to inspect container health"* or you see a Docker Desktop "lingering processes detected" dialog, the most reliable recovery is:

```bash
pkill -9 -f "Docker Desktop"
pkill -9 -f "com.docker.backend"
sleep 2
open -a Docker
# wait for the whale icon to settle, then:
supabase start
```

If that still fails, `supabase stop --no-backup` and try again. Your local data lives in a Docker volume — `supabase stop` keeps it, `supabase stop --no-backup` wipes it. Both are fine for dev; the seed will recreate everything.

---

## What's NOT in local

- **Push notifications** — there are no real subscribers locally, so VAPID broadcasts go nowhere. That's expected. Test the surface via the admin button; verify the subscribe API responds. End-to-end push only works in staging/prod with a real browser subscription.
- **OAuth (Google/Apple)** — the buttons exist but the local Supabase doesn't have provider credentials configured. Use email/password with a seed account.
- **CI / `db push`** — only runs against prod, on merge to `main`. Local is just `supabase start`.
