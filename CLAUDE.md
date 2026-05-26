# Reality Stock Watch

24/7 virtual stock market game for Big Brother US fans. Users buy/sell fractional shares in BB contestants using fake currency. Prices move in real time via a bonding curve driven by supply and demand.

**Target audience:** Hardcore BB fans, RHAP podcast community.

---

## Current status

**Phase 1 complete.** Next up: Phase 2 backend.

| Phase | Status | GitHub issues |
|-------|--------|---------------|
| Phase 1: Foundation | ✅ Done | #29 #30 #31 #32 |
| Phase 2: Backend | 🔜 Next | #33 #34 #35 #36 |
| Phase 3: Feature UI | Not started | #37 #38 #39 #40 #41 |
| Phase 4: Admin | Not started | #42 #43 #44 |

**Phase 1 what's built:**
- Next.js 16 + TypeScript + Tailwind + pnpm scaffolded
- Supabase SSR client (browser + server), auth middleware
- Auth: Google OAuth, Apple OAuth, email/password — login page + `/auth/callback`
- Route groups: `(auth)` for login, `(app)` for authenticated pages with bottom nav
- Stub pages for Market, Portfolio, Survey, Leaderboard
- Logged-out homepage
- `supabase/migrations/0001_initial_schema.sql` — full schema, enums, RLS, indexes, triggers
- PWA manifest, serwist + Base UI + web-push installed
- `.env.local` committed (local Supabase deterministic keys — works on any machine)

**Phase 2 what to build next:**
- `place_trade` Postgres security-definer RPC (issue #33) — the core trade transaction
- Price derivation utilities + Supabase Realtime subscription (issue #34)
- Leaderboard net_worth pg_cron refresh (issue #35)
- Push notification infrastructure (issue #36)

**To start a session:** read this file, check the open GitHub issues for the current phase, read the relevant `docs/` files before touching any feature area.

---

## Stack

- **Next.js 14+ (App Router)** + TypeScript
- **Supabase** — Postgres, Auth, Realtime
- **Netlify** — hosting + serverless functions
- **Tailwind CSS** + **Base UI** (headless components)
- **pnpm**

See `docs/tech-stack.md` for full decisions and rationale.

---

## Key docs

| Doc | What's in it |
|-----|-------------|
| `docs/PRD.md` | Product requirements |
| `docs/pricing-formula.md` | Bonding curve formula — read before touching any trade or pricing logic |
| `docs/tech-stack.md` | Stack decisions and constraints |
| `docs/design/conceptual-model.md` | All objects, relationships, states, vocabulary |
| `docs/design/interaction-flow-*.md` | Breadboarded user flows |
| `docs/dev-environment.md` | Environment setup, migration workflow, fake season |

---

## Commands

```bash
pnpm dev          # local dev server
pnpm build        # production build
pnpm lint         # lint
pnpm typecheck    # type check
```

---

## Hard rules

**Pricing**
- Never store price — always derive from `total_shares_outstanding`
- Pricing constants (`K`, `base_price`, `starting_balance`) lock permanently when a season goes Active — enforce at API level, not just UI
- See `docs/pricing-formula.md` before changing any formula logic

**Trades**
- All trades must be atomic: debit cash + update `total_shares_outstanding` + record trade in one DB transaction
- Trade records always have a `state` column (`pending | filled | failed`) — `pending` unused in beta but must exist in schema
- Execution is always at-market — never at the previewed price

**Realtime**
- Supabase Realtime broadcasts `contestants` row changes when `total_shares_outstanding` updates on trade fill
- Clients derive price locally from the formula — never poll the DB
- No server-side ticker — Netlify serverless cannot run an always-on loop

**Admin**
- `/admin` is a protected route — gated by `is_admin` flag on User
- Pricing constants display as read-only with label "Locked when trading opened" once season is Active
- Season state transitions are irreversible — always require confirmation

**Vocabulary**
- Use the ubiquitous language from `docs/design/conceptual-model.md`
- In UI copy: User, Contestant, Trade, Holding, Portfolio, Cash, Season Result, Badge
- Never use "P&L" — use plain language (e.g. "up $247 since season start")
- Never use "Stock" as an object name — Contestant is the tradeable entity

---

## Database notes

- `total_shares_outstanding` per contestant is the single source of truth for pricing — update atomically with every trade
- Trade queue not implemented in beta — optimistic locking only. Schema must not change when queue is added later.
- Supabase row-level security should be enabled from day one

---

## PWA + push notifications

- App must be installable as PWA (Web App Manifest + service worker)
- Push notifications via Web Push API + VAPID (no paid service)
- Subscriptions stored in Supabase per user
- 3 notification triggers: survey live, survey closing in 1 hour, results published
