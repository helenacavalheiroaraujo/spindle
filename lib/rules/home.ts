// Home page rules (story 12): crates by genre, the albums of a genre, and the featured album.
// Covered by tests/unit/home.test.ts.
import type { AlbumAccess } from "./albumAccess";

// The genres, with their colours, in alphabetical order (story 24: the crates are sorted by name). "tone" tells which
// text colour reads on the crate; "dot" is the centre of the record.
export const GENRES = [
  { slug: "classical", name: "Classical", color: "#d8cdb6", tone: "dark", dot: "#1f2a44" },
  { slug: "electronic", name: "Electronic", color: "#d6c6a4", tone: "dark", dot: "#1f2a44" },
  { slug: "fado", name: "Fado", color: "#3a2a1f", tone: "light", dot: "#f4efe6" },
  { slug: "hip-hop", name: "Hip-hop", color: "#74644f", tone: "light", dot: "#f4efe6" },
  { slug: "jazz", name: "Jazz", color: "#1f2a44", tone: "light", dot: "#c9d2ea" },
  { slug: "rock", name: "Rock", color: "#c6a26b", tone: "dark", dot: "#1f2a44" },
  { slug: "soul-and-funk", name: "Soul and funk", color: "#a98c5f", tone: "dark", dot: "#1f2a44" },
] as const;

export type Genre = (typeof GENRES)[number];

type AlbumFacts = { genre: string | null; releaseYear: number };
type FeaturedFacts = { releaseYear: number; access: AlbumAccess; activeListingCount: number };

// Story 24: up to six crates sit in a grid; from seven they become a row with a progress line.
export const CRATE_ROW_LIMIT = 6;

export function isCrateRow(crateCount: number): boolean {
  return crateCount > CRATE_ROW_LIMIT;
}

// The label under the crate row, e.g. "Showing 1 to 4 of 7 genres" (first and last are 1-based and visible).
export function showingLabel(first: number, last: number, total: number): string {
  return `Showing ${first} to ${last} of ${total} genres`;
}

export function genreFromSlug(slug: string): Genre | null {
  return GENRES.find((g) => g.slug === slug) ?? null;
}

// One crate per genre that has albums, with the real number of albums; genres with none are not shown.
export function crates(albums: AlbumFacts[]): { genre: Genre; count: number }[] {
  return GENRES.map((genre) => ({ genre, count: albums.filter((a) => a.genre === genre.name).length })).filter(
    (c) => c.count > 0,
  );
}

// The albums of one genre, newest first (as in the search results).
export function albumsInGenre<T extends AlbumFacts>(albums: T[], genre: Genre): T[] {
  return albums.filter((a) => a.genre === genre.name).sort((a, b) => b.releaseYear - a.releaseYear);
}

// "This weekend": among the albums that open, the one with the most active listings; the newest on a tie.
// Null when no album opens (the card is then not shown).
export function featuredAlbum<T extends FeaturedFacts>(albums: T[]): T | null {
  const open = albums.filter((a) => a.access === "open");
  open.sort((a, b) => b.activeListingCount - a.activeListingCount || b.releaseYear - a.releaseYear);
  return open[0] ?? null;
}

export function recordsLabel(count: number): string {
  return `${count} ${count === 1 ? "record" : "records"}`;
}
