-- Story 24 · More genres. Adds Classical to the genre list; 0006 has the first six.
-- Described in docs/database.md.
alter table albums drop constraint albums_genre_check;
alter table albums add constraint albums_genre_check
  check (genre in ('Rock', 'Jazz', 'Soul and funk', 'Fado', 'Electronic', 'Hip-hop', 'Classical'));
