# Admin recipes (Claude-orchestrated)

*Operations that don't have a UI in the app — driven by Claude with the Supabase MCP tools.*

The everyday admin work (managing contestants, building surveys, driving season status transitions) lives in `/admin/*` as a real UI. **Two things stay outside the app**, because they happen rarely enough that a polished form would be a poor ROI:

1. **Bootstrapping a new season + initial contestants** — once per ~3 months
2. **Bulk contestant operations** — rarely needed; ad-hoc when it is

Both are handled by asking Claude in this repo's session: "Set up Big Brother 28 from <CBS URL>." Claude reads the source, extracts structured data, and writes the rows via the Supabase MCP.

---

## Recipe 1 — Bootstrap a new season from a source URL

**When the user says:** *"Set up Big Brother 28, here's the CBS cast page: <url>"*

### Step 1 — Confirm the season number is unused

```sql
select id, name, status::text from seasons order by created_at desc;
```

If a season with this number already exists, ask the user whether they want to overwrite it (rare).

### Step 2 — Insert the season row

```sql
insert into seasons (name, status, start_date, end_date, starting_balance, k_constant, base_price)
values (
  'Big Brother 28',          -- match the format of past names (numbers, not roman numerals)
  'setup',                    -- always start here; the admin transitions forward in the UI
  '<premiere date>',          -- YYYY-MM-DD; from the source page
  '<finale date or estimate>',-- YYYY-MM-DD; the admin can adjust later
  1000.00,                    -- starting_balance — DEFAULT unless the user says otherwise
  0.50,                       -- k_constant — see docs/pricing-formula.md
  1.00                        -- base_price — see docs/pricing-formula.md
)
returning id;
```

> **Pricing defaults**: `1000 / 0.50 / 1.00` are the values used for BB27 (see `supabase/seed.sql`). Only change them if the user explicitly tells you to. Once the season's status goes to `active`, the DB trigger blocks any further writes to these columns — so getting them right at insert time matters.

### Step 3 — Scrape the cast page

Use `WebFetch` against the source URL. CBS pages typically have a structured list of cast members with:
- **name** (full name, "First Last")
- **bio** (short paragraph — keep ≤300 chars, trim if longer)
- **photo URL** (direct image link; verify it's accessible)

If the source is messy (Wikipedia, Reddit roster posts), normalize aggressively. **Show the user the extracted list before inserting** and ask if any names look wrong.

### Step 4 — Insert contestants

```sql
insert into contestants (season_id, name, photo_url, bio, status, total_shares_outstanding)
values
  ('<season_id>', 'Janelle Pierzina', 'https://…', 'BB legend returning for one more run.', 'active', 0),
  ('<season_id>', 'Angela Rummans',  'https://…', 'Former athlete known for cold strategic gameplay.', 'active', 0),
  -- …one row per cast member…
;
```

> **`total_shares_outstanding = 0`** at season start. The bonding curve starts here; users buying shares moves it up.
>
> **`status = 'active'`** for everyone. Evictions get tracked through the admin UI later.

### Step 5 — Hand back to the admin

Confirm the count and the season id. The admin then opens `/admin/seasons/<id>` to drive the status transitions when they're ready.

---

## Recipe 2 — End a season + publish results

The admin can do this entirely through `/admin/seasons/<id>` — but documenting the SQL path for clarity / emergency recovery.

### Step 1 — Verify the season is in `ended` state

```sql
select status::text from seasons where id = '<season_id>';
-- must return 'ended'
```

If it's still `active`, the admin needs to end it first via the UI (or `update seasons set status = 'ended' where id = ...`).

### Step 2 — Publish results

```sql
select publish_season_results('<season_id>');
```

This function (defined in `0007_season_management.sql`) is transactional. It:
- Refreshes `portfolios.net_worth` one final time
- Snapshots `season_results` (one row per user with `final_rank` + `final_net_worth`)
- Awards `top_10` badges to ranks 1–10 and `top_3` badges to ranks 1–3
- Flips `seasons.status` to `'results_published'`

Idempotent — safe to re-run; the `ON CONFLICT DO NOTHING` clauses prevent duplicates. But it will refuse if status isn't `ended`.

---

## Recipe 3 — Why some pricing edits fail

When the admin tries to change `starting_balance`, `k_constant`, or `base_price` on an active+ season, the DB trigger raises a `check_violation`:

> Pricing constants are locked once a season goes active

This is the **load-bearing safety rail** for CLAUDE.md's hard rule: pricing constants are permanently immutable once trading opens. The trigger fires on `BEFORE UPDATE` to `seasons` and rejects any change to those three columns when `OLD.status IN ('active','ended','results_published')`. The admin UI hides the fields, but the trigger backstops any other write path — Claude included.

**There's no override.** If a pricing constant truly needs to change, that's a new season.

---

## Recipe 4 — Local seed reset (development only)

Not season-specific but adjacent: if local state gets messy during testing,

```bash
supabase db reset --local
```

re-applies all migrations + `seed.sql`. The seed has BB27 with 10 contestants and 4 surveys (one in each state). **Never run on staging or production.**
