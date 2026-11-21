-- Story 39 · Cancel an order while it is "Paid". Described in docs/database.md.

-- A third status. Nothing in this file compares against 'cancelled' outside the function body:
-- a new enum value cannot be used in the same transaction that adds it.
alter type order_status add value 'cancelled';

-- One order per listing becomes one order that is not cancelled per listing:
-- a cancelled record goes back on sale and can be bought again.
alter table orders drop constraint orders_listing_id_key;
create unique index orders_one_live_order_per_listing
  on orders (listing_id)
  where status in ('paid_waiting_seller', 'seller_paid');

-- Cancel (story 39): the order becomes 'cancelled' and its listing goes back on sale, all or nothing.
-- Only the buyer's own order, and only while it is 'paid_waiting_seller'; otherwise nothing changes and the
-- error 'order_not_cancellable' is raised ("This order can no longer be cancelled."). The refund is simulated:
-- nothing is stored for it, the amounts stay on the order.
-- Called only from lib/db/ with the server key.
create function cancel_order(p_buyer_id uuid, p_order_id uuid) returns void
language plpgsql
set search_path = public
as $$
declare
  v_listing_id uuid;
begin
  update orders set status = 'cancelled'
  where id = p_order_id and buyer_id = p_buyer_id and status = 'paid_waiting_seller'
  returning listing_id into v_listing_id;

  if not found then
    raise exception 'order_not_cancellable';
  end if;

  update listings set status = 'on_sale'
  where id = v_listing_id and status = 'sold';
end;
$$;

revoke execute on function cancel_order from public, anon, authenticated;
grant execute on function cancel_order to service_role;
