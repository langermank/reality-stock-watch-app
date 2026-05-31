# Reality Stock Watch

24/7 virtual stock market game for Big Brother US fans. Users buy/sell fractional shares in BB contestants using fake currency. Prices move in real time via a bonding curve driven by supply and demand.

**Target audience:** Hardcore BB fans, RHAP podcast community.

---

## Current status

**Phases 1–3 complete, plus the full livestream reveal feature.** Next up: Phase 4 admin (season setup / contestant management / survey builder).

| Phase | Status | GitHub issues |
|-------|--------|---------------|
| Phase 1: Foundation | ✅ Done | #29 #30 #31 #32 |
| Phase 2: Backend | ✅ Done | #33 #34 #35 #36 |
| Phase 3: Feature UI | ✅ Done | #37 #38 #39 #40 #41 |
| Livestream Reveal | ✅ Done | #61 #62 #63 #64 #65 #66 |
| Phase 4: Admin | 🔜 Next | #42 #43 #44 |

**Backend (Phase 2):**
- `supabase/migrations/0002_place_trade.sql` — atomic trade RPC (binary search bonding curve, FOR UPDATE locking, pending→filled/failed state)
- `lib/pricing.ts` — pure TS bonding curve math (derivePrice, buyCost, sharesForDollars, sellProceeds)
- `hooks/useContestantPrices.ts` — Supabase Realtime subscription, derives prices client-side
- `supabase/migrations/0003_leaderboard_cron.sql` — pg_cron net_worth refresh every 60s
- `lib/push.ts` + `lib/supabase/service.ts` — Web Push VAPID infrastructure
- `app/api/push/{subscribe,send}/route.ts` — POST/DELETE subscriptions; internal send endpoint

**Feature UI (Phase 3):**
- Market, Portfolio, Contestant detail, Leaderboard, Survey — all live under `app/(app)/`
- Survey page (#41): 5-state route + 3 question types + anonymous public link at `/survey/[id]/public` + push-permission prompt. See `docs/design/interaction-flow-survey.md`.

**Livestream Reveal:**
- Admin gate (`app/admin/layout.tsx` via `lib/admin.ts`) + reveal schema (`supabase/migrations/0006_livestream_reveal.sql`)
- Frozen reveal math + Borda aggregation + data seam (`components/reveal/rankings.ts`, `lib/reveal/aggregate.ts`, `lib/reveal/source.ts`)
- Broadcast view (`app/admin/stream`, OBS-captured) + Producer console (`app/admin/reveal`) + shared `hooks/useRevealState.ts` (Realtime, RLS-aware)
- See `docs/livestream-reveal-plan.md`.

**Ops:**
- DB migrations apply via CI on merge to `main` (`.github/workflows/db-push.yml`). See `docs/migrations.md`.

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
| `docs/migrations.md` | How schema changes ship (CLI `db push` only) + drift-recovery runbook — read before applying any migration |

---

## Design research (Mobbin)

Before implementing any UI, search Mobbin for patterns. Prioritize these apps (in order):

1. Base
2. Wise
3. Cash App
4. Origin
5. Coinbase
6. Coinbase Wallet
7. Monarch
8. Kraken

Search with screen-level terms (e.g. "trade confirmation", "asset list", "portfolio overview") not generic terms.

---

## PR conventions

- Always include `Closes #<issue-number>` (with full link if possible) in the PR body so GitHub auto-closes the issue on merge
- Example: `Closes https://github.com/langermank/reality-stock-watch-app/issues/33`

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
- Schema changes ship via Supabase CLI `db push` only (git is the source of truth). The Supabase MCP tools are read-only for us — `execute_sql`/`list_migrations` to inspect, never `apply_migration` to ship. See `docs/migrations.md`.

---

## PWA + push notifications

- App must be installable as PWA (Web App Manifest + service worker)
- Push notifications via Web Push API + VAPID (no paid service)
- Subscriptions stored in Supabase per user
- 3 notification triggers: survey live, survey closing in 1 hour, results published
