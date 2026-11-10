-- Illustrative data for the MVP demo and tests (Assignment 1, p. 12). Not real catalogue data.
-- Described in docs/database.md. Condition grades are created by migration 0001, not here.
-- Running this file again resets the demo data: it empties the seeded tables first.
--
-- What the data covers:
--   Story 1: "ziggy", "bowie" (newest first), "bjork" -> "Björk", "zigy" suggestion, "No listings".
--   Blackstar has only a sold listing -> "No listings" (active listings only).
--   Ziggy Stardust is the only album with full story 3/5/6 data (Hunky Dory has one listing, for story 6):
--     1990 Reissue   lowest active €24 -> price score 5, sound 2
--     2012 Remaster  lowest active €32 -> price score 4, sound 5  ("1. Price, 2. Sound": 22 vs 19)
--     1972 UK original has no active listing: its only listing is red and counts for the 1990 Reissue
--     (shown there yellow, "Moved here"), so the "ideal but unavailable" note can be tested.
--   Story 5: the 2012 Remaster list (the default recommendation) has green €32, yellow €36 and a red €29
--     claimed as 2012 but actually a 1990 Reissue: red goes last although cheapest, and shows "moved to".
--     1972 UK original has only a red listing -> "No listing matches this version yet".
--   Story 6: Ziggy Stardust versions have typical ranges. Hunky Dory 2015 Remaster has one green listing
--     and no range -> no price label and no range line (never a guess).
--   Story 12: one genre per album (Rock 4, Jazz 1, Soul and funk 1, Fado 1, Electronic 2, Hip-hop 1). Let's Dance, Homogenic (2017 Reissue
--     only; the 1997 UK original stays empty for the sell tests), The Dark Side of the Moon and Megalithic Symphony
--     have full story 3/5/6 data, so Rock, Soul and funk and Electronic open an album on sale. Kind of Blue, Com que voz
--     and Illmatic are showcase albums (versions only, no listings) so Jazz, Fado and Hip-hop have a crate: "No listings". Ziggy Stardust keeps the most active
--     listings (5), so it is the featured album ("This weekend").

truncate table check_results, listings, profiles, tracks, reason_texts, versions, albums, glossary_terms cascade;

