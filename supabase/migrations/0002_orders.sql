-- Phase 2 · Orders (story 7). Described in docs/database.md.
-- The total is calculated in lib/rules/; the amounts are stored as facts of the payment.

create type order_status as enum (
  'paid_waiting_seller',
  'seller_paid' -- used from phase 4 (buyer confirms receipt); nothing in the MVP sets it
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references profiles (id),
  listing_id uuid not null unique references listings (id),
  record_price numeric(8, 2) not null check (record_price > 0),
  shipping numeric(8, 2) not null check (shipping >= 0),
  protection_fee numeric(8, 2) not null check (protection_fee >= 0),
  total numeric(8, 2) not null,
  status order_status not null default 'paid_waiting_seller',
  ship_name text not null check (btrim(ship_name) <> ''),
  ship_street text not null check (btrim(ship_street) <> ''),
  ship_postcode text not null check (ship_postcode ~ '^[0-9]{4}-[0-9]{3}$'),
  ship_city text not null check (btrim(ship_city) <> ''),
  created_at timestamptz not null default now(),
  check (total = record_price + shipping + protection_fee)
);
create index orders_buyer_id_idx on orders (buyer_id);

-- The browser never reads the database: RLS on, no public policies.
alter table orders enable row level security;

-- Pay (story 7): marks the listing sold and creates the order, all or nothing.
-- If the listing is no longer on sale, nothing changes and the error 'listing_not_on_sale'
-- is raised ("Sorry, this record was just sold"). The record price is read from the listing;
-- shipping, protection fee and total come from lib/rules/ (the table checks the sum).
-- Called only from lib/db/ with the server key.
create function place_order(
  p_buyer_id uuid,
  p_listing_id uuid,
  p_shipping numeric,
  p_protection_fee numeric,
  p_total numeric,
  p_ship_name text,
  p_ship_street text,
  p_ship_postcode text,
  p_ship_city text
) returns uuid
language plpgsql
set search_path = public
as $$
declare
  v_price numeric(8, 2);
  v_order_id uuid;
begin
  update listings set status = 'sold'
  where id = p_listing_id and status = 'on_sale'
  returning price into v_price;

  if not found then
    raise exception 'listing_not_on_sale';
  end if;

  insert into orders (
    buyer_id, listing_id, record_price, shipping, protection_fee, total,
    ship_name, ship_street, ship_postcode, ship_city
  ) values (
    p_buyer_id, p_listing_id, v_price, p_shipping, p_protection_fee, p_total,
    p_ship_name, p_ship_street, p_ship_postcode, p_ship_city
  ) returning id into v_order_id;

  return v_order_id;
end;
$$;

revoke execute on function place_order from public, anon, authenticated;
grant execute on function place_order to service_role;
