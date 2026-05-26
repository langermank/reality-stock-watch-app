# Reality Stock Watch

24/7 virtual stock market game for Big Brother US fans. Users buy/sell fractional shares in BB contestants using fake currency. Prices move in real time via a bonding curve driven by supply and demand.

**Target audience:** Hardcore BB fans, RHAP podcast community.

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

---

## Commands

```bash
pnpm dev          # local dev server
pnpm build        # production build
pnpm lint         # lint
pnpm typecheck    # type check
```

---

## Agent workflow

**UI work**
- Before implementing UI work involving a component, page, screen, overlay, modal, nav, layout, frontend feature, or visual design, search Mobbin for relevant screen-level patterns when Mobbin tooling is available.
- Use screen-level search terms, such as "trade confirmation", "asset list", "portfolio overview", "leaderboard", "trading modal", or "onboarding".
- Prioritize references from Base, Wise, Cash App, Origin, Coinbase, Coinbase Wallet, Monarch, and Kraken.
- Summarize the useful pattern takeaways before coding, then implement in this app's design language rather than copying another product.

**Branch, commit, and push**
- For implementation chunks, create or switch to a feature branch before editing when practical. Use the `codex/` prefix by default unless a different branch naming pattern is already in use.
- Keep changes grouped into coherent, reviewable commits. Commit after each completed chunk that builds, passes relevant checks, and leaves the repo in a usable state.
- Push the branch after committing so non-technical collaborators do not need to manage git manually.
- Do not commit or push for pure research, review, planning, or spec discussion unless files were changed.
- Do not include unrelated user changes in a commit. If the worktree already has unrelated edits, leave them alone and commit only the files touched for the current task.

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
- Price updates broadcast via Supabase Realtime on a server-side tick (2–3s)
- Clients subscribe to price channel — never poll the DB for prices

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
