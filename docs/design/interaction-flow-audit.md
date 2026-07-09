# Interaction Flow Audit — Reality Stock Watch

*Created: 2026-06-11. Framework: Layers of Product Design. Source: product strategy and existing interaction-flow docs.*

This audit checks the existing breadboards against the provisional strategy: first-trade activation, market trust, and return behaviour.

---

## What Is Stable

- The main places are coherent: Market, Contestant, Trade overlay, Portfolio, Leaderboard, Survey, Admin.
- The Trade overlay has the right structural shape for fast action: generic, contestant-selectable, Buy/Sell in one place, at-market result state.
- Portfolio and Leaderboard are correctly separated as return destinations.
- Survey has a clear state machine and separates anonymous public-link behaviour from logged-in app behaviour.
- Admin flows cover the high-stakes state transitions with confirmation.

---

## Flow Decisions To Revisit

| Flow | Decision | Why it matters |
|------|----------|----------------|
| Onboarding → Market | Whether first active-season arrival needs a first-trade prompt or contextual empty state. | Strategy assumes first Trade is the strongest activation signal. Current flow trusts users to orient themselves. |
| Market → Trade | Whether a global Trade affordance belongs in top-level navigation or only contextual rows/detail pages. | Fast action matters when a fan has a read before choosing a screen path. |
| Trade overlay | How much explanation appears before submit vs. after fill. | Trust depends on understanding preview, execution, fee, and price movement without slowing the trade. |
| Trade result → Return destination | Whether filled trade dismissal should return passively or offer Portfolio/Leaderboard as next actions. | Return loop depends on users checking whether their read is paying off. |
| Portfolio | Whether holdings need a "what changed since my trade" view. | Users may need feedback beyond current value to understand whether a read worked. |
| Leaderboard | Exact "Find me" behaviour when the user is outside the first loaded page. | Community comparison fails if users cannot locate themselves quickly. |
| Survey results | Whether results should link back to contestants or trading decisions. | Strategy treats surveys as supporting the trading loop unless research proves they are separate. |

---

## Edge States To Preserve

- Trade failed: diagnose, explain, and recover with amount preserved.
- Trade filled after price movement: show execution vs. preview only when meaningful enough to avoid noise.
- Realtime miss or lag: page refresh should re-seed from server data.
- Empty holdings: route toward first trade without using "stock" vocabulary.
- Empty leaderboard: make early beta feel alive enough without inventing fake competition.
- Anonymous survey closed: remain standalone, no forced app navigation.

---

## Handoff To Surface

Surface work should focus on:

- Plain-language market feedback.
- Vocabulary consistency around Contestant, Trade, Holding, Portfolio, Cash, Season Result, Badge.
- Hierarchy on Market, Trade result, Portfolio, and Leaderboard so the core loop is obvious.
- Error and loading states that explain what happened and what to do next.
