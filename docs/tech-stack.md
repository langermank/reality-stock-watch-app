# Tech Stack

*Decisions and rationale. Update this doc when stack decisions change.*

---

## Core

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Next.js 14+ (App Router) | SSR for homepage, API routes for trade processing, PWA support |
| Language | TypeScript | Required — codebase complexity demands it |
| Package manager | pnpm | Per global config |
| Database | Postgres via Supabase | Schema-based, row-level security, handles relational model well |
| Auth | Supabase Auth | Google OAuth + Apple OAuth + email/password. Email verification on for email signups. |
| Realtime | Supabase Realtime | Price tick broadcast to all connected clients via WebSocket |
| Hosting | Netlify | Existing setup. Next.js via @netlify/next |
| Styling | Tailwind CSS | Utility-first, fast iteration |
| Components | Base UI (base-ui.com) | Headless, accessible, unstyled — pairs with Tailwind. From MUI team. |

---

## Push Notifications

**Free implementation — no third-party service.**

Stack:
- VAPID keys (generated once, stored as env vars)
- Web Push API (browser native)
- Service worker (registered via next-pwa or serwist)
- Supabase: stores push subscriptions per user
- Netlify function: server-side trigger that sends push via Web Push protocol

Triggers (3):
1. Survey goes live
2. Survey closing in 1 hour
3. Survey results published

To be built together — complexity is in initial setup, not ongoing.

---

## Graph / Survey Visualization

- Existing project: React + Vite
- Migration path: React components are framework-agnostic — drop into Next.js directly
- No blocker. Migrate components when integrating, no full rewrite needed.

---

## Key architectural constraints

- **Price is never stored** — always derived from `total_shares_outstanding`
- **Trades are atomic** — debit cash + update supply + record trade in one DB transaction
- **Pricing constants lock at Active state** — `K` and `base_price` become read-only in DB and UI when season opens trading. Enforced at API level, not just UI.
- **Trade states exist from day one** — `pending | filled | failed` column on every trade record. `pending` unused in beta but schema must support it for future queue upgrade.
- **Total shares outstanding is per-contestant** — price sensitivity uses total across all contestants (sum), not per-contestant count alone. See `docs/pricing-formula.md`.
- **Real-time price tick** — 2–3s interval server-side process, configurable. Clients subscribe, never poll.

---

## What we're not using (and why)

| Rejected | Reason |
|----------|--------|
| Redis | Cost. Postgres optimistic locking sufficient for beta scale. Add later if needed. |
| OneSignal / push service | Cost. Web Push API is free and sufficient. |
| Native mobile app | Out of scope v1. PWA covers mobile. |
| Separate admin app | Unified `/admin` route within main app — shared contestant data model. |
