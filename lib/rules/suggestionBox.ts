// Suggestion box under the search box (story 16): one place, covered by tests/unit/suggestionBox.test.ts.
// Same matching as story 1: searchAlbums for the albums, searchSuggestions for "Did you mean…?".
import { isTooShort, normalize, searchAlbums, type SearchableAlbum } from "./albumSearch";
import { searchSuggestions } from "./searchSuggestions";
import type { AlbumAccess } from "./albumAccess";

export const MAX_BOX_ALBUMS = 4;

export type BoxContent<T> =
  | { kind: "none" } // nothing typed (spaces do not count): no box
  | { kind: "tooShort" } // 1 or 2 characters: the box says "Type at least 3 characters to search." (bug 26)
  | { kind: "albums"; albums: T[] } // up to 4, newest first, then "See all results"
  | { kind: "didYouMean"; albums: T[] } // a typo: up to 3 close albums
  | { kind: "empty" }; // "No albums found"

export function boxContent<T extends SearchableAlbum>(all: T[], typed: string): BoxContent<T> {
  if (isTooShort(typed)) return normalize(typed).length === 0 ? { kind: "none" } : { kind: "tooShort" };
  const found = searchAlbums(all, typed);
  if (found.length > 0) return { kind: "albums", albums: found.slice(0, MAX_BOX_ALBUMS) };
  const close = searchSuggestions(all, typed);
  if (close.length > 0) return { kind: "didYouMean", albums: close };
  return { kind: "empty" };
}

// The tag on a suggestion row, as on the results rows of story 1 and 17.
export function suggestionTag(album: { versionCount: number; access: AlbumAccess }): string {
  if (album.access === "no_listings") return "No listings";
  if (album.access === "not_in_demo") return "Not in the demo";
  return `${album.versionCount} ${album.versionCount === 1 ? "version" : "versions"}`;
}

// ↑ ↓ move the highlight (none → first row; up from the first row → none); the ends do not wrap.
export function moveHighlight(current: number | null, key: "ArrowDown" | "ArrowUp", count: number): number | null {
  if (count === 0) return null;
  if (key === "ArrowDown") return current === null ? 0 : Math.min(current + 1, count - 1);
  if (current === null || current === 0) return null;
  return current - 1;
}
