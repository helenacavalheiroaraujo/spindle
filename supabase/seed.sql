-- Illustrative data for the MVP demo and tests (Assignment 1, p. 12). Not real catalogue data.
-- Described in docs/database.md. Condition grades are created by migration 0001, not here.
-- Running this file again resets the demo data: it empties the seeded tables first.
--
-- What the data covers:
--   Story 1: "ziggy", "bowie" (newest first), "bjork" -> "Björk", "zigy" suggestion, "No listings".
--   Let's Dance has only a sold listing -> "No listings" (active listings only).
--   Ziggy Stardust is the only album with active listings and full story 3/5/6 data:
--     1990 Reissue   lowest active €24 -> price score 5, sound 2
--     2012 Remaster  lowest active €32 -> price score 4, sound 5  ("1. Price, 2. Sound": 22 vs 19)
--     1972 UK original has no active listing: its only listing is red and counts for the 1990 Reissue
--     (shown there yellow, "Moved here"), so the "ideal but unavailable" note can be tested.
--   Story 5: the 2012 Remaster list (the default recommendation) has green €32, yellow €36 and a red €29
--     claimed as 2012 but actually a 1990 Reissue: red goes last although cheapest, and shows "moved to".
--     1972 UK original has only a red listing -> "No listing matches this version yet".

truncate table check_results, listings, profiles, tracks, reason_texts, versions, albums, glossary_terms;

-- Albums -------------------------------------------------------------------
insert into albums (id, title, artist, release_year, cover_url) values
  ('10000000-0000-0000-0000-000000000001', 'The Rise and Fall of Ziggy Stardust and the Spiders from Mars', 'David Bowie', 1972, '/covers/ziggy-stardust.svg'),
  ('10000000-0000-0000-0000-000000000002', 'Hunky Dory', 'David Bowie', 1971, '/covers/hunky-dory.svg'),
  ('10000000-0000-0000-0000-000000000003', 'Let''s Dance', 'David Bowie', 1983, '/covers/lets-dance.svg'),
  ('10000000-0000-0000-0000-000000000004', 'Blackstar', 'David Bowie', 2016, '/covers/blackstar.svg'),
  ('10000000-0000-0000-0000-000000000005', 'Homogenic', 'Björk', 1997, '/covers/homogenic.svg');

-- Versions -----------------------------------------------------------------
insert into versions (id, album_id, name, release_year, country, label, format, sound_score, original_score, rating_count, typical_price_min, typical_price_max) values
  -- Ziggy Stardust
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '1972 UK original', 1972, 'UK', 'RCA Victor', 'LP', 4, 5, 212, 150.00, 220.00),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '1990 Reissue',     1990, 'UK', 'EMI',        'LP', 2, 2, 148, 20.00, 28.00),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '2012 Remaster',    2012, 'EU', 'Parlophone', 'LP, 180 g', 5, 3, 305, 28.00, 36.00),
  -- Hunky Dory
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', '1971 UK original', 1971, 'UK', 'RCA Victor', 'LP', 4, 5, 96, null, null),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', '2015 Remaster',    2015, 'EU', 'Parlophone', 'LP, 180 g', 5, 3, 120, null, null),
  -- Let's Dance
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000003', '1983 US original', 1983, 'US', 'EMI America', 'LP', 4, 5, 64, null, null),
  -- Blackstar
  ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000004', '2016 original',    2016, 'EU', 'ISO / Columbia', 'LP', 5, 5, 88, null, null),
  ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000004', '2016 Clear vinyl', 2016, 'EU', 'ISO / Columbia', 'LP, clear', 4, 4, 41, null, null),
  -- Homogenic
  ('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000005', '1997 UK original', 1997, 'UK', 'One Little Indian', 'LP', 4, 5, 57, null, null),
  ('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000005', '2017 Reissue',     2017, 'EU', 'One Little Indian', 'LP', 4, 3, 33, null, null);

