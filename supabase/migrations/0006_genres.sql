-- Story 12 · Home page. Described in docs/database.md.
-- One genre per album, for the crates on the home page. Empty: the album is in no crate.
-- The six genres of the Assignment 1 design; the crates show only genres that have albums.
alter table albums
  add column genre text
  check (genre in ('Rock', 'Jazz', 'Soul and funk', 'Fado', 'Electronic', 'Hip-hop'));
