# Product Strategy — Reality Stock Watch

*Created: 2026-06-11. Framework: Layers of Product Design. Source: `docs/design/user-needs.md`.*

This strategy is provisional because the underlying user needs are mostly inferred or assumed. Treat it as the clearest current bet, not as validated product truth.

---

## Strategic Bet

Reality Stock Watch should optimize v1 around this core loop:

> A BB fan gets new game information, forms or updates a read, trades on that read, and returns to see how that read compares with the market and community.

Surveys, livestream reveal, leaderboard, badges, and push notifications should support that loop unless research shows they are valuable as separate rituals.

---

## Primary Outcome

**Increase activated users who return after their first meaningful action during an active season.**

For v1, a meaningful action is one of:

- First filled Trade.
- First Survey Response.
- First published-results view after submitting a survey.

The strongest activation signal is still expected to be a first filled Trade, because trading is the product's primary mechanic.

---

## Opportunity Tree

| Journey moment | Opportunity | Confidence | Candidate bets |
|----------------|-------------|------------|----------------|
| New game information changes a fan's read | "I want to act before the rest of the fandom catches up." | Inferred | Fast trade entry, contestant detail context, current price movement, global trade affordance. |
| User composes or submits a trade | "I need the trade to feel fair even if the market moved." | Assumed | Clear preview vs. execution feedback, plain-language price movement copy, visible fee/slippage summary. |
| User returns after trading | "I want to know whether my read is paying off." | Inferred | Portfolio summary, holding-level gain/loss in plain language, trade history, contestant movement. |
| User compares with community | "I want to see how I stack up without digging." | Inferred | Find-me leaderboard action, own-row treatment, rank movement, badges. |
| Weekly fandom ritual | "I want to compare my take with the community." | Assumed | Survey result graph, livestream reveal, "Your picks" recall, push when results publish. |
| Social sharing | "I want a receipt for my good read." | Assumed | Shareable rank/portfolio/best-trade card, public profile, badge detail. |

---

## Top Bets For V1

### Bet 1: First Trade Activation

**We could** make the first trade path fast, legible, and low-friction from market or contestant detail.

**We believe this serves** the need to act on a changing read quickly.

**Riskiest assumption:** users arrive with a contestant opinion strong enough to trade before they need deep explanation.

**Cheapest tests:**

- Usability test: ask 5 likely users to find a contestant they think is undervalued and place a trade.
- Instrument: market view → trade sheet opened → trade submitted → trade filled.
- Interview: ask what information they wanted before committing.

### Bet 2: Trustworthy Market Feedback

**We could** explain at-market execution through result feedback rather than long pre-trade education.

**We believe this serves** the need to trust market movement while preserving speed.

**Riskiest assumption:** users do not need the full formula if the trade result explains practical consequences clearly.

**Cheapest tests:**

- Usability test: after a trade, ask users to explain why the execution price may differ from preview.
- Compare copy variants for filled trade feedback in a prototype.
- Track failed trades and immediate repeat/retry behaviour.

### Bet 3: Return Loop Through Portfolio And Community Comparison

**We could** make Portfolio and Leaderboard the primary return destinations after first action.

**We believe this serves** the need to see whether a read is paying off and compare with other fans.

**Riskiest assumption:** users care about leaderboard comparison with mostly anonymous users.

**Cheapest tests:**

- Instrument first-action → portfolio view → leaderboard view within 24 hours.
- Interview users about what result they would want to share after a good trade.
- Prototype own-row/rank movement treatment and test whether it answers "how am I doing?"

---

## Deferred Bets

These may be valuable, but should not lead v1 strategy until the core loop is validated:

- Public profiles with full season history.
- Friend groups or private leagues.
- Price alerts for specific contestants.
- Rich share cards for Discord/social channels.
- Paid tier or subscription features.
- Advanced pricing explainers or formula education.
- All-time leaderboard scoring beyond basic season result snapshots.

---

## Success Metrics To Instrument

Primary:

- Activation rate: new account → first filled Trade.
- Return rate: activated user returns within 24 hours and 7 days.
- Repeat action rate: second Trade or second Survey Response in the same season.

Supporting:

- Trade sheet open → submit conversion.
- Trade failure rate by reason.
- Portfolio view after first Trade.
- Leaderboard view after first Trade.
- Survey submit → results view conversion.
- Push opt-in rate after survey prompt.

Guardrails:

- High trade failure rate.
- High abandonment at username confirmation.
- High abandonment from trade sheet before submit.
- Low comprehension in usability sessions around preview vs. execution.

---

## Strategy Risks

- The chosen loop assumes trading is the primary value, but surveys/reveal may be the more natural RHAP ritual.
- Social comparison may require known-community context rather than anonymous global rankings.
- A 24/7 market may need event-based prompts to preserve urgency.
- The product may need more pricing explanation than the current fast-trade loop allows.

---

## Handoff To Conceptual Model

The current conceptual model mostly supports this strategy. The next audit should check four areas:

1. Whether a **Trade** records enough information to create a user-facing "receipt" for a good read.
2. Whether **Season Result** and **Badge** support the social proof users may want.
3. Whether **Survey Response** should ever connect to a User after anonymous signup, since current docs disagree.
4. Whether the model needs an explicit concept for rank movement, price movement, or notable trade events, or whether those remain derived views.
