// Fetches album details from MusicBrainz (release date, label, tracks) and Wikipedia (musician).
// Server only. Rules are in lib/rules/albumDetails.ts. Nothing is stored: fetched each time the page opens.
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
  "artist-credit": { name: string }[];
};
type RawRelease = {
  date?: string;
  "label-info"?: { label?: { name: string } }[];
  media?: { tracks?: { title: string }[] }[];
};

async function getJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    cache: "no-store",
  });
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