-- Tracks (Ziggy Stardust only: the other albums never reach story 3) --------
insert into tracks (version_id, position, title, is_extra)
select v.id::uuid, t.position, t.title, false
from (values
  ('A1', 'Five Years'), ('A2', 'Soul Love'), ('A3', 'Moonage Daydream'), ('A4', 'Starman'),
  ('A5', 'It Ain''t Easy'), ('B1', 'Lady Stardust'), ('B2', 'Star'), ('B3', 'Hang On to Yourself'),
  ('B4', 'Ziggy Stardust'), ('B5', 'Suffragette City'), ('B6', 'Rock ''n'' Roll Suicide')
) as t (position, title)
cross join (values
  ('20000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000002'),
  ('20000000-0000-0000-0000-000000000003')
) as v (id);

insert into tracks (version_id, position, title, is_extra) values
  ('20000000-0000-0000-0000-000000000002', 'C1', 'John, I''m Only Dancing', true),
  ('20000000-0000-0000-0000-000000000002', 'C2', 'Velvet Goldmine', true);

-- Reason texts (Ziggy Stardust only) ---------------------------------------
insert into reason_texts (version_id, criterion, sentence) values
  ('20000000-0000-0000-0000-000000000001', 'sound',     'Cut from the original master tapes: warm and full, the way the album first sounded.'),
  ('20000000-0000-0000-0000-000000000001', 'price',     'A first pressing costs {lowest_price}.'),
  ('20000000-0000-0000-0000-000000000001', 'original',  'The first pressing, made in 1972 on the RCA Victor label.'),
  ('20000000-0000-0000-0000-000000000001', 'condition', 'Copies are over 50 years old, so most show signs of wear.'),
  ('20000000-0000-0000-0000-000000000002', 'sound',     'Made from a copy of the master tapes, so it sounds flatter than the original.'),
  ('20000000-0000-0000-0000-000000000002', 'price',     'The cheapest way to own this album: from {lowest_price}.'),
  ('20000000-0000-0000-0000-000000000002', 'original',  'A reissue made in 1990, not a first pressing.'),
  ('20000000-0000-0000-0000-000000000002', 'condition', 'Copies are often in good shape: many were kept by collectors.'),
  ('20000000-0000-0000-0000-000000000003', 'sound',     'A careful remaster: clear and detailed, with less background noise.'),
  ('20000000-0000-0000-0000-000000000003', 'price',     'Costs {lowest_price}, vs {first_pressing_price} for a first pressing.'),
  ('20000000-0000-0000-0000-000000000003', 'original',  'A modern pressing that keeps the original artwork and track list.'),
  ('20000000-0000-0000-0000-000000000003', 'condition', 'A recent pressing, so copies are usually clean and quiet.');

-- Glossary -----------------------------------------------------------------
insert into glossary_terms (term, explanation) values
  ('pressing',       'One batch of records made at a factory, with its own label, country and year.'),
  ('first pressing', 'The very first batch of a record, made when the album came out.'),
  ('reissue',        'A new batch of the same album, made years later.'),
  ('remaster',       'A new version of the sound, cleaned up from the original recordings.'),
  ('matrix',         'A code scratched near the label of the record; it tells which pressing a copy is.');

-- Sellers (name and city only; they cannot log in: DECISIONS.md) -----------
insert into profiles (id, user_id, name, city, shop_name) values
  ('30000000-0000-0000-0000-000000000001', null, 'Ana Sousa',    'Porto',   null),
  ('30000000-0000-0000-0000-000000000002', null, 'Rui Ferreira', 'Lisboa',  'Discos do Rui'),
  ('30000000-0000-0000-0000-000000000003', null, 'Marta Lopes',  'Braga',   null),
  ('30000000-0000-0000-0000-000000000004', null, 'João Pinto',   'Coimbra', null);

