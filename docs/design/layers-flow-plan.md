# Layers Flow Plan — Reality Stock Watch

*Created: 2026-06-11. Framework: Layers of Product Design.*

This plan defines how to refine the product design documentation for this repo using the `/layers-*` skills. The goal is not to generate a complete new document set. The goal is to make and capture the decisions that are currently live, starting from the lowest unresolved layer and moving upward only when lower-layer work changes what depends on it.

---

## Current Orientation

The 2026-06-11 `/layers-orient` rerun identifies **Observed behaviour** as the current bottleneck.

| Layer | Current state | What that means for this pass |
|-------|---------------|-------------------------------|
| Observed behaviour | Partial | Synthesize existing evidence and plan lightweight research for the current 24/7 version. |
| The domain | Strong | Quick check only unless research reveals missing BB/RHAP concepts. |
| User needs | Partial | Refine after observed-behaviour work, using confidence ratings. |
| Product & service strategy | Partial | Decide what v1 optimizes for and how success will be measured. |
| Conceptual model | Strong | Audit for drift after strategy/needs are clearer; do not rewrite from scratch. |
| Interaction structure | Strong | Update flows only where research, strategy, or model decisions change journeys. |
| Surface | Partial | Capture surface principles and cleanup targets after lower layers settle. |

---

## Working Sequence

1. **Observed behaviour** — create an evidence inventory, mark confidence, name learning goals, and define a small research plan.
2. **User needs** — convert evidence into candidate job stories and prioritize the needs v1 should serve.
3. **Product & service strategy** — choose the primary engagement loop, define success metrics, and clarify what remains out of scope.
4. **Conceptual model audit** — check the current object/state/vocabulary docs against the strategy and implementation.
5. **Interaction flow audit** — update breadboards where the model or strategy changed the user journey.
6. **Surface audit** — document copy, hierarchy, visual feedback, and component-pattern decisions that should stay consistent across shipped UI.

Domain gets a short audit between observed behaviour and user needs only if new research reveals missing or misnamed BB/RHAP concepts.

---

## Capture Rules

- Save decisions and open questions, not transcripts.
- Prefer editing existing design docs when a decision belongs there.
- Add a new Markdown file only when the decision set does not already have a clear home.
- Use confidence labels for research-derived claims: **Observed**, **Inferred**, **Assumed**.
- Keep diagrams only when they encode a decision. Mermaid labels should use `<br/>` for line breaks.

---

## Documentation Targets

| Step | Likely file |
|------|-------------|
| Observed behaviour | `docs/design/observed-behaviour.md` |
| User needs | `docs/design/user-needs.md` |
| Product strategy | `docs/design/product-strategy.md` |
| Conceptual model audit | `docs/design/conceptual-model.md` |
| Interaction flow audit | `docs/design/interaction-flow-*.md` |
| Surface audit | `docs/design/surface-guidelines.md` |

---

## Current Open Threads To Carry Forward

- What direct evidence shows that a 24/7 market is better for this audience than trading windows?
- What does a user need to understand about bonding-curve pricing before they trust trades?
- Which engagement loop should v1 optimize: trading, leaderboard comparison, surveys, livestream reveal, or Discord sharing?
- What beta behaviour would prove the product is working?
- Which cross-doc drifts need canonical decisions: realtime pricing model, anonymous survey handoff, pricing defaults vs. final calibration, and vocabulary leakage?
