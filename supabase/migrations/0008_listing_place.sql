-- Bug 11 · "Selling from" per listing, and bug 10 needs no database change. Described in docs/database.md.
-- A seller with two shops can choose, for each listing, the city and shop name it is sold from.
-- Both columns are nullable: listings made before this migration have none and keep showing the seller's
-- profile city and shop name (the app decides which to show, lib/rules/seller.ts).
alter table listings add column seller_city text;
alter table listings add column seller_shop_name text;

-- Same as 0003, with one change: the listing now stores the city and shop name it was published with.
-- The profile still keeps the first city and shop name (saved the first time only, finding #82).
-- If p_city is empty the listing takes the profile's city and shop name (older callers, tests).
-- Errors are unchanged: 'version_not_found', 'city_required', 'photos_required'.
create or replace function create_listing(
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
  v_profile profiles%rowtype;
  v_city text;
  v_shop text;
begin
  if not exists (select 1 from versions where id = p_version_id) then
    raise exception 'version_not_found';
  end if;

  if p_cover_photo_url is null or p_record_photo_url is null then
    raise exception 'photos_required';
  end if;

  select * into v_profile from profiles where id = p_seller_id;

  if p_city is not null and btrim(p_city) <> '' then
    v_city := btrim(p_city);
    v_shop := nullif(btrim(coalesce(p_shop_name, '')), '');
  else
    v_city := v_profile.city;
    v_shop := v_profile.shop_name;
  end if;

  if v_city is null then
    raise exception 'city_required';
  end if;

  if v_profile.city is null then
    update profiles set city = v_city, shop_name = v_shop where id = p_seller_id;
  end if;

  insert into listings (
    seller_id, claimed_version_id, actual_version_id, condition_code, price,
    cover_photo_url, record_photo_url, matrix_photo_url, seller_city, seller_shop_name
  ) values (
    p_seller_id, p_version_id, p_version_id, p_condition_code, p_price,
    p_cover_photo_url, p_record_photo_url, p_matrix_photo_url, v_city, v_shop
  ) returning id into v_listing_id;

  insert into check_results (listing_id, item, result) values
    (v_listing_id, 'cover_label', 'uncertain'),
    (v_listing_id, 'country_year', 'uncertain'),
    (v_listing_id, 'matrix', 'uncertain');

  return v_listing_id;
end;
$$;
