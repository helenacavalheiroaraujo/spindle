// Decision tables for lib/rules/albumDetails.ts. Example data: Kind of Blue (seed album 8) as MusicBrainz returned it.
import { describe, expect, it } from "vitest";
import {
  catalogueNotice,
  firstSentences,
  formatReleaseDate,
  musicianNotice,
  pickRelease,
  pickReleaseGroup,
  sourcesLine,
} from "@/lib/rules/albumDetails";

describe("formatReleaseDate", () => {
  it.each([
    ["1959-08-17", "17 August 1959"], // Kind of Blue, first release date
    ["1959-08", "August 1959"], // month only
    ["1959", "1959"], // year only: shown as is
    ["2015-01-05", "5 January 2015"], // no leading zero on the day
    [null, null], // no date
    ["", null], // empty
    ["1959-13-01", null], // month that does not exist
    ["August 1959", null], // not a MusicBrainz date
  ] as const)("%s → %s", (date, expected) => {
    expect(formatReleaseDate(date)).toBe(expected);
  });
});

describe("pickReleaseGroup", () => {
  const groups = [
    { id: "kob", title: "Kind of Blue", artist: "Miles Davis", firstReleaseDate: "1959-08-17" },
    { id: "kob-tribute", title: "Kind of Blue", artist: "Another Artist", firstReleaseDate: "1990-01-01" },
    { id: "kob-live", title: "Kind of Blue (live)", artist: "Miles Davis", firstReleaseDate: "2000-01-01" },
    { id: "kob-early", title: "kind of blue", artist: " miles davis ", firstReleaseDate: "1958-01-01" },
  ];

  it.each([
    // title, artist, expected id
    ["Kind of Blue", "Miles Davis", "kob-early"], // exact match ignoring case and spaces; earliest wins
    ["Kind of Blue", "Another Artist", "kob-tribute"], // only one with that artist
    ["Kind of Blue (live)", "Miles Davis", "kob-live"],
    ["Sketches of Spain", "Miles Davis", null], // no such album
    ["Kind of Blue", "Bill Evans", null], // right title, other artist
  ] as const)("%s by %s → %s", (title, artist, expected) => {
    expect(pickReleaseGroup(groups, title, artist)?.id ?? null).toBe(expected);
  });
});

describe("pickRelease", () => {
  // Real MusicBrainz releases of Kind of Blue, earliest first
  const reelToReel = { date: "1959", label: "Columbia", trackTitles: ["So What", "Blue in Green", "All Blues"] };
  const japan1959 = {
    date: "1959",
    label: "Columbia",
    trackTitles: ["So What", "Freddie Freeloader", "Blue in Green", "All Blues", "Flamenco Sketches"],
  };
  const us1959 = { date: "1959-08-17", label: "Columbia", trackTitles: japan1959.trackTitles };
  const fontana1960 = { date: "1960", label: "Fontana", trackTitles: japan1959.trackTitles };
  const noTracks = { date: "1950", label: "Unknown", trackTitles: [] as string[] };

  // A 2009 reissue with alternate takes: 12 tracks, the rarest count
  const bonusReissue = { date: "2009", label: "Legacy", trackTitles: Array.from({ length: 12 }, (_, i) => `Take ${i}`) };

  it("skips the incomplete 3-track reel-to-reel even though it is earlier", () => {
    expect(pickRelease([reelToReel, japan1959, us1959])).toBe(japan1959);
  });

  it("skips a bonus-heavy reissue, which has fewer releases than the usual track count", () => {
    expect(pickRelease([bonusReissue, fontana1960, us1959])).toBe(us1959);
  });

  it("takes the earliest release with the usual track count", () => {
    expect(pickRelease([fontana1960, us1959])).toBe(us1959);
  });

  it("on a tie in the number of releases, takes the larger track count", () => {
    const two = { date: "1960", label: "A", trackTitles: ["x", "y"] };
    const three = { date: "1970", label: "B", trackTitles: ["x", "y", "z"] };
    expect(pickRelease([two, three])).toBe(three);
  });

  it("puts undated releases after dated ones with the same track count", () => {
    const undated = { date: null, label: "Other", trackTitles: japan1959.trackTitles };
    expect(pickRelease([undated, us1959])).toBe(us1959);
  });

  it("skips releases with no tracks", () => {
    expect(pickRelease([noTracks, us1959])).toBe(us1959);
  });

  it("returns null when no release has tracks", () => {
    expect(pickRelease([noTracks])).toBeNull();
    expect(pickRelease([])).toBeNull();
  });
});

describe("firstSentences", () => {
  const text =
    "Miles Dewey Davis III (1926–1991) was an American jazz trumpeter. He led several groups. " +
    "His albums changed the direction of jazz. Later he moved to rock. The end.";

  it("keeps the first three sentences", () => {
    expect(firstSentences(text, 3)).toBe(
      "Miles Dewey Davis III (1926–1991) was an American jazz trumpeter. He led several groups. His albums changed the direction of jazz.",
    );
  });

  it("keeps a short text whole", () => {
    expect(firstSentences("One sentence only.", 3)).toBe("One sentence only.");
  });

  it("trims surrounding spaces and does not split inside a sentence", () => {
    expect(firstSentences("  A short note with 3.5 minutes in it. Then more.  ", 1)).toBe("A short note with 3.5 minutes in it.");
  });
});

describe("notices and source line when a source does not answer", () => {
  it.each([
    ["ok", "Source: MusicBrainz · Wikipedia"], // Kind of Blue: both answered
    ["none", "Source: Wikipedia"], // MusicBrainz answered, nothing for this album
  ] as const)("musician ok, catalogue %s → %s", (catalogue, expected) => {
    expect(sourcesLine(catalogue, "ok")).toBe(expected);
  });
  it("MusicBrainz down, Wikipedia answered: the notice for MusicBrainz, and the source line names only Wikipedia", () => {
    expect(catalogueNotice("failed")).toBe("The release date, label and tracks are not available right now.");
    expect(sourcesLine("failed", "ok")).toBe("Source: Wikipedia");
  });
  it("Wikipedia down, MusicBrainz answered: the notice for the musician, and the source line names only MusicBrainz", () => {
    expect(musicianNotice("failed")).toBe("The description of the musician is not available right now.");
    expect(sourcesLine("ok", "failed")).toBe("Source: MusicBrainz");
  });
  it("both down or both empty: no source line", () => {
    expect(sourcesLine("failed", "failed")).toBeNull();
    expect(sourcesLine("none", "none")).toBeNull();
  });
  it("no notice when the source answered, even with nothing for the album", () => {
    expect(catalogueNotice("ok")).toBeNull();
    expect(catalogueNotice("none")).toBeNull();
    expect(musicianNotice("ok")).toBeNull();
    expect(musicianNotice("none")).toBeNull();
  });
});
