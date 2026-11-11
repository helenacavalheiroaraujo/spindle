// The loader's answer for each source: a source that is down is "failed", not "none" (lib/external/albumDetails.ts).
// fetch is replaced: no network. Example data: Kind of Blue (seed album 8).
import { afterEach, describe, expect, it, vi } from "vitest";
import { loadAlbumDetails } from "@/lib/external/albumDetails";

const groups = {
  "release-groups": [
    { id: "kob", title: "Kind of Blue", "first-release-date": "1959-08-17", "artist-credit": [{ name: "Miles Davis" }] },
  ],
};
const releases = { releases: [] };
const wikipedia = {
  type: "standard",
  extract: "Miles Dewey Davis III was an American trumpeter. He led many groups.",
  content_urls: { desktop: { page: "https://en.wikipedia.org/wiki/Miles_Davis" } },
};

function stubFetch(musicBrainz: "ok" | "down" | "empty", wiki: "ok" | "down") {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      if (url.startsWith("https://musicbrainz.org")) {
        if (musicBrainz === "down") return new Response("unavailable", { status: 503 });
        if (musicBrainz === "empty") return Response.json({ "release-groups": [] });
        return Response.json(url.includes("release-group/") ? groups : releases);
      }
      if (wiki === "down") throw new TypeError("fetch failed");
      return Response.json(wikipedia);
    }),
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("loadAlbumDetails: status of each source", () => {
  it.each([
    ["ok", "ok", "ok", "ok"],
    ["down", "ok", "failed", "ok"], // MusicBrainz returns 503
    ["empty", "ok", "none", "ok"], // MusicBrainz answers: no such album
    ["ok", "down", "ok", "failed"], // Wikipedia cannot be reached
  ] as const)("MusicBrainz %s, Wikipedia %s → catalogue %s, musician %s", async (mb, wiki, catalogue, musician) => {
    stubFetch(mb, wiki);
    const details = await loadAlbumDetails("Kind of Blue", "Miles Davis");
    expect(details.catalogueStatus).toBe(catalogue);
    expect(details.musicianStatus).toBe(musician);
  });

  it("a MusicBrainz failure leaves no date or label, and the musician still shows", async () => {
    stubFetch("down", "ok");
    const details = await loadAlbumDetails("Kind of Blue", "Miles Davis");
    expect(details.releaseDate).toBeNull();
    expect(details.label).toBeNull();
    expect(details.tracks).toEqual([]);
    expect(details.musician?.name).toBe("Miles Davis");
  });
});
