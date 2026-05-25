# Pricing Formula & Trading Mechanics

*Working doc — evolving as decisions are made. TBDs are open questions.*

---

## Model Type

**Bonding curve** — shares are minted on buy, burned on sell. Price is a function of total shares outstanding per contestant. Players never trade with each other; all trades are against the app.

---

## Core Formula

Price uses a **square root curve** with market-wide sensitivity and a denominator floor to handle zero supply:

```
effective_total = max(total_shares_all_contestants, MIN_SUPPLY_FLOOR)
price_of_contestant_X = base_price + (K / sqrt(effective_total)) × shares_outstanding_of_X
```

- `shares_outstanding_of_X` — determines where contestant X sits on the price curve
- `total_shares_all_contestants` — sum of all per-contestant shares (derived, not separately stored)
- `MIN_SUPPLY_FLOOR` — prevents division by zero at market start; calibrated alongside K and base_price
- `K` — single tuning constant, set once, works at any player scale

At zero supply (pre-season / market start): `price_of_X = base_price` for all contestants. This is the starting price shown in the pre-season cast grid.

**Why square root:** as overall trading volume grows, market sensitivity dampens automatically. No recalibration needed between beta and launch.

**Why total-across-all (not per-contestant):** uniform market — all contestants have identical price sensitivity at any moment. Simpler, more accessible for a casual game audience. Tradeoff: no risk/reward stratification between popular and unpopular contestants (deliberate decision).

**Formula is public:** clients compute price locally from Supabase Realtime updates to `total_shares_outstanding`. The formula and constants are not secret — price is derived from public supply data. Server always recomputes at execution time; client price is display only.

### Exact trade math

**Fee ordering:** fee deducted from dollar amount first, then remaining amount buys shares.

```
effective_D = dollar_amount × (1 - fee_rate)
```

**Cost to buy `n` fractional shares** when current total supply is `T` and contestant X has `S` shares:

```
cost(n) = n × base_price + K × [2(S−T) × (√(T+n) − √T) + (2/3) × ((T+n)^(3/2) − T^(3/2))]
```

**Solving for n:** given `effective_D`, solve `cost(n) = effective_D` using binary search. No closed-form inverse exists.

**price_at_execution:** stored as average price per share: `cost(n) / n`. This is what the result screen displays.

**Sell proceeds:** mirror of buy. Given n shares to sell from supply S, total proceeds calculated with the same integral in reverse (supply decreases). Fee deducted from proceeds.

### Key variables

| Variable | Description | Value |
|----------|-------------|-------|
| `base_price` | Starting price per share (all contestants at market open) | TBD |
| `K` | Market sensitivity constant | TBD |
| `MIN_SUPPLY_FLOOR` | Denominator floor, prevents div/zero | TBD (calibrated with K) |
| `starting_balance` | Cash given to each user at season start | TBD |

---

## Supply

- **Infinite** — no cap on shares per contestant
- **Fractional** — shares are not whole numbers; players trade in dollar amounts, not share counts
- Only limiting factor on buying is the user's available cash balance
- Total shares outstanding per contestant = single source of truth; updated atomically on every trade (stored as decimal)

---

## Trade Mechanics

### Buy
- Each share is priced at the current supply level before it is minted
- Supply increments by 1 before the next share in the batch is priced
- Result: buying 10 shares costs more than 10× the price of the first share (slippage)

### Sell
- Each share sold is priced at the current supply level before it is burned
- Supply decrements by 1 before the next share in the batch is priced
- Result: selling 10 shares yields less than 10× the price of the first share sold

### Trade input UX
- Player enters a **dollar amount**, not a share count
- System displays: how many shares (fractional) that buys at current price, and the price of the first and last share in the batch
- Show total cost / total proceeds — not average price (it hides slippage)
- **At-market execution** — trade executes at whatever price exists at the moment it processes, not the price shown when the player composed the order. UI must communicate this clearly ("price may shift slightly before your trade executes")

### Trade states
All trades must have a state column from day one, even if only `filled` and `failed` are used in beta:

| State    | Description |
|----------|-------------|
| pending  | Submitted, queued, not yet processed (not used in beta — reserved for scale upgrade) |
| filled   | Processed successfully, supply and cash updated |
| failed   | Rejected — insufficient funds, or processing error |

