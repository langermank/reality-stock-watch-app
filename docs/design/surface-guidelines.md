# Surface Guidelines — Reality Stock Watch

*Created: 2026-06-11. Framework: Layers of Product Design. Source: conceptual model, interaction flows, and provisional product strategy.*

These guidelines capture current surface decisions and cleanup targets. They are not a full design system.

---

## Surface Priorities

1. **Fast comprehension:** users should understand the current season, current prices, their Cash, and the next trade action without reading a tutorial.
2. **Market trust:** every Trade result should make clear what happened, what changed, and what the user can do next.
3. **Plain competition:** show rank, Portfolio value, and gains/losses in direct language. Avoid finance jargon.
4. **Community fit:** the tone should feel like a smart BB fan game, not a brokerage app.

---

## Vocabulary Rules

Use the conceptual-model language:

- User
- Contestant
- Trade
- Holding
- Portfolio
- Cash
- Season Result
- Badge

Avoid:

- "Stock" as an object name. Prefer **Contestant** or **Contestant shares** when the share mechanic needs to be explicit.
- "P&L". Prefer "up $247 since season start", "down $42 on this Holding", or "gain/loss".
- "Order" unless a future queued-trade model makes that distinction visible to users.

---

## Feedback Rules

| Action/state | Surface requirement |
|--------------|---------------------|
| Trade preview | Show estimated shares, price movement across the batch, fee, and clear language that execution is at-market. |
| Trade processing | Block duplicate submit and show that the Trade is being placed. |
| Trade filled | Confirm buy/sell, Contestant, shares, execution price, fee, and any meaningful preview difference. |
| Trade failed | Diagnose the cause when known, explain the state of the user's money/Holding, and offer recovery. |
| Price update | Animate subtly enough to signal change without making the market feel noisy. |
| Empty Portfolio | Prompt first Trade using Contestant/Holding vocabulary. |
| Leaderboard find-me | Make the user's own row visually distinct and explain if no rank exists yet. |

---

## Hierarchy Targets

- **Market:** Contestant, current price, user Holding, and Trade affordance should dominate. Secondary flags like HoH/Nominated/Veto should be visible but not compete with price/action.
- **Trade overlay:** amount, Buy/Sell, selected Contestant, and confirm action should be primary. Formula-level detail should stay secondary.
- **Trade result:** outcome first, then executed details, then next action.
- **Portfolio:** net worth, Cash, and change since season start first; individual Holdings second; history behind a tab.
- **Leaderboard:** rank and username first; badges support the row, not dominate it.
- **Survey results:** community result first; "Your picks" second; trading links only if they clarify the user's next decision.

---

## Open Surface Decisions

- Homepage copy and season-aware logged-out state.
- First-trade prompt or empty-state treatment for a new active-season user.
- Contestant selector treatment inside the Trade overlay.
- Price update animation threshold and style.
- Trade result threshold for showing preview-vs-execution difference.
- Badge visual treatment with season number.
- Leaderboard "Find me" treatment when the user is outside the loaded range.
- Whether survey results should include trade-adjacent calls to action.

---

## Deeper-Layer Issues To Avoid Patching At Surface

- Anonymous survey handoff disagreement belongs to conceptual model and interaction flow first.
- All-time leaderboard scoring belongs to product strategy and conceptual model before badge/profile UI.
- If users do not trust pricing, do not solve only with more copy; revisit observed behaviour and trade interaction structure.
- If users do not care about global rank, do not over-polish leaderboard visuals; revisit the social comparison strategy.
