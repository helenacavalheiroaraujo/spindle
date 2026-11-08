-- Phase 3 · Sell (story 8). Described in docs/database.md.
-- No new tables: listings, check_results and profiles already hold what selling needs.
-- The price rule and the price label are calculated in lib/rules/; the table only refuses what can never be valid.

-- Price rule (story 8 · finding #79): above €0 (already checked), at most €1000.
-- numeric(8, 2) keeps 2 decimals; the app refuses more before saving.
alter table listings add constraint listings_price_max check (price <= 1000);

-- Listing photos (story 8). Public bucket: a photo is read through its link, like the seed photos.
-- The browser reduces each photo before sending (DECISIONS · story 8); the app's server code uploads it
-- with the server key, so no storage policies are needed. 5 MB per file, images only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-photos', 'listing-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

-- Publish (story 8): creates the listing and its three check results, all or nothing.
-- The first time, it also saves the seller's city and optional shop name; once saved, they are not changed
-- (finding #82). Errors (the app turns each into a message):
--   'version_not_found'  → "This version isn't in our catalogue yet"
--   'city_required'      → first listing without a city
--   'photos_required'    → cover or record photo missing
-- Claimed = actual for new listings; every check is "uncertain", so a new listing is yellow (story 5).
-- Called only from lib/db/ with the server key.
create function create_listing(
  p_seller_id uuid,
  p_version_id uuid,
  p_condition_code text,
  p_price numeric,
  p_cover_photo_url text,
  p_record_photo_url text,
  p_matrix_photo_url text,
  p_city text,
  p_shop_name text
) returns uuid
language plpgsql
set search_path = public
as $$
declare
  v_listing_id uuid;
begin
  if not exists (select 1 from versions where id = p_version_id) then
    raise exception 'version_not_found';
  end if;

  if p_cover_photo_url is null or p_record_photo_url is null then
    raise exception 'photos_required';
  end if;

  if (select city from profiles where id = p_seller_id) is null then
    if p_city is null or btrim(p_city) = '' then
      raise exception 'city_required';
    end if;
    update profiles
    set city = btrim(p_city), shop_name = nullif(btrim(coalesce(p_shop_name, '')), '')
    where id = p_seller_id;
  end if;

  insert into listings (
    seller_id, claimed_version_id, actual_version_id, condition_code, price,
    cover_photo_url, record_photo_url, matrix_photo_url
  ) values (
    p_seller_id, p_version_id, p_version_id, p_condition_code, p_price,
    p_cover_photo_url, p_record_photo_url, p_matrix_photo_url
  ) returning id into v_listing_id;

  insert into check_results (listing_id, item, result) values
    (v_listing_id, 'cover_label', 'uncertain'),
    (v_listing_id, 'country_year', 'uncertain'),
    (v_listing_id, 'matrix', 'uncertain');

  return v_listing_id;
end;
$$;

revoke execute on function create_listing from public, anon, authenticated;
grant execute on function create_listing to service_role;