-- Albums -------------------------------------------------------------------
insert into albums (id, title, artist, release_year, cover_url, genre) values
  ('10000000-0000-0000-0000-000000000001', 'The Rise and Fall of Ziggy Stardust and the Spiders from Mars', 'David Bowie', 1972, 'https://coverartarchive.org/release-group/6c9ae3dd-32ad-472c-96be-69d0a3536261/front-500', 'Rock'),
  ('10000000-0000-0000-0000-000000000002', 'Hunky Dory', 'David Bowie', 1971, 'https://coverartarchive.org/release-group/743b0b2e-a23a-3182-950e-232f8cb0dfb7/front-500', 'Rock'),
  ('10000000-0000-0000-0000-000000000003', 'Let''s Dance', 'David Bowie', 1983, 'https://coverartarchive.org/release-group/75c2bddf-1799-3eda-b6b3-a0cf5189d8ed/front-500', 'Soul and funk'),
  ('10000000-0000-0000-0000-000000000004', 'Blackstar', 'David Bowie', 2016, 'https://coverartarchive.org/release-group/1fd18f5b-9a92-41fd-a590-da6b5cc60d85/front-500', 'Rock'),
  ('10000000-0000-0000-0000-000000000005', 'Homogenic', 'Björk', 1997, 'https://coverartarchive.org/release-group/810272e0-aef1-3d85-b2d3-e512e87fc38c/front-500', 'Electronic'),
  ('10000000-0000-0000-0000-000000000006', 'The Dark Side of the Moon', 'Pink Floyd', 1973, 'https://coverartarchive.org/release-group/f5093c06-23e3-404f-aeaa-40f72885ee3a/front-500', 'Rock'),
  ('10000000-0000-0000-0000-000000000007', 'Megalithic Symphony', 'AWOLNATION', 2011, 'https://coverartarchive.org/release-group/47bbac51-0fe3-4364-b51a-d7d5cf326096/front-500', 'Electronic'),
  ('10000000-0000-0000-0000-000000000008', 'Kind of Blue', 'Miles Davis', 1959, 'https://coverartarchive.org/release-group/8e8a594f-2175-38c7-a871-abb68ec363e7/front-500', 'Jazz'),
  ('10000000-0000-0000-0000-000000000009', 'Com que voz', 'Amália Rodrigues', 1970, 'https://coverartarchive.org/release-group/d0718149-53e4-379f-9e59-50744275676b/front-500', 'Fado'),
  ('10000000-0000-0000-0000-000000000010', 'Illmatic', 'Nas', 1994, 'https://coverartarchive.org/release-group/28298e2c-4d70-3eed-a0f5-a3280c662b3d/front-500', 'Hip-hop');

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
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000003', '1983 US original', 1983, 'US', 'EMI America', 'LP', 4, 5, 64, 15.00, 25.00),
  ('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000003', '2018 Remaster',    2018, 'EU', 'Parlophone', 'LP, 180 g', 5, 3, 52, 25.00, 32.00),
  -- Blackstar
  ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000004', '2016 original',    2016, 'EU', 'ISO / Columbia', 'LP', 5, 5, 88, null, null),
  ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000004', '2016 Clear vinyl', 2016, 'EU', 'ISO / Columbia', 'LP, clear', 4, 4, 41, null, null),
  -- Homogenic
  ('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000005', '1997 UK original', 1997, 'UK', 'One Little Indian', 'LP', 4, 5, 57, null, null),
  ('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000005', '2017 Reissue',     2017, 'EU', 'One Little Indian', 'LP', 4, 3, 33, 30.00, 40.00),
  -- The Dark Side of the Moon
  ('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000006', '1973 UK original', 1973, 'UK', 'Harvest', 'LP', 4, 5, 340, 120.00, 200.00),
  ('20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000006', '2016 Remaster',    2016, 'EU', 'Pink Floyd Records', 'LP, 180 g', 5, 3, 410, 28.00, 35.00),
  -- Megalithic Symphony
  ('20000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000007', '2011 US original', 2011, 'US', 'Red Bull Records', '2LP', 4, 5, 45, 40.00, 60.00),
  ('20000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000007', '2021 Anniversary edition', 2021, 'US', 'Red Bull Records', 'LP', 5, 3, 30, 25.00, 32.00),
  -- Showcase albums (story 12): one per remaining genre, no listings, so they open as "No listings"
  ('20000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000008', '1959 US original', 1959, 'US', 'Columbia', 'LP', 4, 5, 120, null, null),
  ('20000000-0000-0000-0000-000000000017', '10000000-0000-0000-0000-000000000008', '2015 Reissue',     2015, 'EU', 'Columbia', 'LP, 180 g', 5, 3, 140, null, null),
  ('20000000-0000-0000-0000-000000000018', '10000000-0000-0000-0000-000000000009', '1970 PT original', 1970, 'PT', 'Valentim de Carvalho', 'LP', 4, 5, 60, null, null),
  ('20000000-0000-0000-0000-000000000019', '10000000-0000-0000-0000-000000000009', '2020 Reissue',     2020, 'PT', 'Valentim de Carvalho', 'LP', 5, 3, 45, null, null),
  ('20000000-0000-0000-0000-000000000020', '10000000-0000-0000-0000-000000000010', '1994 US original', 1994, 'US', 'Columbia', 'LP', 4, 5, 90, null, null),
  ('20000000-0000-0000-0000-000000000021', '10000000-0000-0000-0000-000000000010', '2014 Reissue',     2014, 'EU', 'Columbia', 'LP', 5, 3, 70, null, null);

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

