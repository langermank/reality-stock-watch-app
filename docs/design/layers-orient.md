# Layers Orient — Reality Stock Watch

*Session date: 2026-05-15. Framework: Layers of Product Design.*

---

## Layer Audit

| Layer                     | State    | Notes |
|---------------------------|----------|-------|
| Observed behaviour        | Partial  | Real operational data from prior app: market windows caused friction, load/data volume caused technical failures. 24/7 decision is evidence-based. No formal user research. |
| The domain                | Strong   | Deep BB knowledge (HOH, nominations, veto, live feeds, evictions, RHAP community). Not a risk. |
| User needs                | Partial  | "Social competition and sharing stats in Discord" is a real articulation. Underlying job: express reads on the game, compete low-stakes with other fans. Not formally documented but coherent. |
| Product & service strategy | Partial | Goal: minimize infra cost, ship something real. Monetization deferred. Success metric is informal — no explicit KPIs. Business model is open. |
| Conceptual model          | Assumed  | Team has a shared mental model but it isn't documented. Key objects (Stock, Contestant, Season, Trade, Portfolio, Survey, Badge) and their relationships/states are undefined. Critical states (eviction behavior, price formula) are explicitly TBD. |
| Interaction structure     | Not started | No flows, breadboards, or user journeys exist yet. |
| Surface                   | Not started | No design system or visual language defined. |

---

## Bottleneck Analysis

**Bottleneck: Conceptual Model**

This is the lowest layer with unresolved, risky decisions — and the most load-bearing one for this product.

The conceptual model for Reality Stock Watch is complex:
- Multiple interconnected object types (Contestant, Stock, Season, Trade, Portfolio, Survey, Badge, Leaderboard)
- Key state transitions are undefined — **eviction behavior is explicitly flagged as critical and TBD**
- The pricing formula is deferred ("owner will provide logic") — but this *is* the conceptual model for how Stocks behave
- The Survey's relationship to Stock prices is unresolved (does it influence prices or is it purely informational?)
- The prior app had a fundamentally different model (trading windows, rating-based pricing) — the new model hasn't been formally articulated to replace it

Everything above — interaction flows, surface design, infrastructure decisions — will be built on this foundation. Getting it wrong here creates rework at every layer above it.

**Also flag: assumed layers**

- *Observed behaviour* is treated as solid but it's from a different product with different rules. User behavior in a 24/7 market may differ significantly from what was observed with trading windows. Don't over-index on old data.
- *User needs* is coherent but thin. "Social competition" is the job — but the specific mechanics that serve that need (leaderboard shape, sharing format, Discord integration) haven't been tested against real users.

**Infrastructure constraint worth naming:** The prior app had load and data volume problems. The conceptual model decisions — how trades are recorded, how prices are calculated, how often — are directly coupled to infrastructure cost. These can't be designed in isolation from the cost constraint.

---

## Recommendation

Run **`/layers-conceptual-model`** next.

Specifically, we need to define:
1. What are the core objects and their relationships
2. What states each object moves through (especially Contestant/Stock lifecycle)
3. The eviction event — what it does to Stock state, Portfolio state, and Leaderboard
4. How a Trade works as an object — what it records, when it resolves, what it changes
5. The Survey object and whether/how it connects to the Stock game

Getting this documented will also generate the right questions to carry into the infrastructure and pricing formula conversations.

Want to run `/layers-conceptual-model` now, or push back on anything in this picture first?
