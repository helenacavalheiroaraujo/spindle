-- Phase 5 · Cart (story 20). Described in docs/database.md.
-- The cart belongs to the account (buyer = profile). A record cannot be in the same cart twice; the same record
-- can be in two buyers' carts (nothing is reserved: story 20 · Out of scope). The rules about who can add are in
-- lib/rules/cartAccess.ts and are checked in lib/db/cart.ts.
create table cart_items (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references profiles (id),
  listing_id uuid not null references listings (id),
  created_at timestamptz not null default now(),
  unique (buyer_id, listing_id)
);
create index cart_items_buyer_id_idx on cart_items (buyer_id);

-- The browser never reads the database: RLS on, no public policies.
alter table cart_items enable row level security;

-- Pay for the whole cart (story 20): marks each listing sold and creates one order per record, all or nothing.
-- If any listing is no longer on sale, nothing changes and the error 'listing_not_on_sale' is raised (the cart
-- screen then drops that record with a message). p_items is a list of {listing_id, total}: the total of each
-- record is calculated in lib/rules/ (the orders table checks that it is price + shipping + protection fee).
-- The paid records leave the buyer's cart in the same step. Returns the new order ids.
-- Called only from lib/db/ with the server key.
create function place_orders(
  p_buyer_id uuid,
  p_items jsonb,
  p_shipping numeric,
  p_protection_fee numeric,
  p_ship_name text,
  p_ship_street text,
  p_ship_postcode text,
  p_ship_city text
) returns uuid[]
language plpgsql
set search_path = public
as $$
declare
  v_item jsonb;
  v_price numeric(8, 2);
  v_order_id uuid;
  v_ids uuid[] := '{}';
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'no_items';
  end if;

  for v_item in select * from jsonb_array_elements(p_items) loop
    update listings set status = 'sold'
    where id = (v_item ->> 'listing_id')::uuid and status = 'on_sale'
    returning price into v_price;

    if not found then
      raise exception 'listing_not_on_sale';
    end if;

    insert into orders (
      buyer_id, listing_id, record_price, shipping, protection_fee, total,
      ship_name, ship_street, ship_postcode, ship_city
    ) values (
      p_buyer_id, (v_item ->> 'listing_id')::uuid, v_price, p_shipping, p_protection_fee, (v_item ->> 'total')::numeric,
      p_ship_name, p_ship_street, p_ship_postcode, p_ship_city
    ) returning id into v_order_id;

    v_ids := v_ids || v_order_id;
  end loop;

  delete from cart_items
  where buyer_id = p_buyer_id
    and listing_id in (select (e ->> 'listing_id')::uuid from jsonb_array_elements(p_items) e);

  return v_ids;
end;
$$;

revoke execute on function place_orders from public, anon, authenticated;
grant execute on function place_orders to service_role;
