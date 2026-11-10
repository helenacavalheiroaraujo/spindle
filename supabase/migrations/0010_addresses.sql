-- Bug 9 · Saved addresses on "Your account". Described in docs/database.md.
-- One delivery address and, only when it is different, one billing address per profile. No billing row means
-- "billing is the same as delivery". The checkout starts with the saved delivery address (lib/rules/shippingAddress.ts).
create table addresses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  kind text not null check (kind in ('delivery', 'billing')),
  name text not null check (btrim(name) <> ''),
  street text not null check (btrim(street) <> ''),
  postcode text not null check (postcode ~ '^[0-9]{4}-[0-9]{3}$'), -- same check as the orders table
  city text not null check (btrim(city) <> ''),
  updated_at timestamptz not null default now(),
  unique (profile_id, kind)
);

-- The browser never reads the database: RLS on, no public policies.
alter table addresses enable row level security;
