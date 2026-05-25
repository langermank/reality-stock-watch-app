# Reality Stock Watch — Product Requirements Document

## Overview

A 24/7 virtual stock market game for North American Big Brother fans. Users buy, sell, and hold shares in active BB contestants using fake in-app currency. Prices move in real time based purely on supply and demand from live trading activity. No real money involved.

**Target audience:** Hardcore Big Brother US fans, specifically the RHAP podcast community.

---

## Core Concept

Each active contestant in a Big Brother season is listed as a tradeable stock. Users start with a fixed opening balance and trade freely at any time. Portfolio performance is tracked over the course of the season, with a per-season leaderboard.

This is a new build. A prior version of this game existed with a different structure (trading windows, audience-rating-based pricing). This version is 24/7 with pure supply/demand pricing.

---

## User Accounts

- Required — users must have an account to trade
- Persistent portfolios tied to account across the season
- Paid offering under consideration (not in initial scope, but architecture should not block it)
- Auth method: Google OAuth, Apple OAuth, email/password — all via Supabase Auth

---

## Currency

- Fake in-app currency using standard money formatting ($, numbers)
- Starting balance: TBD
- No earning mechanic beyond opening balance (TBD — revisit)

---

## Trading

- **Hours:** 24/7, no trading windows or halts
- **Mechanics:** Buy, sell, hold shares in any active contestant
- **Shares:** Fractional — players enter a dollar amount, not a share count
- **Pricing:** Bonding curve — pure supply and demand. Price derived from total shares outstanding per contestant. See `docs/pricing-formula.md` for full formula.
- **Execution:** At-market — trade executes at price at time of processing, not at time of order. UI communicates this clearly.
- **Real-time prices:** Supabase Realtime broadcasts `total_shares_outstanding` changes on trade fill. Clients derive price locally from the formula. No server-side ticker.
- **Transaction fee:** Small % on every trade (% TBD) — anti-exploit mechanism, fake money is destroyed

---

## Contestants

- One stock per active contestant per season
- Contestant data entered once per season via admin panel (AI-assisted scraping for initial setup)
- **Eviction:** Marked as `evicted` attribute — trading remains open, market self-corrects via natural sell pressure. No price zeroing or trading halt.
- **Re-entry:** No special pricing — market re-adjusts naturally
- **Key in-game events that may influence trading behavior** (not admin-triggered, but contextually relevant to fans): nominations, veto competitions, HOH wins, public votes, live feed activity

---

## Seasons

- Each Big Brother US season is a discrete game instance
- Leaderboard resets per season
- Admin sets up each new season manually via admin panel

---

## Leaderboard

- Per-season rankings based on portfolio value
- **Badges awarded at season end:**
  - Top 3 finish badge
  - Top 10 finish badge
- Badges persist on user profile across seasons

---

## Weekly Survey

- Admin creates and sends a weekly survey (e.g. rank contestants, answer questions about the season)
- Survey builder lives in the admin panel
- **Public link:** Anyone can take the survey anonymously — no account required
- **In-app integration:** Logged-in users are notified (push notification) when a new survey is live and can submit from within the app
- Submissions from logged-in users are tied to their account; anonymous submissions are stored separately
- No email distribution — in-app push + public link only
- Survey response data is visualized via a graph/chart view (see below)

### Survey Data Visualization

- A near-complete graph-rendering project already exists and will be pulled into this codebase
- This graph renders survey response data (e.g. contestant rankings over time)
- Integration details TBD, but the graph view should be accessible from within the main app
- Admin side of the graph tool shares the same admin panel as the stock game (unified admin, shared contestant data model)

---

## Admin Panel

- Create and configure a new season
- Add/edit contestants (with AI-assisted scraping for initial data population)
- Monitor trading activity
- Manage user accounts
- Build, edit, and publish weekly surveys
- View survey responses and trigger graph visualization
- Specific admin capabilities: TBD as features are defined

---

## Platform

- **Web app** (primary)
- **PWA:** Must be installable on mobile (Add to Home Screen) with full PWA support
- **Push notifications:** In scope — used for game events, price alerts, or season updates
- No native mobile app in initial scope

---

## Survey Notes

- Question types: ranking, multiple choice, single choice
- One active survey at a time per season
- Survey data is purely informational — does not influence stock prices
- Existing graph project: React + Vite. Components will migrate into Next.js at integration time.

---

## Out of Scope (v1)

- Real money / payment processing
- Multiple reality shows (BB US only for now)
- Native iOS / Android app
- Head-to-head or private leagues

---

## Infrastructure Notes

- **Database:** Postgres via Supabase
- **Trade processing (beta):** Optimistic locking — atomic transactions, no queue. Upgrade path to trade queue (Redis) when scaling to thousands of concurrent users. Schema accommodates this without changes.
- **Price broadcasting:** Supabase Realtime row-level broadcast on trade fill. Clients derive price locally. No server-side ticker.
- **Goal:** Minimize infrastructure cost. No premature optimization.

---

## Open Questions

- [ ] Starting balance amount
- [ ] Auth method (magic link, OAuth, email/password)
- [ ] Paid tier structure and what it unlocks
- [ ] Push notification triggers (what events?)
- [ ] Data migration from old app — what's worth carrying over?
- [ ] Transaction fee %
