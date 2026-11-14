// Story 34 · Listen to the album: which track of the album page gets a 30-second iTunes preview.
// Pure functions: no network, no database. lib/external/itunes.ts fetches the raw data.

// A title as compared with iTunes: ignores case, accents, quotes and text in brackets such as "(2012 Remaster)".
// "Starman (2012 Remaster)" → "starman"; "It Ain’t Easy" → "it aint easy"; "Café [Live]" → "cafe".
export function normalizeTitle(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // accents
    .replace(/\([^)]*\)|\[[^\]]*\]/g, " ") // text in round or square brackets
    .replace(/['"‘’“”`´]/g, "") // quotes and apostrophes
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

// Two titles are the same track when they are equal after normalizeTitle (and not empty).
export function sameTitle(a: string, b: string): boolean {
  const na = normalizeTitle(a);
  return na !== "" && na === normalizeTitle(b);
}

export type ItunesAlbum = { id: number; name: string; artist: string };

// The iTunes album for our album: name and artist match after normalizeTitle ("… (2012 Remaster)" still matches).
// If several match, the first in iTunes' order wins. No match → null (then no previews show).
export function pickItunesAlbum<T extends ItunesAlbum>(albums: T[], title: string, artist: string): T | null {
  return albums.find((a) => sameTitle(a.name, title) && sameTitle(a.artist, artist)) ?? null;
}

export type ItunesTrack = { title: string; previewUrl: string | null };

// For each track of our list, the preview URL of the matching iTunes track, or null (no play button).
// `itunesTracks` must be in album order: with two tracks of the same title, the first one is used.
export function matchPreviews(tracks: string[], itunesTracks: ItunesTrack[]): (string | null)[] {
  const withPreview = itunesTracks.filter((t) => t.previewUrl);
  return tracks.map((track) => withPreview.find((t) => sameTitle(t.title, track))?.previewUrl ?? null);
}

// The line "Previews are from the album on iTunes…" shows whenever at least one play button shows.
export function showPreviewNote(previews: (string | null)[]): boolean {
  return previews.some((p) => p !== null);
}

// Time played on the pill while a preview plays: 12.7 → "0:12"; 30 → "0:30"; 75 → "1:15".
export function formatPlayed(seconds: number): string {
  const whole = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}
