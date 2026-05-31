# Livestream Reveal — Incorporation Plan

*Drafted 2026-05-30. Source repo: `big-brother-season-data-vis` (forked). Resolved via grilling session.*

> **Status: shipped 2026-05-31.** All sub-issues merged (#62, #63, #64, #65, #66 → PRs #67, #68, #69, #72, #75). This doc remains as the design record. Current code: `lib/admin.ts`, `app/admin/{layout,page,stream,reveal}/`, `components/reveal/`, `hooks/useRevealState.ts`, `lib/reveal/{source,actions,aggregate}.ts`, `supabase/migrations/0006_livestream_reveal.sql`. UX parity with the original `StreamVisualization.tsx` is high (geometry/lines/dots/leaderboard/stats faithful; visual styling redesigned for broadcast; week-click navigation intentionally not exposed since only the producer changes the on-air week via the control panel).

---

## What this is

Incorporate the **producer-curated livestream reveal tool** from `big-brother-season-data-vis` into Reality Stock Watch as a **standalone broadcast surface**: a chrome-less stream view that plots each contestant's **fan-aggregate ranking trajectory** across the season, with a producer panel that **progressively reveals the current week's ranking live on stream**.

### The reframe (important)

The data-vis repo is **not** a survey app. It is a producer-curated **ranking + progressive-reveal tool** built for livestream capture. Its signature `StreamVisualization.tsx` is a custom SVG line chart: X = weeks, Y = rank/score, one line per contestant. The admin reveals each week's ranking one entry at a time during a live presentation.

We keep that mechanic but **change the data source**: instead of producer-typed rankings, each week's ranking is the **aggregate of fan survey responses**. "Week" maps to "survey."

---

## Resolved decisions

| # | Decision | Choice |
|---|----------|--------|
| 1 | Chart data source | **Fan-aggregate survey rankings** (one ranking per weekly survey) |
| 2 | What "reveal" does | Chart already holds prior weeks; producer reveals **this week's column live**, adding it to the trajectory |
| 3 | Render surface | **Admin-gated, never public.** Two chrome-less views inside the admin area: a broadcast graph view (OBS captures the producer's *authenticated* window) + a control panel. No in-app results embed in this plan. |
| 4 | Input data (for now) | **Seed fixtures behind a single data seam.** Flip to real survey responses once #41 submission ships. |
| 5 | Aggregation algorithm | **Spec both** (Borda points & average rank); pick at implementation |
| 6 | Producer control surface | **Dedicated producer panel, desktop-friendly, gated by `is_admin`** (pioneers the app's first admin surface) |
| 7 | Reveal model | **Port existing logic as source of truth**: integer `revealCount`, ordered by rank ascending (top-first), single "Reveal Next" + "Reset" + week select |
| 8 | Stream view aesthetic | **Dedicated broadcast styling** (bold, high-contrast, large type), reusing contestant `photo_url` + a derived color palette |

### Explicitly out of scope

- **#44 Survey builder** — admin creating/editing surveys (connected, but separate)
- **#41 in-app survey results page** — the logged-in results state + embed
- **User survey submission flow** — real fan responses (we seed fixtures until it lands)

---

## Stack reconciliation

The data-vis backend does **not** port as code — it's a reference spec. Mapping:

| Concern | data-vis (source) | Reality Stock Watch (target) |
|---------|-------------------|------------------------------|
| DB / ORM | Neon + Drizzle | **Supabase Postgres** (SQL migrations) |
| Live updates | **polls every 250ms** | **Supabase Realtime** (hard rule: never poll) |
| Admin auth | `ADMIN_PASSWORD` + jose cookie | **`is_admin` flag + RLS** |
| Framework | Vite SPA + Netlify Functions | **Next.js App Router** (route handlers / RPC) |
| UI primitives | Radix UI | Base UI (producer panel); stream view is custom |
| Tailwind | v4 (vite plugin) | v4 (postcss) ✅ already aligned |
| React | 19 ✅ | 19 ✅ |
| Contestant color | `players.color` column | **derive stable palette by id** (no color column) |
| Eviction on chart | `players.eliminatedWeek` | **derive from presence** — line ends when contestant stops appearing in survey rankings |

### What's frozen vs. what we redesign

**Frozen — the original author owns this and is happy with it. Port behavior-preserving; do not redesign:**

- **`src/lib/rankings.ts`** — all ranking/reveal math: `visibleEntriesForWeek`, `orderEntries`, `calculateMovements`, `calculateStats`, `buildPublicState`. Ports near-verbatim into `lib/reveal/rankings.ts`. Behavior must match the original exactly; lock it with unit tests against the original's outputs.
- **The reveal model** — integer `revealCount`, rank-ascending order, top-first (decision #7). Logic unchanged; only its *storage* moves to Supabase.

**Free to redesign — full latitude:**

- **Visual design** — dedicated broadcast styling, our own look.
- **Frontend** — Next.js App Router, our components, Realtime instead of polling.
- **Backend** — Supabase (Postgres + Realtime + RLS) replacing Neon/Drizzle/jose entirely.

### Portable assets

1. **`src/lib/rankings.ts`** — frozen logic, ported verbatim (see above).
2. **`src/components/StreamVisualization.tsx`** — the SVG chart structure (lines, dots, hover, leaderboard sidebar, stat cards). Keep its *geometry/logic*; reshape input to our types, swap polling → Realtime, **restyle freely** for broadcast.
3. **`src/types/domain.ts`** — type shapes as a reference for our equivalents.

Everything in `netlify/db/*` and `netlify/functions/*` is **reference only** — rewritten on Supabase.

---

## Data model (Supabase)

Reuse existing `surveys` (has `week_number`, `status`, `results_published_at`) and `contestants` (`photo_url`, `status`).

**New tables:**

```
survey_aggregate_rankings        -- frozen snapshot of fan-aggregate ranking per survey
  survey_id        uuid  FK → surveys(id) ON DELETE CASCADE
  contestant_id    uuid  FK → contestants(id)
  rank             int   NOT NULL          -- 1 = top
  score            numeric NOT NULL        -- Y-axis magnitude (Borda or avg-rank, see below)
  PK (survey_id, contestant_id)
  -- 'revealed' is DERIVED from reveal_count, never stored per row (mirrors buildPublicState)

survey_reveal_state              -- producer's live reveal pointer (mirrors revealStates)
  season_id          uuid  FK → seasons(id)   -- one active reveal per season
  selected_survey_id uuid  FK → surveys(id)
  reveal_count       int   NOT NULL DEFAULT 0
  updated_at         timestamptz NOT NULL DEFAULT now()
  PK (season_id)
```

- **Snapshot, not derived live.** Unlike pricing (never store, always derive), the aggregate is a deliberate **frozen snapshot** computed when a survey closes (or seeded). Storing it is correct here.
- **Realtime** enabled on `survey_reveal_state`. Control panel updates the row → broadcast → graph view re-renders. No polling.
- **RLS:** `survey_aggregate_rankings` + `survey_reveal_state` are **admin-read and admin-write only**. Nothing in this feature is public — the broadcast view loads in the producer's authenticated session and OBS captures that window.

### Spoiler hardening (still worth doing)

The data-vis API ships **all** entries to the client (unrevealed ones just have `revealed:false`) — inspectable in the network tab. Since everything is now admin-gated, the public can't reach it, but the producer's *own* broadcast view must still only render revealed entries (that's the reveal mechanic). **Filter unrevealed entries server-side** for the current week so the captured window never shows them early. Prior (fully-revealed) weeks ship whole.

---

## Aggregation (spec both, decide at implementation)

Turns N fan ranking-submissions into one ordered list + per-contestant `score`:

- **Option A — Borda points (recommended default):** each submission awards `(N − position)` points per contestant; sum across submissions = `score`; `rank` = order by score desc. Tie-resistant, good Y-axis spread, smooth chart.
- **Option B — Average finishing position:** `score` = mean rank; lower is better; invert for an up=good chart. Intuitive ("avg 2.3") but compresses the axis.

Implement behind a single `aggregate(responses) → {contestant_id, rank, score}[]` function so the choice is swappable.

---

## The data seam

One module, e.g. `lib/reveal/source.ts`, exposes:

```
getAggregateRankings(seasonId) → WeekRanking[]   // per survey
```

- **Now:** returns from seeded `survey_aggregate_rankings` fixtures (port `mockData.ts` shape to our contestants/surveys).
- **Later:** the same function reads real `survey_aggregate_rankings` populated by the aggregation job at survey close.

The stream view, producer panel, and chart never know which is live.

---

## Build sequence

**Admin-first.** The `is_admin` foundation comes before anything, and every surface in this feature sits behind it.

1. **Admin auth foundation** — `is_admin` gate, protected layout/route, redirect-on-unauthorized. The reusable pattern that all of Phase 4 admin (#42–44) inherits.
2. **Migrations** — `survey_aggregate_rankings`, `survey_reveal_state`; enable Realtime on reveal state; **admin-only RLS**. Apply to staging.
3. **Seed fixtures** — port `mockData.ts` → real contestants + a handful of weekly surveys with aggregate rankings, mid-reveal state.
4. **Port frozen logic** — `rankings.ts` → `lib/reveal/rankings.ts`, behavior-preserving. Lock with unit tests asserting parity against the original's outputs. **Do not redesign.**
5. **Data seam** — `lib/reveal/source.ts` + `aggregate()` (Borda).
6. **Broadcast graph view** — admin-gated, chrome-less route for OBS window capture. Port `StreamVisualization` geometry, **restyle for broadcast**, derive contestant colors, subscribe to `survey_reveal_state` via Realtime, server-filter unrevealed entries.
7. **Producer control panel** — admin-gated: select survey, "Reveal Next", "Reset", live preview. Writes `survey_reveal_state`.
8. **Verify** — drive reveal from the panel, confirm the broadcast view updates live over Realtime; confirm no unrevealed data reaches the client.

## Admin panel (primary work area)

This is where the bulk of effort goes, and the app's **first `is_admin`-gated surface** — so it sets the pattern for all of Phase 4 admin (#42–44).

**This plan (minimum to drive a live reveal):**
- `is_admin` gate + protected route + redirect-on-unauthorized (the reusable pattern).
- Reveal controls: select survey, "Reveal Next", "Reset" → writes `survey_reveal_state`. Desktop-friendly.
- Live preview mirroring the stream view so the producer sees what air sees.

**Foreseeable growth (not blocking the reveal, but where "a lot of work" lands):**
- Survey/week management (publish, close, select active) — overlaps #44.
- Contestant roster management (photos, status/eviction) — overlaps #43.
- Aggregate inspection / manual override before going live.
- Multi-step admin shell (tabs/nav) the data-vis `AdminPage.tsx` demonstrates — a structural reference, rebuilt on Base UI + Supabase.

Build the gate + reveal controls first so the broadcast works; layer the rest iteratively.

---

## Dependencies & sequencing

- **Pioneers the first `is_admin`-gated surface** — the gate pattern here seeds Phase 4 admin (#42–44).
- **Decoupled from #41/#44 via the data seam** — fully functional and demoable on fixtures now; flips to real fan data when survey submission + close-time aggregation land.
- **Connected to #44 (survey builder)**: once surveys are admin-authored and fans submit, the aggregation job at survey close writes `survey_aggregate_rankings` — and this whole surface lights up with real data, no changes to the stream view or panel.

## Open questions / risks

- **Where does aggregation run at close?** (Supabase cron / edge function / on results-publish.) Defer until real submissions exist; the seam absorbs it.
- **Contestant entering/leaving mid-season** — chart lines start/stop by presence; confirm the leaderboard sidebar handles a contestant absent from the current week.
- **Stream view auth** — fully public, or obscured URL? Public read is simplest for OBS; spoiler-hardening (server-filtering) covers the leak either way.
- **Route names** — `/stream` + `/producer` (or `/admin/stream`). Pick when scaffolding.
