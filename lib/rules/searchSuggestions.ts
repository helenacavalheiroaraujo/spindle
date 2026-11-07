// "Did you mean…?" suggestions (story 1 · finding #29): one place, covered by tests/unit/searchSuggestions.test.ts.
import { normalize, type SearchableAlbum } from "./albumSearch";

export const MAX_SUGGESTIONS = 3;

// Letters allowed to differ, by how many letters were typed: none with 3, 1 with 4–5, 2 with 6+.
export function tolerance(typedLength: number): number {
  if (typedLength >= 6) return 2;
  if (typedLength >= 4) return 1;
  return 0;
}

// Number of single-letter changes (add, remove, replace) to turn a into b.
export function lettersDifferent(a: string, b: string): number {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = row;
  }
  return prev[b.length];
}

function words(text: string): string[] {
  return normalize(text).split(/[^\p{L}\p{N}]+/u).filter(Boolean);
}

// Up to 3 albums with a word in the title or artist close to the typed text.
// Closest first; on equal distance, newest release first.
export function searchSuggestions<T extends SearchableAlbum>(albums: T[], typed: string): T[] {
  const q = normalize(typed);
  const allowed = tolerance(q.length);
  if (allowed === 0) return [];
  return albums
    .map((album) => ({
      album,
      distance: Math.min(...words(`${album.title} ${album.artist}`).map((w) => lettersDifferent(q, w))),
    }))
    .filter((c) => c.distance <= allowed)
    .sort((a, b) => a.distance - b.distance || b.album.releaseYear - a.album.releaseYear)
    .slice(0, MAX_SUGGESTIONS)
    .map((c) => c.album);
}
