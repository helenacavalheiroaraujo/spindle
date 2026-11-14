// Fetches the 30-second track previews of an album from the iTunes Search API (story 34).
// Server only. Rules are in lib/rules/trackPreview.ts. Successful answers are kept for one day (getJson, bug 29).
import { getJson } from "@/lib/external/albumDetails";
import { pickItunesAlbum, type ItunesTrack } from "@/lib/rules/trackPreview";

// ITUNES_URL is set only by the e2e tests, to a local stub (tests/e2e/itunesStub.mjs). Live use has no variable.
const ITUNES = process.env.ITUNES_URL ?? "https://itunes.apple.com";

type RawAlbum = { wrapperType?: string; collectionId: number; collectionName: string; artistName: string };
type RawTrack = {
  wrapperType?: string;
  kind?: string;
  trackName?: string;
  previewUrl?: string;
  discNumber?: number;
  trackNumber?: number;
};

// The album's tracks in album order (disc, then track number), each with its preview URL.
// No matching album → []. A failure throws: the page then shows no play buttons and no line.
export async function loadPreviews(title: string, artist: string): Promise<ItunesTrack[]> {
  const search = (await getJson(
    `${ITUNES}/search?term=${encodeURIComponent(`${artist} ${title}`)}&media=music&entity=album&limit=10`,
  )) as { results: RawAlbum[] };

  const album = pickItunesAlbum(
    search.results
      .filter((r) => r.collectionId && r.collectionName)
      .map((r) => ({ id: r.collectionId, name: r.collectionName, artist: r.artistName ?? "" })),
    title,
    artist,
  );
  if (!album) return [];

  const lookup = (await getJson(`${ITUNES}/lookup?id=${album.id}&entity=song`)) as { results: RawTrack[] };
  return lookup.results
    .filter((r) => r.wrapperType === "track" && r.trackName)
    .sort((a, b) => (a.discNumber ?? 1) - (b.discNumber ?? 1) || (a.trackNumber ?? 0) - (b.trackNumber ?? 0))
    .map((r) => ({ title: r.trackName!, previewUrl: r.previewUrl ?? null }));
}
