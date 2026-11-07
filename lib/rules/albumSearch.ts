// Album search (story 1): one place, covered by tests/unit/albumSearch.test.ts.
export const MIN_SEARCH_LENGTH = 3;

export type SearchableAlbum = { title: string; artist: string; releaseYear: number };

// Ignores upper and lower case and accents: "BJORK" and "bjork" both find "Björk".
export function normalize(text: string): string {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

// Albums whose title or artist contains the typed text, newest release first.
export function searchAlbums<T extends SearchableAlbum>(albums: T[], typed: string): T[] {
  const q = normalize(typed);
  if (q.length < MIN_SEARCH_LENGTH) return [];
  return albums
    .filter((a) => normalize(a.title).includes(q) || normalize(a.artist).includes(q))
    .sort((a, b) => b.releaseYear - a.releaseYear);
}
