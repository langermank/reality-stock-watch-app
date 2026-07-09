# Observed Behaviour — Reality Stock Watch

*Created: 2026-06-11. Framework: Layers of Product Design. Mode: partial synthesis, then research plan.*

This layer records what we know, infer, and still assume about how users behave. It should stay close to evidence. Product conclusions belong in user needs or strategy docs.

---

## Evidence Inventory

| Evidence | Confidence | What it suggests | Limits |
|----------|------------|------------------|--------|
| Prior version of the game had trading windows. | Observed from project history | Trading windows created enough friction that 24/7 trading is a deliberate replacement. | This was a different product model: windows plus audience-rating-based pricing, not a 24/7 bonding-curve market. |
| Prior app had load and data-volume problems. | Observed from project history | Infrastructure cost and scale constraints should shape v1 choices. | This explains operational risk, not user motivation. |
| Target audience is hardcore BB US fans, especially RHAP community. | Inferred from product brief | Users likely understand BB states, weekly cadence, live-feed discourse, and social comparison around reads. | Audience knowledge is not the same as product behaviour. |
| Existing flow docs assume social competition and Discord bragging matter. | Assumed | Leaderboards, badges, public profile, and shareable stats may be important loops. | No direct research yet confirms which social mechanics are motivating. |
| Weekly surveys and livestream reveal have been built into the product surface. | Observed in repo | Survey/result participation may be a major engagement loop beyond trading. | It is not yet clear whether users connect survey results to the trading game. |
| Current implementation supports live price updates and at-market trades. | Observed in repo | Users will encounter price movement as a real-time, possibly trust-sensitive interaction. | No usability evidence yet shows whether users understand or trust the bonding curve. |

---

## Current Behavioural Assumptions

| Assumption | Confidence | Why it matters |
|------------|------------|----------------|
| RHAP users want to put their reads on the line, not just discuss them. | Inferred | This justifies the trading game as more than a companion stats app. |
| Users will tolerate or enjoy a market that is always open. | Assumed | If wrong, 24/7 trading could reduce urgency or create anxiety instead of engagement. |
| A fake-money bonding curve will feel fair enough if explained through UI feedback. | Assumed | If wrong, price movement may feel arbitrary and undermine trust. |
| Leaderboard rank and badges are motivating enough to drive return visits. | Assumed | This affects whether all-time ranking, badges, and profile work should get priority. |
| Survey participation and result reveal reinforce the core game loop. | Assumed | If they are separate behaviours, survey/reveal work may need different success measures. |
| Discord/RHAP sharing is a natural extension of use. | Assumed | This affects whether share cards, public profiles, and bragging affordances matter in v1. |

---

## Learning Goals

The next observed-behaviour work should answer these questions:

1. **Trading trigger:** What moment makes a BB fan want to act: episode result, live-feed spoiler, RHAP discussion, social pressure, price movement, or survey result?
2. **Market trust:** What does a user need to see before they believe a trade price is fair and understandable?
3. **Return loop:** What brings a user back after their first trade: checking prices, changing reads, leaderboard position, survey results, push notifications, or community conversation?
4. **Social proof:** What do users naturally want to share, if anything: rank, portfolio value, best trade, contestant prediction, badge, survey take?
5. **Survey relationship:** Do users experience weekly surveys as part of the market game, or as a parallel RHAP/community ritual?

---

## Recommended Research Plan

### 1. JTBD Interviews With RHAP/BB Users

Interview 6-10 likely users. Anchor each conversation in a real past behaviour, not hypothetical interest.

Useful prompts:

- Tell me about the last time you changed your mind about a Big Brother contestant.
- What triggered that change?
- Where did you talk about it or check whether other fans agreed?
- Have you ever kept score, made predictions, joined a pool, ranked contestants, or compared reads with friends?
- What made that fun, frustrating, or worth repeating?
- When a fan game asks you to sign up, what makes it feel worth it?

Capture one observation per note, tagged to the learning goal it speaks to. Use raw quotes where possible.

### 2. Usability Observation On Current Build

Give users a small set of tasks in the existing app:

- Join or log in.
- Find a contestant they believe is undervalued.
- Place a buy trade.
- Explain what happened to the price after the trade.
- Find their holding and leaderboard position.
- Take or review a survey if one is active.

Watch for confusion, hesitation, missed affordances, and trust breaks. Do not explain the product unless the task depends on information not yet in the UI.

### 3. Beta Analytics

Instrument events that map to behaviour, not vanity traffic:

- Account created.
- Username confirmed.
- First market view.
- Contestant detail viewed.
- Trade sheet opened.
- Trade submitted.
- Trade filled or failed.
- Portfolio viewed after trade.
- Leaderboard viewed.
- Survey submitted.
- Survey results viewed.
- Push subscription accepted or declined.

Pair analytics with qualitative notes. Analytics can show where users drop off, but not why.

---

## Candidate Observations To Validate

These are not findings yet. Treat them as prompts for research.

- Users may trade immediately after live-feed events rather than episode broadcasts.
- Users may care more about beating known community members than climbing a global leaderboard.
- Users may not need to understand the full bonding-curve formula, but they need to understand that buying moves price and selling can move proceeds.
- Users may treat surveys as social proof for trades: "the community is underrating this contestant."
- Users may want receipts for good reads, not just final-season badges.

---

## Research Gaps

- No direct interviews with current target users are documented.
- No usability observations of the current trade flow are documented.
- No beta analytics plan is documented outside implementation-level event possibilities.
- No evidence yet ranks trading, leaderboard, survey, livestream reveal, and Discord sharing as engagement loops.
- No evidence yet shows whether users understand "Contestant" as the tradeable object without the word "stock."

---

## Handoff To User Needs

The next `/layers-user-needs` pass should use this artifact to turn validated or high-confidence observations into candidate job stories. Until research exists, job stories should be marked **Assumed** or **Inferred**, not **Observed**.
