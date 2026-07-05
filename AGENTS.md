# Reality Stock Watch

24/7 virtual stock market game for Big Brother US fans. Users buy and sell fractional shares in BB contestants using fake currency. Prices move in real time via a bonding curve driven by supply and demand.

Target audience: hardcore BB fans and the RHAP podcast community.

## Stack

- Next.js App Router + TypeScript
- Supabase: Postgres, Auth, Realtime, RLS
- Netlify: hosting and serverless functions
- Tailwind CSS + Base UI
- pnpm

Read [docs/tech-stack.md](docs/tech-stack.md) before changing framework, hosting, database, auth, or styling decisions.

## Start Here

- For product scope, read [docs/PRD.md](docs/PRD.md).
- For object names and UI vocabulary, read [docs/design/conceptual-model.md](docs/design/conceptual-model.md).
- For pricing, trades, or portfolio value, read [docs/pricing-formula.md](docs/pricing-formula.md) first.
- For UI flows, read the relevant `docs/design/interaction-flow-*.md` file before editing screens.
- For schema changes, read [docs/migrations.md](docs/migrations.md) before creating or applying migrations.
- For local setup, use [docs/local-dev.md](docs/local-dev.md).
- For admin operations such as setting up a season, use [docs/admin-recipes.md](docs/admin-recipes.md).

## Project Areas

- Core app screens live under `app/(app)/`: Market, Contestant detail, Portfolio, Leaderboard, and Survey.
- Auth and onboarding live under `app/(auth)/`; protected app shell behavior lives in `app/(app)/layout.tsx` and `middleware.ts`.
- Admin screens live under `app/admin/`, with authorization helpers in `lib/admin.ts`.
- Trading logic lives in `app/api/trade/route.ts`, `lib/pricing.ts`, and `supabase/migrations/0002_place_trade.sql`.
- Contestant price subscriptions live in `hooks/useContestantPrices.ts`; clients derive display prices from Realtime supply updates.
- Survey behavior lives in `components/survey/`, `lib/survey/`, and `docs/design/interaction-flow-survey.md`.
- Livestream reveal behavior lives in `app/admin/stream/`, `app/admin/reveal/`, `components/reveal/`, `lib/reveal/`, `hooks/useRevealState.ts`, and `docs/livestream-reveal-plan.md`.
- Database schema lives in `supabase/migrations/`; generated Supabase types live in `lib/supabase/types.ts`.

## Commands

```bash
pnpm dev        # local dev server
pnpm build      # production build
pnpm lint       # lint
pnpm typecheck  # TypeScript check
pnpm test       # Vitest suite
```

## Verification

After code changes, run the smallest useful set of checks:

- Pure TypeScript or logic: `pnpm typecheck` and relevant `pnpm test` coverage.
- UI changes: `pnpm typecheck`, `pnpm lint`, and a browser check of the affected route.
- Pricing, trade, or database changes: `pnpm test`, `pnpm typecheck`, and inspect the relevant migration/RPC path.
- Before a reviewable handoff: prefer `pnpm build` when the change touches routing, server components, Netlify behavior, or shared app wiring.

If a command cannot run because local services or secrets are missing, say that explicitly in the handoff.

## Codex Workflow

- Read the nearby code and relevant docs before editing. Let existing patterns win over new abstractions.
- For non-trivial work, keep a short plan and update it as you complete steps.
- Use focused subagents only when they can work independently, such as research, broad code search, or review.
- Make the smallest coherent change that solves the task. Avoid drive-by refactors.
- Fix obvious bugs you introduce or uncover while working in the same area.
- Before calling the work done, do an elegance pass: remove dead code, stale comments, unnecessary defensive branches, and mismatched naming.
- Do not overwrite user changes. If the worktree has unrelated edits, leave them alone and commit only files touched for the task.

## Issue Handoff

Use GitHub Issues as the durable task ledger so context survives between agents, sessions, and machines.

