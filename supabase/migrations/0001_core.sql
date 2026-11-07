-- Phase 1 · Core tables (stories 1, 2, 3, 5, 6). Described in docs/database.md.
-- Judgements (traffic light, active listing, scores, price label) are calculated in lib/rules/, never stored.

create type criterion as enum ('sound', 'price', 'original', 'condition');
create type listing_status as enum ('on_sale', 'sold', 'removed');
create type check_item as enum ('cover_label', 'country_year', 'matrix');
create type check_result as enum ('match', 'uncertain', 'no_match');

create table albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text not null,
  release_year integer not null,
  cover_url text not null
);

create table versions (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references albums (id) on delete cascade,
  name text not null,
  release_year integer not null,
  country text not null,
  label text not null,
  format text not null,
  sound_score integer not null check (sound_score between 1 and 5),
  original_score integer not null check (original_score between 1 and 5),
  rating_count integer not null default 0 check (rating_count >= 0),
  typical_price_min numeric(8, 2),
  typical_price_max numeric(8, 2),
  check (
    (typical_price_min is null and typical_price_max is null)
    or (typical_price_min > 0 and typical_price_min <= typical_price_max)
  )
);
create index versions_album_id_idx on versions (album_id);

create table tracks (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references versions (id) on delete cascade,
  position text not null,
  title text not null,
  is_extra boolean not null default false,
  unique (version_id, position)
);

create table reason_texts (
  version_id uuid not null references versions (id) on delete cascade,
  criterion criterion not null,
  sentence text not null,
  primary key (version_id, criterion)
);

create table glossary_terms (
  term text primary key,
  explanation text not null
);

create table condition_grades (
  code text primary key,
  name text not null unique,
  explanation text not null,
  sort_order integer not null unique
);

insert into condition_grades (code, name, explanation, sort_order) values
  ('NM',  'Near mint', 'Almost like new, no marks', 1),
  ('VG+', 'Very good', 'Light signs of wear', 2),
  ('VG',  'Good',      'Visible wear and some audible noise', 3),
  ('G',   'Fair',      'Heavily played, noticeable noise', 4);

create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users (id) on delete cascade,
  name text not null,
  city text,
  shop_name text
);

create table listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references profiles (id),
  claimed_version_id uuid not null references versions (id),
  actual_version_id uuid not null references versions (id),
  condition_code text not null references condition_grades (code),
  price numeric(8, 2) not null check (price > 0),
  status listing_status not null default 'on_sale',
  cover_photo_url text,
  record_photo_url text,
  matrix_photo_url text,
  created_at timestamptz not null default now()
);
create index listings_claimed_version_id_idx on listings (claimed_version_id);
create index listings_actual_version_id_idx on listings (actual_version_id);

create table check_results (
  listing_id uuid not null references listings (id) on delete cascade,
  item check_item not null,
  result check_result not null,
  primary key (listing_id, item)
);

-- The browser never reads the database: RLS on, no public policies.
-- Only the app's server code (lib/db/) reads and writes.
alter table albums enable row level security;
alter table versions enable row level security;
alter table tracks enable row level security;
alter table reason_texts enable row level security;
alter table glossary_terms enable row level security;
alter table condition_grades enable row level security;
alter table profiles enable row level security;
alter table listings enable row level security;
alter table check_results enable row level security;
