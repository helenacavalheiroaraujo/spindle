// The action card on the album page (story 28 · DECISIONS 2026-11-14): covered by tests/unit/albumAction.test.ts.
// Every album tap opens the album page; only this card changes with the listings and the saved ranking.
import type { AlbumAccess } from "./albumAccess";
import { formatPriorities, PRIORITIES, type Priority } from "./priorities";

export type AlbumAction =
  | { kind: "choose"; href: string }
  | { kind: "recommendation"; href: string; basedOn: string; changeHref: string }
  | { kind: "nobody_selling" }
  | { kind: "none" };

export function albumAction(albumId: string, access: AlbumAccess, savedRanking: Priority[] | null): AlbumAction {
  if (access === "no_listings") return { kind: "nobody_selling" };
  if (access !== "open") return { kind: "none" };
  if (!savedRanking || savedRanking.length === 0) return { kind: "choose", href: `/albums/${albumId}/priorities` };
  const ranking = formatPriorities(savedRanking);
  return {
    kind: "recommendation",
    href: `/albums/${albumId}/recommendation?priorities=${ranking}`,
    basedOn: savedRanking.map((id) => PRIORITIES.find((p) => p.id === id)!.label).join(", "),
    changeHref: `/albums/${albumId}/priorities?priorities=${ranking}`,
  };
}

// Track list when MusicBrainz returns none (story 28): the earliest version in our database, without "Bonus" tracks.
// Ties on year keep the first version given. No versions, or no tracks → an empty list.
export function fallbackTracks(
  versions: { releaseYear: number; tracks: { position: string; title: string; isExtra: boolean }[] }[],
): string[] {
  const withTracks = versions.filter((v) => v.tracks.length > 0);
  if (withTracks.length === 0) return [];
  const earliest = withTracks.reduce((a, b) => (b.releaseYear < a.releaseYear ? b : a));
  return earliest.tracks.filter((t) => !t.isExtra).map((t) => t.title);
}
