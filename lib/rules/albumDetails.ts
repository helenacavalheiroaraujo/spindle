// Album details on the page of an album with no listings (DECISIONS 2026-11-10, album page).
// Pure functions: no network, no database. lib/external/albumDetails.ts fetches the raw data.

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// "1959-08-17" → "17 August 1959"; "1959-08" → "August 1959"; "1959" → "1959"; anything else → null.
export function formatReleaseDate(date: string | null | undefined): string | null {
  if (!date) return null;
  const match = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/.exec(date);
  if (!match) return null;
  const [, year, month, day] = match;
  if (!month) return year;
  const monthName = MONTHS[Number(month) - 1];
  if (!monthName) return null;
  if (!day) return `${monthName} ${year}`;
  return `${Number(day)} ${monthName} ${year}`;
}

export type GroupCandidate = {
  id: string;
  title: string;
  artist: string;
  firstReleaseDate: string | null;
};

// The album's own record group: title and artist match exactly (ignoring case and spaces).
// If several match, the one with the earliest first release date wins.
export function pickReleaseGroup<T extends GroupCandidate>(groups: T[], title: string, artist: string): T | null {
  const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
  const matches = groups.filter((g) => same(g.title, title) && same(g.artist, artist));
  return sortByDate(matches, (g) => g.firstReleaseDate)[0] ?? null;
}

export type ReleaseCandidate = {
  date: string | null;
  label: string | null;
  trackTitles: string[];
};

// Which release supplies the label and the track list. The usual track count is the most common one among
// the releases (a tie takes the larger count). Releases with that count are kept, and the earliest of them wins.
// This skips incomplete editions (e.g. a 3-track reel-to-reel) and bonus-heavy reissues (e.g. 12+ tracks).
// Releases with no tracks are ignored. Returns null when no release has tracks.
export function pickRelease<T extends ReleaseCandidate>(releases: T[]): T | null {
  const withTracks = releases.filter((r) => r.trackTitles.length > 0);
  if (withTracks.length === 0) return null;
  const counts = new Map<number, number>();
  for (const r of withTracks) counts.set(r.trackTitles.length, (counts.get(r.trackTitles.length) ?? 0) + 1);
  let usual = 0;
  let best = -1;
  for (const [size, count] of counts) {
    if (count > best || (count === best && size > usual)) {
      usual = size;
      best = count;
    }
  }
  return sortByDate(withTracks.filter((r) => r.trackTitles.length === usual), (r) => r.date)[0] ?? null;
}

// The first `count` sentences of a text, for the short description of the musician.
export function firstSentences(text: string, count = 3): string {
  const sentences = text.trim().split(/(?<=[.!?])\s+(?=[A-Z"'(“])/);
  return sentences.slice(0, count).join(" ");
}

// How a source went: "ok" = answered with data for this album; "none" = answered, nothing for this album;
// "failed" = did not answer (network, timeout, service error).
export type SourceStatus = "ok" | "none" | "failed";

// The notice in place of the release facts and the track list when MusicBrainz did not answer. Null otherwise.
export function catalogueNotice(status: SourceStatus): string | null {
  return status === "failed" ? "The release date, label and tracks are not available right now." : null;
}

// The notice in place of the musician's description when Wikipedia did not answer. Null otherwise.
export function musicianNotice(status: SourceStatus): string | null {
  return status === "failed" ? "The description of the musician is not available right now." : null;
}

// The source line names only the sources that gave data for this album. Null when neither did.
export function sourcesLine(catalogue: SourceStatus, musician: SourceStatus): string | null {
  const names = [catalogue === "ok" ? "MusicBrainz" : null, musician === "ok" ? "Wikipedia" : null].filter(
    (n): n is string => n !== null,
  );
  return names.length > 0 ? `Source: ${names.join(" · ")}` : null;
}

// Dated items first, earliest first; undated items last; equal dates keep their order.
function sortByDate<T>(items: T[], dateOf: (item: T) => string | null): T[] {
  return [...items].sort((a, b) => {
    const da = dateOf(a);
    const db = dateOf(b);
    if (da && db) return da < db ? -1 : da > db ? 1 : 0;
    if (da) return -1;
    if (db) return 1;
    return 0;
  });
}