-- Listings -----------------------------------------------------------------
insert into listings (id, seller_id, claimed_version_id, actual_version_id, condition_code, price, status, cover_photo_url, record_photo_url, matrix_photo_url) values
  -- 1990 Reissue
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'VG+', 24.00,  'on_sale', '/photos/cover.svg', '/photos/record.svg', '/photos/matrix.svg'),  -- green
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'VG',  30.00,  'on_sale', '/photos/cover.svg', '/photos/record.svg', null),                  -- yellow: no matrix photo
  ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'NM',  20.00,  'sold',    '/photos/cover.svg', '/photos/record.svg', '/photos/matrix.svg'),  -- sold: never counts
  -- Claimed as 1972 UK original, actually a 1990 Reissue
  ('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'VG+', 185.00, 'on_sale', '/photos/cover.svg', '/photos/record.svg', '/photos/matrix.svg'),  -- red
  -- 2012 Remaster
  ('40000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 'NM',  32.00,  'on_sale', '/photos/cover.svg', '/photos/record.svg', '/photos/matrix.svg'),  -- green
  ('40000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 'VG+', 36.00,  'on_sale', '/photos/cover.svg', '/photos/record.svg', '/photos/matrix.svg'),  -- yellow: matrix photo not sharp
  -- Claimed as 2012 Remaster, actually a 1990 Reissue (VG keeps the 1990 condition score at VG+)
  ('40000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 'VG',  29.00,  'on_sale', '/photos/cover.svg', '/photos/record.svg', '/photos/matrix.svg'),  -- red
  -- Let's Dance: sold only, so the album shows "No listings"
  ('40000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000006', 'VG',  18.00,  'sold',    '/photos/cover.svg', '/photos/record.svg', '/photos/matrix.svg');

-- Check results (mock data) ------------------------------------------------
insert into check_results (listing_id, item, result) values
  ('40000000-0000-0000-0000-000000000001', 'cover_label', 'match'),
  ('40000000-0000-0000-0000-000000000001', 'country_year', 'match'),
  ('40000000-0000-0000-0000-000000000001', 'matrix', 'match'),
  ('40000000-0000-0000-0000-000000000002', 'cover_label', 'match'),
  ('40000000-0000-0000-0000-000000000002', 'country_year', 'match'),
  ('40000000-0000-0000-0000-000000000002', 'matrix', 'uncertain'),
  ('40000000-0000-0000-0000-000000000003', 'cover_label', 'match'),
  ('40000000-0000-0000-0000-000000000003', 'country_year', 'match'),
  ('40000000-0000-0000-0000-000000000003', 'matrix', 'match'),
  ('40000000-0000-0000-0000-000000000004', 'cover_label', 'match'),
  ('40000000-0000-0000-0000-000000000004', 'country_year', 'no_match'),
  ('40000000-0000-0000-0000-000000000004', 'matrix', 'no_match'),
  ('40000000-0000-0000-0000-000000000005', 'cover_label', 'match'),
  ('40000000-0000-0000-0000-000000000005', 'country_year', 'match'),
  ('40000000-0000-0000-0000-000000000005', 'matrix', 'match'),
  ('40000000-0000-0000-0000-000000000006', 'cover_label', 'match'),
  ('40000000-0000-0000-0000-000000000006', 'country_year', 'match'),
  ('40000000-0000-0000-0000-000000000006', 'matrix', 'uncertain'),
  ('40000000-0000-0000-0000-000000000007', 'cover_label', 'match'),
  ('40000000-0000-0000-0000-000000000007', 'country_year', 'match'),
  ('40000000-0000-0000-0000-000000000007', 'matrix', 'match'),
  ('40000000-0000-0000-0000-000000000008', 'cover_label', 'match'),
  ('40000000-0000-0000-0000-000000000008', 'country_year', 'no_match'),
  ('40000000-0000-0000-0000-000000000008', 'matrix', 'no_match');
