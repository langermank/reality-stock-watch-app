# /setup

Walk through setting up this project on a new machine, step by step. Check what's already installed before giving instructions.

## Steps

Run the following checks in parallel, then report what's missing vs already good:

```bash
docker info > /dev/null 2>&1 && echo "docker:ok" || echo "docker:missing"
which supabase && supabase --version || echo "supabase:missing"
which pnpm && pnpm --version || echo "pnpm:missing"
node --version || echo "node:missing"
```

Then guide through any missing prerequisites:

- **Docker Desktop not running or not installed:** direct to https://docs.docker.com/desktop/mac/install/ — must be running before `supabase start` will work
- **Supabase CLI missing:** `brew install supabase/tap/supabase`
- **pnpm missing:** `npm install -g pnpm`
- **Node missing:** direct to https://nodejs.org (LTS)

Once prerequisites are confirmed, run through setup in order:

```bash
pnpm install
supabase start      # first run pulls Docker images — takes a few minutes
supabase db reset   # applies migrations + seed
pnpm dev            # app runs at http://localhost:3000
```

Check each step succeeds before moving to the next.

## Useful local URLs once running

| URL | What it is |
|-----|------------|
| http://localhost:3000 | App |
| http://localhost:54323 | Supabase Studio (DB browser, auth, etc.) |
| http://localhost:54321 | Supabase API |
| http://localhost:54324 | Supabase email testing (Inbucket) |

## Notes

- `.env.local` is committed — no manual env setup needed for local dev
- OAuth (Google/Apple) won't work locally — use email/password for local testing
- Supabase Studio at port 54323 lets you manually insert test data if needed
- If `supabase start` fails: make sure Docker Desktop is fully started (not just launching)
- If `supabase db reset` fails: check `supabase/migrations/` — migration SQL error will be in the output
- VAPID keys (push notifications) are blank in `.env.local` — not needed until Phase 2. Generate with `npx web-push generate-vapid-keys` when ready.
