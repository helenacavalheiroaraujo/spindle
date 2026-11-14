// Decision tables for lib/rules/albumDetails.ts. Example data: Kind of Blue (seed album 8) as MusicBrainz returned it.
import { describe, expect, it } from "vitest";
import { firstSentences, formatReleaseDate, pickRelease, pickReleaseGroup } from "@/lib/rules/albumDetails";
import { getJson } from "@/lib/external/albumDetails";

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

describe("pickReleaseGroup · bug 29 (real MusicBrainz answers, 2026-11-14)", () => {
  const letsDance = [
    { id: "ld-album", title: "Let’s Dance", artist: "David Bowie", firstReleaseDate: "1983-03", primaryType: "Album", secondaryTypes: [] },
    { id: "ld-single", title: "Let’s Dance", artist: "David Bowie", firstReleaseDate: "1983", primaryType: "Single", secondaryTypes: [] },
  ];
  const divenire = [
    { id: "div-single", title: "Divenire", artist: "Ludovico Einaudi", firstReleaseDate: "2006", primaryType: "Single", secondaryTypes: [] },
    { id: "div-album", title: "Divenire", artist: "Ludovico Einaudi", firstReleaseDate: "2006-11-07", primaryType: "Album", secondaryTypes: [] },
  ];
  const darkSide = [
    { id: "dsotm", title: "The Dark Side of the Moon", artist: "Pink Floyd", firstReleaseDate: "1973-03-24", primaryType: "Album", secondaryTypes: [] },
    { id: "dsotm-live", title: "The Dark Side of the Moon", artist: "Pink Floyd", firstReleaseDate: "1972-02-17", primaryType: "Album", secondaryTypes: ["Live"] },
  ];
  const sevenDays = [
    { id: "sdw-box", title: "Seven Days Walking", artist: "Ludovico Einaudi", firstReleaseDate: "2019-10-18", primaryType: "Album", secondaryTypes: ["Compilation"] },
    { id: "sdw-6", title: "Seven Days Walking: Day 6", artist: "Ludovico Einaudi", firstReleaseDate: "2019-08-16", primaryType: "Album", secondaryTypes: [] },
  ];
  const curlyInOurData = [
    { id: "wpsia", title: "Whatever People Say I Am, That's What I'm Not", artist: "Arctic Monkeys", firstReleaseDate: "2006-01-23", primaryType: "Album", secondaryTypes: [] },
  ];

  it.each([
    // groups, our title, our artist, expected id
    [letsDance, "Let's Dance", "David Bowie", "ld-album"], // curly apostrophe in MusicBrainz, straight in ours
    [divenire, "Divenire", "Ludovico Einaudi", "div-album"], // the single's "2006" sorts first, but an album beats a single
    [darkSide, "The Dark Side of the Moon", "Pink Floyd", "dsotm"], // made-up live group: a plain album beats an earlier live album
    [sevenDays, "Seven Days Walking", "Ludovico Einaudi", "sdw-box"], // only the compilation has the exact title: it is used
    [curlyInOurData, "Whatever People Say I Am, That’s What I’m Not", "Arctic Monkeys", "wpsia"], // curly on our side also matches
    [letsDance, "Let's Dance", "Bowie", null], // other artist: no match, as before
  ] as const)("%#: %s by %s → %s", (groups, title, artist, expected) => {
    expect(pickReleaseGroup([...groups], title, artist)?.id ?? null).toBe(expected);
  });
});

describe("getJson · bug 29", () => {
  const ok = () => new Response(JSON.stringify({ fine: true }), { status: 200 });
  const busy = () => new Response("", { status: 503 });
  const fake = (...answers: (() => Response)[]) => {
    const calls: unknown[] = [];
    const fetcher = (async (...args: unknown[]) => {
      calls.push(args);
      return answers[calls.length - 1]();
    }) as typeof fetch;
    return { fetcher, calls };
  };

  it.each([
    // answers in order, calls made, result
    [[ok], 1, "data"], // first try works
    [[busy, ok], 2, "data"], // 503, then works on the second try
    [[busy, busy], 2, "error"], // two 503s: gives up, no third try
    [[() => new Response("", { status: 404 })], 1, "error"], // other failures: no second try
  ] as const)("%#: %j → %i call(s), %s", async (answers, callCount, result) => {
    const { fetcher, calls } = fake(...answers);
    const outcome = await getJson("https://example.test", fetcher, 0).then(
      () => "data",
      () => "error",
    );
    expect(outcome).toBe(result);
    expect(calls).toHaveLength(callCount);
  });

  it("asks Next.js to keep the answer for one day", async () => {
    const { fetcher, calls } = fake(ok);
    await getJson("https://example.test", fetcher, 0);
    const init = (calls[0] as [string, RequestInit & { next?: { revalidate?: number } }])[1];
    expect(init.next?.revalidate).toBe(86400);
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
