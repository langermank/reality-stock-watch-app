# Layers Orient — Reality Stock Watch

*Rerun date: 2026-06-11. Framework: Layers of Product Design. Skill version: upgraded `/layers-orient`.*

This pass re-runs the orient diagnostic against the current project documentation and shipped code. The previous orient session from 2026-05-15 identified **Conceptual Model** as the bottleneck because core objects, states, and flows were not yet documented. Since then, the product has gained a documented conceptual model, interaction-flow docs, schema, pricing formula, and working implementations for market/trading, survey, admin season management, portfolio/leaderboard surfaces, push subscription APIs, and the livestream reveal tool.

---

## Layer Audit

| Layer | State | Notes |
|-------|-------|-------|
| Observed behaviour | Partial | Evidence still comes mostly from the prior app and operational memory: trading windows caused friction, load/data volume failed, RHAP/BB fans are socially competitive. The current 24/7 bonding-curve version has no documented user interviews, usability sessions, analytics, or beta learnings yet. |
| The domain | Strong | The docs show strong command of BB concepts, RHAP context, season cadence, surveys, live-feed discourse, evictions, re-entry, HOH, nominations, veto, finale states, and public-link fan participation. Domain understanding is not the current risk. |
| User needs | Partial | The underlying job is coherent: fans want to express reads on the season, compete socially, and compare takes. This is embedded in flow job stories, but not yet validated or prioritized against observed behaviour. Needs around casual onboarding, Discord sharing, and survey result consumption remain assumed. |
| Product & service strategy | Partial | v1 scope is reasonably explicit: BB US only, fake money, PWA, no paid service dependencies, low infrastructure cost, survey integration, admin-driven seasons. Success measures, retention goals, paid-tier strategy, and what behaviour would prove the product is working remain informal. |
| Conceptual model | Strong | Core objects, relationships, states, vocabulary, pricing mechanics, schema, and trade invariants are documented and mostly implemented. Remaining decisions are bounded: all-time leaderboard scoring, survey editing while active, results visibility, and exact end-of-season trading/finale semantics. |
| Interaction structure | Strong | Major flows are breadboarded: onboarding, trading, portfolio/leaderboard, survey, admin, and shipped livestream reveal. Several flows are also represented in working code. Remaining open items are mostly localized interaction/surface decisions, not missing structure. |
| Surface | Partial | The app has a consistent dark, mobile-first Tailwind/Base UI language and shipped screens, but no formal surface guidelines or component system beyond local patterns. Some copy and visual decisions remain open: homepage copy, badge treatment, contestant selector details, price animation, and leaderboard “Find me” behaviour. |

---

## Bottleneck Analysis

**Bottleneck: Observed behaviour**

This is now the lowest layer with unresolved risk. The product has moved upward substantially since the first orient pass: the conceptual model and interaction structure are no longer absent. The remaining foundational weakness is that many product choices are based on domain expertise, prior-app lessons, and plausible RHAP-community assumptions rather than direct evidence from the current 24/7 version.

The risk is not that the team does not understand Big Brother. The risk is that the new mechanics may change user behaviour:

- A 24/7 market may reduce urgency compared with trading windows, or it may create more compulsive checking.
- A bonding curve may be understood by hardcore fans as “market vibes,” or it may feel opaque/unfair without better explanation.
- The survey and livestream reveal work may be a major engagement loop, or it may remain separate from the trading game in users' minds.
- Social competition is assumed to matter, but Discord sharing, leaderboard motivation, badges, and all-time ranking have not been validated as the right expressions of that need.

**Assumed layers to watch**

- **User needs:** “Express my read and compete with other fans” is credible, but still thin. It should be tested with RHAP users before investing heavily in secondary loops like all-time leaderboard scoring, public profiles, or paid tiers.
- **Product strategy:** Cost minimization and v1 scope are clear; success criteria are not. There is no explicit answer to “what user behaviour tells us this game is working?”
- **Surface:** A visual language exists in code, but it is emergent. It may be enough for now, but should not be mistaken for a reusable design system.

**Cross-doc drift**

- **Realtime price updates:** `docs/PRD.md`, `docs/pricing-formula.md`, and current code use Supabase row changes plus client-side derivation with no server-side ticker. `docs/tech-stack.md` and repo instructions still mention a configurable 2–3s server-side tick. Treat the no-ticker model as the implemented decision unless intentionally reversed.
- **Anonymous survey handoff:** `docs/schema.md` says anonymous submissions are never retroactively linked to users; `docs/design/interaction-flow-survey.md` marks anonymous-to-signup carryover as the decision with implementation deferred. This needs one canonical product decision.
- **Pricing constants:** Seed/admin docs provide practical defaults, but `docs/pricing-formula.md` still lists `base_price`, `K`, `MIN_SUPPLY_FLOOR`, `starting_balance`, and fee rate as TBD/open. Separate “default beta values” from “final calibration” so the docs stop reading as more undecided than the implementation is.
- **Vocabulary leakage:** Some docs and code-facing copy still use “stock” and “P&L” in places where the current vocabulary says Contestant/Holding and plain-language gain/loss. This is a surface consistency issue rooted in the conceptual vocabulary decision.

---

## Recommendation

Run **`/layers-observed-behaviour`** next.

The useful next move is not another broad design document. It is a lightweight research plan for the current product assumptions: what to learn from RHAP users, what to instrument in beta, and which behaviours would confirm or disconfirm the product strategy.

Specific decisions to support:

1. What evidence would show that 24/7 trading is better than trading windows?
2. What do users need to understand about bonding-curve pricing before they trust it?
3. Which loop matters most: trading, leaderboard comparison, survey results, or livestream reveal?
4. What social behaviours should the product deliberately support in Discord/RHAP contexts?
5. What success metric should guide v1: activation, repeat trading, survey completion, leaderboard checking, push opt-in, or something else?

Want to run `/layers-observed-behaviour` now, or is there something in this picture to push back on first?

---

## Comparison To 2026-05-15 Orient

| Area | 2026-05-15 finding | 2026-06-11 finding |
|------|--------------------|--------------------|
| Bottleneck | Conceptual Model | Observed Behaviour |
| Conceptual model | Assumed; undocumented objects/states | Strong; documented and mostly implemented |
| Interaction structure | Not started | Strong; key flows breadboarded and several shipped |
| Surface | Not started | Partial; coherent shipped UI, no formal system |
| Main risk | Build on undefined objects and states | Build on unvalidated assumptions about current-user behaviour |