-- Reason texts (albums that open: story 1 · finding #50) ------------------
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
  ('20000000-0000-0000-0000-000000000003', 'condition', 'A recent pressing, so copies are usually clean and quiet.'),
  -- Let's Dance
  ('20000000-0000-0000-0000-000000000006', 'sound',     'Cut in 1983 from the original tapes: punchy and bright, made for dancing.'),
  ('20000000-0000-0000-0000-000000000006', 'price',     'A first pressing costs {lowest_price}.'),
  ('20000000-0000-0000-0000-000000000006', 'original',  'The first pressing, made in 1983 on the EMI America label.'),
  ('20000000-0000-0000-0000-000000000006', 'condition', 'Many copies were played often at parties, so check for wear.'),
  ('20000000-0000-0000-0000-000000000011', 'sound',     'A careful remaster: clearer bass and less background noise.'),
  ('20000000-0000-0000-0000-000000000011', 'price',     'Costs {lowest_price}, vs {first_pressing_price} for a first pressing.'),
  ('20000000-0000-0000-0000-000000000011', 'original',  'A modern pressing that keeps the original artwork and track list.'),
  ('20000000-0000-0000-0000-000000000011', 'condition', 'A recent pressing, so copies are usually clean and quiet.'),
  -- Homogenic
  ('20000000-0000-0000-0000-000000000009', 'sound',     'The original 1997 cut: deep beats and strings, as first released.'),
  ('20000000-0000-0000-0000-000000000009', 'price',     'A first pressing costs {lowest_price}.'),
  ('20000000-0000-0000-0000-000000000009', 'original',  'The first pressing, made in 1997 on the One Little Indian label.'),
  ('20000000-0000-0000-0000-000000000009', 'condition', 'Fewer copies were made, so clean ones are hard to find.'),
  ('20000000-0000-0000-0000-000000000010', 'sound',     'Cut again from the original tapes: close to the first pressing.'),
  ('20000000-0000-0000-0000-000000000010', 'price',     'Costs {lowest_price}, vs {first_pressing_price} for a first pressing.'),
  ('20000000-0000-0000-0000-000000000010', 'original',  'A reissue made in 2017, not a first pressing.'),
  ('20000000-0000-0000-0000-000000000010', 'condition', 'A recent pressing, so copies are usually clean and quiet.'),
  -- The Dark Side of the Moon
  ('20000000-0000-0000-0000-000000000012', 'sound',     'Cut from the original master tapes in 1973: the sound many fans still prefer.'),
  ('20000000-0000-0000-0000-000000000012', 'price',     'A first pressing costs {lowest_price}.'),
  ('20000000-0000-0000-0000-000000000012', 'original',  'The first pressing, made in 1973 on the Harvest label.'),
  ('20000000-0000-0000-0000-000000000012', 'condition', 'Copies are 50 years old, so most show signs of wear.'),
  ('20000000-0000-0000-0000-000000000013', 'sound',     'A careful remaster from the original tapes: clear and quiet.'),
  ('20000000-0000-0000-0000-000000000013', 'price',     'Costs {lowest_price}, vs {first_pressing_price} for a first pressing.'),
  ('20000000-0000-0000-0000-000000000013', 'original',  'A modern pressing with the original gatefold and posters.'),
  ('20000000-0000-0000-0000-000000000013', 'condition', 'A recent pressing, so copies are usually clean.'),
  -- Megalithic Symphony
  ('20000000-0000-0000-0000-000000000014', 'sound',     'The original double LP: more room per side, so a fuller sound.'),
  ('20000000-0000-0000-0000-000000000014', 'price',     'A first pressing costs {lowest_price}.'),
  ('20000000-0000-0000-0000-000000000014', 'original',  'The first pressing, made in 2011 on the Red Bull Records label.'),
  ('20000000-0000-0000-0000-000000000014', 'condition', 'A young record, but some copies were played a lot.'),
  ('20000000-0000-0000-0000-000000000015', 'sound',     'Remastered for its 10th anniversary: clean and loud.'),
  ('20000000-0000-0000-0000-000000000015', 'price',     'Costs {lowest_price}, vs {first_pressing_price} for a first pressing.'),
  ('20000000-0000-0000-0000-000000000015', 'original',  'An anniversary edition from 2021, not a first pressing.'),
  ('20000000-0000-0000-0000-000000000015', 'condition', 'A recent pressing, so copies are usually clean and quiet.');

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
  ('40000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000006', 'VG',  18.00,  'sold',    '/photos/cover.svg', '/photos/record.svg', '/photos/matrix.svg'),
  -- Hunky Dory 2015 Remaster: a version with no typical range (story 6)
  ('40000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000005', 'NM',  30.00,  'on_sale', '/photos/cover.svg', '/photos/record.svg', '/photos/matrix.svg'),  -- green
  -- Blackstar: sold only, so the album shows "No listings"
  ('40000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000007', 'NM',  40.00,  'sold',    '/photos/cover.svg', '/photos/record.svg', '/photos/matrix.svg'),
  -- Let's Dance (story 12)
  ('40000000-0000-0000-0000-000000000011', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000006', 'VG+', 19.00,  'on_sale', '/photos/cover.svg', '/photos/record.svg', '/photos/matrix.svg'),  -- green
  ('40000000-0000-0000-0000-000000000012', '30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000011', 'NM',  28.00,  'on_sale', '/photos/cover.svg', '/photos/record.svg', '/photos/matrix.svg'),  -- green
  ('40000000-0000-0000-0000-000000000013', '30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000011', 'VG+', 26.00,  'on_sale', '/photos/cover.svg', '/photos/record.svg', null),                  -- yellow: no matrix photo
  -- Homogenic 2017 Reissue (story 12)
  ('40000000-0000-0000-0000-000000000014', '30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000010', 'NM',  34.00,  'on_sale', '/photos/cover.svg', '/photos/record.svg', '/photos/matrix.svg'),  -- green
  ('40000000-0000-0000-0000-000000000015', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000010', 'VG+', 31.00,  'on_sale', '/photos/cover.svg', '/photos/record.svg', '/photos/matrix.svg'),  -- yellow: matrix photo not sharp
  -- The Dark Side of the Moon (story 12)
  ('40000000-0000-0000-0000-000000000016', '30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000012', 'VG+', 160.00, 'on_sale', '/photos/cover.svg', '/photos/record.svg', '/photos/matrix.svg'),  -- green
  ('40000000-0000-0000-0000-000000000017', '30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000013', 'NM',  30.00,  'on_sale', '/photos/cover.svg', '/photos/record.svg', '/photos/matrix.svg'),  -- green
  ('40000000-0000-0000-0000-000000000018', '30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000013', 'VG',  27.00,  'on_sale', '/photos/cover.svg', '/photos/record.svg', null),                  -- yellow: no matrix photo
  -- Megalithic Symphony (story 12)
  ('40000000-0000-0000-0000-000000000019', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000014', '20000000-0000-0000-0000-000000000014', 'VG+', 48.00,  'on_sale', '/photos/cover.svg', '/photos/record.svg', null),                  -- yellow: no matrix photo
  ('40000000-0000-0000-0000-000000000020', '30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000015', '20000000-0000-0000-0000-000000000015', 'NM',  29.00,  'on_sale', '/photos/cover.svg', '/photos/record.svg', '/photos/matrix.svg');  -- green

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
  ('40000000-0000-0000-0000-000000000008', 'matrix', 'no_match'),
  ('40000000-0000-0000-0000-000000000009', 'cover_label', 'match'),
  ('40000000-0000-0000-0000-000000000009', 'country_year', 'match'),
  ('40000000-0000-0000-0000-000000000009', 'matrix', 'match'),
  ('40000000-0000-0000-0000-000000000010', 'cover_label', 'match'),
  ('40000000-0000-0000-0000-000000000010', 'country_year', 'match'),
  ('40000000-0000-0000-0000-000000000010', 'matrix', 'match'),
  ('40000000-0000-0000-0000-000000000011', 'cover_label', 'match'),
  ('40000000-0000-0000-0000-000000000011', 'country_year', 'match'),
  ('40000000-0000-0000-0000-000000000011', 'matrix', 'match'),
  ('40000000-0000-0000-0000-000000000012', 'cover_label', 'match'),
  ('40000000-0000-0000-0000-000000000012', 'country_year', 'match'),
  ('40000000-0000-0000-0000-000000000012', 'matrix', 'match'),
  ('40000000-0000-0000-0000-000000000013', 'cover_label', 'match'),
  ('40000000-0000-0000-0000-000000000013', 'country_year', 'match'),
  ('40000000-0000-0000-0000-000000000013', 'matrix', 'uncertain'),
  ('40000000-0000-0000-0000-000000000014', 'cover_label', 'match'),
  ('40000000-0000-0000-0000-000000000014', 'country_year', 'match'),
  ('40000000-0000-0000-0000-000000000014', 'matrix', 'match'),
  ('40000000-0000-0000-0000-000000000015', 'cover_label', 'match'),
  ('40000000-0000-0000-0000-000000000015', 'country_year', 'match'),
  ('40000000-0000-0000-0000-000000000015', 'matrix', 'uncertain'),
  ('40000000-0000-0000-0000-000000000016', 'cover_label', 'match'),
  ('40000000-0000-0000-0000-000000000016', 'country_year', 'match'),
  ('40000000-0000-0000-0000-000000000016', 'matrix', 'match'),
  ('40000000-0000-0000-0000-000000000017', 'cover_label', 'match'),
  ('40000000-0000-0000-0000-000000000017', 'country_year', 'match'),
  ('40000000-0000-0000-0000-000000000017', 'matrix', 'match'),
  ('40000000-0000-0000-0000-000000000018', 'cover_label', 'match'),
  ('40000000-0000-0000-0000-000000000018', 'country_year', 'match'),
  ('40000000-0000-0000-0000-000000000018', 'matrix', 'uncertain'),
  ('40000000-0000-0000-0000-000000000019', 'cover_label', 'match'),
  ('40000000-0000-0000-0000-000000000019', 'country_year', 'match'),
  ('40000000-0000-0000-0000-000000000019', 'matrix', 'uncertain'),
  ('40000000-0000-0000-0000-000000000020', 'cover_label', 'match'),
  ('40000000-0000-0000-0000-000000000020', 'country_year', 'match'),
  ('40000000-0000-0000-0000-000000000020', 'matrix', 'match');

-- Reviews of sellers (story 18): illustrative, no order behind them -------------
insert into reviews (seller_id, rating)
select '30000000-0000-0000-0000-000000000001', r from unnest(array[5, 4, 5, 4, 4]) as r;
insert into reviews (seller_id, rating)
select '30000000-0000-0000-0000-000000000002', r from unnest(array[5, 5, 5, 5, 5, 5, 5, 5, 5, 4, 4, 4]) as r;
insert into reviews (seller_id, rating)
select '30000000-0000-0000-0000-000000000004', r from unnest(array[5]) as r;
-- Marta Lopes has none: "No reviews yet".