> **Architecture note:** Beta uses optimistic locking (trades process synchronously, no queue). When scaling to thousands of concurrent users, a trade queue is added in front of Postgres and `pending` state becomes active. Schema must not change for this upgrade — only infrastructure changes.

---

## Real-time Price Updates

Price is never stored — always derived from `total_shares_outstanding`.

**Architecture: client-side derivation via Supabase Realtime**

- Supabase Realtime broadcasts row-level changes on the `contestants` table
- When a trade fills and `total_shares_outstanding` updates, all subscribed clients receive the new value instantly
- Clients compute price locally using the formula — math is simple enough to run in the browser
- Price updates happen exactly when trades happen. No server-side ticker needed.

**Why not a server-side ticker:**
- Netlify serverless functions are request-invocation based — cannot run an always-on 2–3s loop
- Client-side derivation is more accurate (instant on trade) and cheaper (no scheduled compute)

**Security:** formula and constants are not secret. Server always recomputes price at execution using its own supply data. Client price is display only — never trusted for trade execution.

---

## Infrastructure

### Beta (target: hundreds of concurrent users)
- **Trade processing:** Postgres optimistic locking via security-definer RPC (`place_trade`). Single atomic transaction: debit cash + update supply + record trade + update portfolio net_worth. Retries on conflict invisible to user.
- **Price updates:** Supabase Realtime row-level broadcast on `contestants` table. Clients derive price locally.
- **Leaderboard net_worth:** refreshed by Supabase pg_cron every 60 seconds. Explicitly ~60s stale — acceptable for a game.
- **No queue required**

### Scale upgrade path (thousands of concurrent users)
- Add a trade queue in front of Postgres (Redis or equivalent)
- Trades move from synchronous to async: submit → pending → filled
- UI surfaces the pending state (already in schema)
- Price update mechanism unchanged (still Realtime + client-side derivation)
- **Schema does not change** — only infrastructure changes

---

## User Portfolio Stats

| Stat          | Definition |
|---------------|------------|
| Cash balance  | Available to trade immediately |
| Net worth     | Cash + what you'd receive if you sold 100% of all holdings simultaneously |
| Holdings      | Per-contestant: shares held, avg purchase price, current liquidation value, unrealised P&L |

> Net worth = cash + sum of liquidation values across all positions. Liquidation value for a position = actual sell proceeds at current supply (accounts for price impact of selling the full position at once). Not `shares × current_price`.

---

## Transaction Fee

- A small % fee applied to every trade (buy and sell)
- Fake money — fee is destroyed, does not go anywhere
- Primary purpose: makes wash trading / multi-account exploits unprofitable
- Secondary effect: discourages frivolous micro-trades
- **Fee %: TBD**

---

## Anti-Exploit

### Structural (fee-based)
Transaction fee makes pump-and-dump across multiple accounts unprofitable by default. To profit: price movement must exceed 2× fee across both accounts.

### Supplemental (TBD — to be layered on top)
- Phone/identity verification (one account per person)
- IP flagging (soft signal, not hard block)
- Rate limiting on trade frequency

---

## Contestant States

| State    | Trading allowed | Notes |
|----------|----------------|-------|
| Active   | Yes            | Normal market |
| Evicted  | Yes            | Market self-corrects via natural sell pressure |
| Re-entered | Yes          | No special pricing — market re-adjusts naturally |

> Eviction is an attribute, not a market event. No price zeroing, no trading halt.

---

## Open Questions

- [ ] base_price value
- [ ] increment value — needs to be tuned so price movement feels meaningful but not runaway
- [ ] starting_balance — must be calibrated against base_price and increment together
- [ ] Transaction fee %
- [x] Fractional shares — yes, fluid (dollar-amount-first, not share-count-first)
- [x] Price ceiling — not needed; fractional shares solves the access problem
- [ ] How is liquidation value computed in real time at scale without hammering the DB?
- [ ] Concurrent trade handling — how do we ensure total_shares_outstanding is updated atomically?
- [x] Price curve — square root, market-wide sensitivity (uniform market, not per-contestant)
- [x] Auto-scaling — formula self-regulates with trading volume, no recalibration between seasons
