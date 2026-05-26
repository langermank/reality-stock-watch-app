-- ============================================================
-- Reality Stock Watch — Username constraints
-- Switches username uniqueness to case-insensitive and adds
-- a format CHECK so the DB enforces what the app validates.
-- ============================================================

-- Drop the column-level UNIQUE constraint (auto-named *_key)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_username_key;

-- Case-insensitive unique index replaces it
-- (lower() means "Katie" and "katie" cannot both exist)
CREATE UNIQUE INDEX profiles_username_lower_idx ON profiles (lower(username));

-- Format CHECK: starts with letter, alphanumeric + underscores, 3–20 chars,
-- no consecutive underscores. Mirrors lib/username.ts rules.
ALTER TABLE profiles ADD CONSTRAINT profiles_username_format CHECK (
  username ~ '^[a-zA-Z][a-zA-Z0-9_]{2,19}$'
  AND username !~ '__'
);
