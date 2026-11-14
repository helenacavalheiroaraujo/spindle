// Fetches album details from MusicBrainz (release date, label, tracks) and Wikipedia (musician).
// Server only. Rules are in lib/rules/albumDetails.ts. Successful answers are kept for one day (bug 29, DECISIONS).
import {
  firstSentences,
  formatReleaseDate,
  pickRelease,
  pickReleaseGroup,
  type ReleaseCandidate,
} from "@/lib/rules/albumDetails";

// MusicBrainz asks for an identifying User-Agent. Generic on purpose: no personal details.
const USER_AGENT = "Spindle-MVP/0.1 (student project)";
// MUSICBRAINZ_URL is set only by the e2e tests, to a local stub (tests/e2e/musicbrainzStub.mjs). Live use has no variable.
const MUSICBRAINZ = process.env.MUSICBRAINZ_URL ?? "https://musicbrainz.org/ws/2";

export type AlbumDetails = {
  releaseDate: string | null; // formatted, e.g. "17 August 1959"
  label: string | null;
  tracks: string[];
  musician: { name: string; text: string; url: string } | null;
};

type RawGroup = {
  id: string;
  title: string;
  "first-release-date"?: string;
  "primary-type"?: string | null;
  "secondary-types"?: string[];
  "artist-credit": { name: string }[];
};
type RawRelease = {
  date?: string;
  "label-info"?: { label?: { name: string } }[];
  media?: { tracks?: { title: string }[] }[];
};

// One day, in seconds. Next.js keeps only answers with status 200, so a failure is never kept (bug 29).
const ONE_DAY = 60 * 60 * 24;
// MusicBrainz answers 503 when requests arrive too quickly; one more try after a pause (bug 29).
const RETRY_PAUSE_MS = 1200;

export async function getJson(url: string, fetcher: typeof fetch = fetch, pauseMs = RETRY_PAUSE_MS): Promise<unknown> {
  const request = () =>
    fetcher(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      next: { revalidate: ONE_DAY },
    });
  let response = await request();
  if (response.status === 503) {
    await new Promise((resolve) => setTimeout(resolve, pauseMs));
    response = await request();
  }
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  return response.json();
}

// MusicBrainz and Wikipedia are independent: if one fails, the other still shows.
export async function loadAlbumDetails(title: string, artist: string): Promise<AlbumDetails> {
  const [catalogue, musician] = await Promise.all([
    loadCatalogue(title, artist).catch(() => null),
    loadMusician(artist).catch(() => null),
  ]);
  return {
    releaseDate: catalogue?.releaseDate ?? null,
    label: catalogue?.label ?? null,
    tracks: catalogue?.tracks ?? [],
    musician,
  };
}

async function loadCatalogue(title: string, artist: string) {
  const clean = (s: string) => s.replace(/"/g, "");
  const query = `releasegroup:"${clean(title)}" AND artist:"${clean(artist)}"`;
  const search = (await getJson(
    `${MUSICBRAINZ}/release-group/?query=${encodeURIComponent(query)}&fmt=json&limit=5`,
  )) as { "release-groups": RawGroup[] };

  const group = pickReleaseGroup(
    search["release-groups"].map((g) => ({
      id: g.id,
      title: g.title,
      artist: g["artist-credit"].map((c) => c.name).join(""),
      firstReleaseDate: g["first-release-date"] || null,
      primaryType: g["primary-type"] ?? null,
      secondaryTypes: g["secondary-types"] ?? [],
    })),
    title,
    artist,
  );
  if (!group) return null;

  const releases = (await getJson(
    `${MUSICBRAINZ}/release?release-group=${group.id}&inc=labels+recordings&fmt=json&limit=100`,
  )) as { releases: RawRelease[] };

  const candidates: ReleaseCandidate[] = releases.releases.map((r) => ({
    date: r.date || null,
    label: r["label-info"]?.[0]?.label?.name ?? null,
    trackTitles: (r.media ?? []).flatMap((m) => (m.tracks ?? []).map((t) => t.title)),
  }));
  const picked = pickRelease(candidates);

  return {
    releaseDate: formatReleaseDate(group.firstReleaseDate),
    label: picked?.label ?? null,
    tracks: picked?.trackTitles ?? [],
  };
}

async function loadMusician(artist: string) {
  const page = (await getJson(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(artist.replace(/ /g, "_"))}`,
  )) as { type: string; extract?: string; content_urls?: { desktop?: { page?: string } } };

  if (page.type === "disambiguation" || !page.extract || !page.content_urls?.desktop?.page) return null;
  return {
    name: artist,
    text: firstSentences(page.extract, 3),
    url: page.content_urls.desktop.page,
  };
}
