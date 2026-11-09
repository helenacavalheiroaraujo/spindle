-- Phase 4 · Rate the seller (story 18). Described in docs/database.md.
-- One review per order: the buyer rates the seller of a "Seller paid" order. The rule that only that buyer can
-- review is checked in lib/db/reviews.ts; the table refuses what can never be valid and a second review of an order.
-- order_id is empty for the illustrative reviews in the seed (the seed sellers have no real orders).
create table reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid unique references orders (id),
  seller_id uuid not null references profiles (id),
  rating smallint not null check (rating between 1 and 5),
  created_at timestamptz not null default now()
);
create index reviews_seller_id_idx on reviews (seller_id);

-- The browser never reads the database: RLS on, no public policies.
alter table reviews enable row level security;
