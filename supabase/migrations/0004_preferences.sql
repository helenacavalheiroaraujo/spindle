-- Phase 2 · Save to account (story 2). Described in docs/database.md.
-- One ranking per signed-in buyer. "Change" replaces it (DECISIONS · finding #11).
-- The ranking is checked in lib/rules/priorities.ts; the table only refuses what can never be valid.
create table user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  ranking text[] not null
    check (cardinality(ranking) between 1 and 4)
    check (ranking <@ array['sound', 'price', 'original', 'condition'])
);

-- The browser never reads the database: RLS on, no public policies.
alter table user_preferences enable row level security;