- Before implementation, look for an existing issue that matches the work. If none exists and the task is more than a tiny one-off, create one.
- Keep the issue updated with the current plan, important decisions, scope changes, blockers, and verification results.
- When pausing or handing off unfinished work, leave a comment with the branch name, latest status, next step, and any commands already run.
- Link commits and PRs back to the issue. PR bodies should include `Closes #<issue-number>` only when merging the PR should close the issue.
- Do not use issues for secrets, credentials, private user data, or raw environment values.
- If work is intentionally not tracked in an issue, mention why in the final handoff.

## UI Work

- Before implementing UI work involving a component, page, screen, overlay, modal, nav, layout, frontend feature, or visual design, search Mobbin for relevant screen-level patterns when Mobbin tooling is available.
- Use screen-level search terms, such as `trade confirmation`, `asset list`, `portfolio overview`, `leaderboard`, `trading modal`, or `onboarding`.
- Prioritize references from Base, Wise, Cash App, Origin, Coinbase, Coinbase Wallet, Monarch, and Kraken.
- Summarize useful pattern takeaways before coding, then implement in this app's design language instead of copying another product.
- Keep app screens utilitarian and fan-focused. This is an operational game interface, not a generic marketing site.

## Git Workflow

- For implementation chunks, create or switch to a feature branch before editing when practical. Use the `codex/` prefix by default.
- Keep changes grouped into coherent, reviewable commits.
- Commit only after relevant checks pass or after clearly documenting why a check could not run.
- Push the branch after committing so non-technical collaborators do not need to manage git manually.
- Do not commit or push for pure research, review, planning, or spec discussion unless files changed.
- PR bodies should include `Closes #<issue-number>` when the work corresponds to a GitHub issue.

## Hard Rules

### Pricing

- Never store price. Always derive it from `total_shares_outstanding`.
- Pricing constants (`K`, `base_price`, `starting_balance`) lock permanently when a Season goes Active. Enforce this at the API level, not only in the UI.
- See [docs/pricing-formula.md](docs/pricing-formula.md) before changing formula logic.

### Trades

- Trades must be atomic: debit Cash, update `total_shares_outstanding`, and record the Trade in one database transaction.
- Trade records always have a `state` column: `pending`, `filled`, or `failed`. `pending` is unused in beta but must exist in the schema.
- Execution is always at-market. Never execute at the previewed price.

### Realtime

- Supabase Realtime broadcasts row-level changes on the `contestants` table when a trade updates `total_shares_outstanding`.
- Clients derive prices locally from the formula after receiving the updated supply.
- Do not poll the database for prices.
- Do not add an always-on server-side price ticker. Netlify serverless cannot run one.

### Admin

- `/admin` is a protected route gated by the `is_admin` flag on User.
- Pricing constants display as read-only with label `Locked when trading opened` once a Season is Active.
- Season state transitions are irreversible and always require confirmation.

### Database

- `total_shares_outstanding` per Contestant is the single source of truth for pricing. Update it only inside trade transactions.
- The trade queue is not implemented in beta. Use optimistic locking only; keep the schema compatible with adding a queue later.
- Supabase RLS should be enabled from day one.
- Schema changes ship via Supabase CLI `db push`; git is the source of truth. Use Supabase MCP tools only for inspection, not shipping migrations.

### PWA And Push

- The app must be installable as a PWA with a Web App Manifest and service worker.
- Push notifications use Web Push API + VAPID, with no paid service.
- Subscriptions are stored in Supabase per User.
- Notification triggers: survey live, survey closing in 1 hour, results published.

## Vocabulary

- Use the ubiquitous language from [docs/design/conceptual-model.md](docs/design/conceptual-model.md).
- UI copy should use: User, Contestant, Trade, Holding, Portfolio, Cash, Season Result, Badge.
- Never use `P&L`; use plain language like `up $247 since season start`.
- Never use `Stock` as an object name. Contestant is the tradeable entity.
