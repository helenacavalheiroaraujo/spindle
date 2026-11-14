// Decision tables for lib/rules/trackPreview.ts (story 34). Example data: Ziggy Stardust (seed album 1) and the
// iTunes album "… (2012 Remaster)" as in the story; "It Ain't Easy" has no iTunes match in the example.
import { describe, expect, it } from "vitest";
import {
  formatPlayed,
  matchPreviews,
  normalizeTitle,
  pickItunesAlbum,
  sameTitle,
  showPreviewNote,
} from "@/lib/rules/trackPreview";

describe("sameTitle: ignores case, accents, quotes and text in brackets", () => {
  it.each([
    // our title, iTunes title, same track?
    ["Starman", "Starman (2012 Remaster)", true], // story example: bracketed text ignored
    ["Starman", "Starman [Live]", true], // square brackets too
    ["Starman", "STARMAN", true], // case
    ["Five Years", "Five  Years ", true], // extra spaces
    ["It Ain't Easy", "It Ain’t Easy", true], // straight vs curly apostrophe
    ["It Ain't Easy", "It Aint Easy", true], // quotes ignored
    ['"Heroes"', "Heroes (2017 Remaster)", true], // quotes and brackets together
    ["Café Society", "Cafe Society", true], // accents
    ["Rock 'n' Roll Suicide", "Rock 'N' Roll Suicide (2012 Remaster)", true],
    ["Starman", "Five Years", false], // different track
    ["Starman", "Starman - 2012 Remaster", false], // a dash suffix is not a bracket: not in the story's rule
    ["Soul Love", "Soul", false], // part of a title is not a match
    ["(Intro)", "(Outro)", false], // only bracketed text: nothing left to compare
  ] as const)("%s vs %s → %s", (ours, theirs, expected) => {
    expect(sameTitle(ours, theirs)).toBe(expected);
  });

  it("normalizeTitle keeps the words in order", () => {
    expect(normalizeTitle("Starman (2012 Remaster)")).toBe("starman");
    expect(normalizeTitle("Moonage Daydream")).toBe("moonage daydream");
  });
});

describe("pickItunesAlbum", () => {
  const albums = [
    { id: 1, name: "Best of Bowie", artist: "David Bowie" },
    { id: 2, name: "The Rise and Fall of Ziggy Stardust and the Spiders from Mars (2012 Remaster)", artist: "David Bowie" },
    { id: 3, name: "The Rise and Fall of Ziggy Stardust and the Spiders From Mars (Live)", artist: "David Bowie" },
    { id: 4, name: "Kind of Blue", artist: "A Tribute Band" },
  ];
  it.each([
    // title, artist, expected iTunes album id
    ["The Rise and Fall of Ziggy Stardust and the Spiders from Mars", "David Bowie", 2], // remaster matches; first wins
    ["Kind of Blue", "Miles Davis", null], // right title, other artist
    ["Hunky Dory", "David Bowie", null], // not in the results
  ] as const)("%s by %s → %s", (title, artist, expected) => {
    expect(pickItunesAlbum(albums, title, artist)?.id ?? null).toBe(expected);
  });
});

describe("matchPreviews", () => {
  const ziggy = ["Five Years", "Soul Love", "Starman", "It Ain't Easy"];
  const itunes = [
    { title: "Five Years (2012 Remaster)", previewUrl: "five.m4a" },
    { title: "Soul Love (2012 Remaster)", previewUrl: null }, // iTunes has the track but no preview
    { title: "Starman (2012 Remaster)", previewUrl: "starman.m4a" },
    { title: "Starman (Single Version)", previewUrl: "starman-single.m4a" }, // same title later in album order
  ];

  it.each([
    // track, expected preview
    ["Five Years", "five.m4a"], // matched
    ["Soul Love", null], // matched title but no preview → no button
    ["Starman", "starman.m4a"], // two iTunes tracks with that title: the first in album order
    ["It Ain't Easy", null], // no match → no button
  ] as const)("%s → %s", (track, expected) => {
    expect(matchPreviews(ziggy, itunes)[ziggy.indexOf(track)]).toBe(expected);
  });

  it("iTunes down (no tracks): no previews", () => {
    expect(matchPreviews(ziggy, [])).toEqual([null, null, null, null]);
  });
});

describe("showPreviewNote: the line shows whenever at least one play button shows", () => {
  it.each([
    [["a.m4a", null], true],
    [[null, null], false],
    [[], false],
  ] as const)("%j → %s", (previews, expected) => {
    expect(showPreviewNote([...previews])).toBe(expected);
  });
});

describe("formatPlayed", () => {
  it.each([
    [0, "0:00"],
    [12.7, "0:12"], // design example "❚❚ 0:12"
    [30, "0:30"],
    [75, "1:15"],
    [Number.NaN, "0:00"],
    [-1, "0:00"],
  ] as const)("%s s → %s", (seconds, expected) => {
    expect(formatPlayed(seconds)).toBe(expected);
  });
});
