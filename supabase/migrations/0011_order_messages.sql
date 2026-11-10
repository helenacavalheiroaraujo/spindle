-- Bug 8 · The buyer's message to the seller, sent from the order. Described in docs/database.md.
-- Design option A: one message per order (unique order_id). The seller reads it under the sold record in My listings.
-- Who can send (the buyer, while the order is "Paid") is checked in lib/db/messages.ts.
create table order_messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references orders (id) on delete cascade,
  body text not null check (btrim(body) <> '' and char_length(body) <= 500),
  created_at timestamptz not null default now()
);

-- The browser never reads the database: RLS on, no public policies.
alter table order_messages enable row level security;
