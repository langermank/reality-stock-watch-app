# User Needs — Reality Stock Watch

*Created: 2026-06-11. Framework: Layers of Product Design. Source: current docs plus `docs/design/observed-behaviour.md`.*

This document interprets observed behaviour and domain knowledge into candidate user needs. Because direct research for the current 24/7 version is not yet documented, most needs are **Inferred** or **Assumed**. Upgrade confidence only when supported by interviews, usability observation, analytics, or other direct evidence.

---

## Primary User Situation

The primary user is a hardcore Big Brother fan in or near the RHAP community, during an active BB US season, who is following changing game information and wants a low-stakes way to act on, compare, and show their read of the season.

Secondary situations:

- A logged-out fan follows a public survey link and may not know the trading game exists.
- A returning user checks whether their read, portfolio, or leaderboard position changed.
- An admin/producer creates the conditions for weekly fan participation and livestream reveal moments.

---

## Priority Needs

| Need | Type | Confidence | Why it matters |
|------|------|------------|----------------|
| Act on a changing read quickly. | Functional | Inferred | This is the core trading loop: a fan sees new game information and wants to turn that opinion into a stake before the moment passes. |
| Trust that market movement is fair enough. | Emotional | Assumed | The bonding curve is central but abstract. If price shifts feel arbitrary, users may not trust wins, losses, or leaderboard rank. |
| See whether my read is paying off. | Functional / emotional | Inferred | Portfolio value, holdings, trade history, and contestant movement answer whether a user's judgement is working. |
| Compare myself with other fans. | Social | Inferred | Leaderboard, rank, badges, and public identity depend on this need being real. |
| Share or defend my take in community context. | Social | Assumed | Discord/RHAP bragging is a likely motivation, but the exact shareable unit is not validated. |
| Participate in weekly fan opinion rituals. | Social / emotional | Assumed | Surveys and livestream reveal may deepen engagement if users see them as part of the same fandom loop. |
| Join without heavy explanation. | Functional / emotional | Inferred | The audience likely knows BB, but the app still needs to reduce signup and first-trade friction. |

---

## Candidate Job Stories

### Trading

| Job story | Confidence |
|-----------|------------|
| When new BB information changes my read on a contestant, I want to act on that read quickly, so I can feel like I got in before the rest of the fandom catches up. | Inferred |
| When a price has already moved, I want to understand what changed, so I can decide whether the contestant still feels worth buying or selling. | Assumed |
| When I place a trade, I want clear feedback about what actually executed, so I can trust the result even if the preview changed. | Inferred |
| When I am wrong about a contestant, I want to see the consequence plainly, so I can decide whether to hold, sell, or double down. | Assumed |

### Portfolio And Leaderboard

| Job story | Confidence |
|-----------|------------|
| When I check back after game news or an episode, I want to see whether my portfolio moved, so I can tell if my reads are working. | Inferred |
| When I want to compare myself with other fans, I want to find my rank quickly, so I can feel the competition without scanning a huge list. | Inferred |
| When I finish high in a season, I want a visible record of that result, so I can carry proof of a good season into future games. | Assumed |
| When I am not near the top, I still want a meaningful comparison point, so the leaderboard does not feel irrelevant. | Assumed |

### Surveys And Reveal

| Job story | Confidence |
|-----------|------------|
| When a weekly survey drops, I want to record my take on the season, so I can compare my read with the community later. | Inferred |
| When results are published, I want to see how the community ranked contestants, so I can understand whether my read is mainstream or contrarian. | Inferred |
| When survey rankings are revealed live, I want the reveal to feel like an event, so fan opinion becomes something worth watching together. | Assumed |
| When I answer anonymously from a public link, I want the experience to be lightweight, so I can participate without committing to the full app. | Inferred |

### Onboarding And Trust

| Job story | Confidence |
|-----------|------------|
| When I first arrive from the RHAP community, I want to understand the basic promise immediately, so I can decide whether it is worth signing up. | Inferred |
| When I create an account, I want a low-friction identity that still feels shareable, so I can participate without fussing over profile setup. | Inferred |
| When I see fake money and market language, I want reassurance that there is no real-money risk, so the game stays fun rather than stressful. | Assumed |
| When I encounter a failed or changed trade, I want the app to explain what happened in plain language, so I do not feel tricked by the system. | Inferred |

---

## Needs Not Yet Prioritized

These needs have surfaced but should not drive strategy until validated or deliberately chosen:

- Follow specific contestants independent of holdings.
- Receive price alerts beyond survey-related push notifications.
- Compare against friends or known RHAP community members rather than the whole leaderboard.
- Show a public profile with best trades, badges, and season history.
- Carry anonymous survey participation into a new account.
- Understand the precise pricing formula rather than the practical consequences of trading.

---

## Contradictions To Watch

- **Urgency vs. 24/7 availability:** An always-open market removes friction but may also reduce the event-like pressure that makes participation exciting.
- **Finance metaphor vs. casual fandom:** Market mechanics create competition, but too much finance language can make the game feel colder or less accessible.
- **Anonymous participation vs. account-based identity:** Surveys invite broad lightweight participation; trading and leaderboards require persistent identity.
- **Community comparison vs. global leaderboard:** Users may care more about known social circles than anonymous rank.
- **Explainability vs. speed:** Users want to act quickly, but at-market execution and bonding-curve movement require enough feedback to preserve trust.

---

## Research Gaps

- Which candidate jobs are actually frequent and important for RHAP users?
- Which social comparison object matters most: rank, badge, portfolio value, best trade, or prediction accuracy?
- Does the weekly survey loop reinforce trading, or does it serve a separate fan ritual?
- How much pricing explanation is enough for trust?
- What makes a returning user open the app between episodes?

---

## Handoff To Product Strategy

The product strategy pass should choose which of these needs v1 will optimize for. A reasonable provisional bet is:

> Help BB fans act on changing reads and compare those reads socially, with enough market feedback to make results feel fair.

That is still a strategic assumption until supported by observed behaviour.
