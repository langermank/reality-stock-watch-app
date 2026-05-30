# Database migrations — how we apply schema changes

*The one repeatable process for getting schema changes into staging and production, and how to recover when migration history drifts.*

---

## Decision (2026-05-30): the CLI is the source of truth

**Schema changes are applied with the Supabase CLI (`supabase db push`) only. The Supabase MCP tools are read-only for us — `execute_sql` / `list_migrations` for inspection and verification, never `apply_migration` for shipping schema.**

Why CLI, not MCP:

- **Git is the source of truth.** `supabase/migrations/*.sql` is the canonical, reviewed list. `db push` applies exactly what is in the repo, in filename order. Nothing reaches a database that isn't in a PR.
- **Reproducible across environments.** The same push against staging then production produces identical schema. No "did someone remember to run it on prod?" — which is exactly the bug that took the leaderboard down (see incident below).
- **CI-able.** A push step on merge to `main` keeps prod from silently falling behind the repo.
- **History matches the repo.** The CLI keys migration history on the numeric filename version (`0005`). `apply_migration` keys it on a **timestamp** with the filename in the `name` field (`20260530184139` / `0005_leaderboard_read`). Mixing the two makes `db push` think `0005` was never applied and try to re-run it — which fails because the objects already exist.

MCP is still useful — for read-only verification, ad-hoc inspection, and advisors. Just not for applying DDL.

---

## Standard workflow

```
write migration → push to staging → verify → push to production
```

1. **Author** the migration as the next numbered file:

   ```
   supabase/migrations/0007_my_change.sql
   ```

   Filenames are `NNNN_snake_case.sql`, strictly increasing. The `NNNN` prefix is the migration *version* the CLI tracks.

2. **Test locally** (`supabase db reset` applies all migrations + seed cleanly).

3. **Push to staging:**

   ```bash
   supabase login                                    # once per machine
   supabase link --project-ref hiixtdkkezjhbnqmgivd  # staging
   supabase db push --linked
   ```

   `db push` only applies migrations whose version is not already in the target's history, in order. Re-running it when everything is applied is a no-op.

4. **Production is automatic.** On merge to `main`, the `Deploy DB migrations (production)` GitHub Action (`.github/workflows/db-push.yml`) runs `supabase db push` against prod. You don't push to prod by hand — that's the whole point (it's why the leaderboard incident below could happen). To apply by hand in an emergency, link prod and `supabase db push --linked`.

   The workflow needs these repository secrets (scoped to a `production` environment):

   | Secret | Value |
   |--------|-------|
   | `SUPABASE_ACCESS_TOKEN` | A Supabase access token for CI (`supabase login` → access tokens, or a service account) |
   | `SUPABASE_PROD_DB_PASSWORD` | The production database password |

   The prod project ref (`avakcpjthtrmeswgjlxz`) is hardcoded in the workflow — it isn't a secret.

5. **Verify** with a read-only check (MCP `execute_sql` or `supabase db query --linked`), e.g.:

   ```sql
   select to_regprocedure('public.get_leaderboard(uuid,int,int,text)') is not null;
   ```

### Project references

| Environment | Project ref | Name |
|-------------|-------------|------|
| Staging | `hiixtdkkezjhbnqmgivd` | `rsw-staging` |
| Production | `avakcpjthtrmeswgjlxz` | `rsw-production` |

### Production / not-ready migrations

A migration only reaches prod when its file is on `main` **and** you push. Feature work that isn't prod-ready (e.g. the livestream-reveal `0006`) stays on its branch; prod's history simply won't contain it until the PR merges and someone pushes. Don't apply such a migration to prod out-of-band.

---

## Recovery: reconciling drifted migration history

Symptom: `supabase db push` tries to re-run a migration that's already applied (it fails because the objects exist), or `supabase migration list --linked` shows a remote version that doesn't match the repo's `NNNN` prefix (e.g. a timestamp like `20260530184139`). This happens when a migration was applied via `apply_migration` or the dashboard instead of the CLI.

Fix: make the remote history use the repo's numeric versions. **This edits only the bookkeeping table (`supabase_migrations.schema_migrations`) — it does not run or revert any DDL.** The schema objects already exist; you're only correcting the record of what's applied.

**Preferred — Supabase CLI:**

```bash
supabase link --project-ref <ref>
# mark the numeric version as applied (does NOT run the SQL):
supabase migration repair --status applied 0005 --linked
# drop the stray timestamp row that apply_migration created:
supabase migration repair --status reverted 20260530184139 --linked
supabase migration list --linked   # confirm only numeric versions remain
```

**Equivalent — direct SQL** (what to use if the CLI isn't linked; run via MCP `execute_sql` or `db query`). `name` follows the `0001–0004` convention of the suffix after the numeric prefix:

```sql
begin;
insert into supabase_migrations.schema_migrations (version, name)
values ('0005', 'leaderboard_read')
on conflict (version) do nothing;
delete from supabase_migrations.schema_migrations
where version = '20260530184139' and name = '0005_leaderboard_read';
commit;
```

Then confirm the history is clean (numeric versions only, one row per migration) and that a `db push` reports nothing to apply.

---

## Incident record — 2026-05-30: leaderboard 500s in production

**What happened.** PR #40 added `supabase/migrations/0005_leaderboard_read.sql` (the `get_leaderboard` / `get_user_rank` / `leaderboard_badges` SECURITY DEFINER RPCs). The PR merged, but the migration was never applied to production — both projects' tracked history stopped at `0004`. The production leaderboard page called RPCs that didn't exist and errored.

**Fix.**
1. Applied `0005_leaderboard_read.sql` to prod (verified the three functions exist afterward). `0006` was deliberately **not** applied — not prod-ready.
2. Reconciled migration history on both projects: `0005` (and `0006` on staging) had been recorded under timestamp versions by `apply_migration`; replaced them with numeric `0005`/`0006` rows so `db push` is clean going forward.

Final state: prod history = `0001–0005` (matches `main`), staging history = `0001–0006` (matches the feature branch).

**Root cause.** Migrations were applied inconsistently (and one environment was missed entirely) because there was no single, enforced apply path. Hence the decision at the top of this doc, and the `db push` CI step (`.github/workflows/db-push.yml`) added afterward so prod can't fall behind `main` again.
