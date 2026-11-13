// Decision table from SPEC story 16 · Acceptance criteria (seed-like data).
import { describe, expect, it } from "vitest";
import { boxContent, moveHighlight, suggestionTag } from "@/lib/rules/suggestionBox";
import { albums, ZIGGY } from "./fixtures/albums";

const content = (typed: string) => {
  const c = boxContent(albums, typed);
  return [c.kind, "albums" in c ? c.albums.map((a) => a.title) : []];
};

describe("boxContent", () => {
  it.each([
    ["", "none", []], // nothing typed: no box
    ["   ", "none", []], // spaces only count as nothing
    ["b", "tooShort", []], // 1 or 2 characters: the box says to type at least 3 (bug 26)
    ["bo", "tooShort", []],
    ["  b ", "tooShort", []], // spaces do not count
    ["bj", "tooShort", []],
    ["bjö", "albums", ["Homogenic"]], // accents do not count either: 3 characters
    ["bowie", "albums", ["Blackstar", "Let's Dance", ZIGGY, "Hunky Dory"]],
    ["BOWIE", "albums", ["Blackstar", "Let's Dance", ZIGGY, "Hunky Dory"]],
    ["bjork", "albums", ["Homogenic"]], // accents ignored
    ["zig", "albums", [ZIGGY]], // from the 3rd character
    ["zigy", "didYouMean", [ZIGGY]], // typo
    ["xyzxyz", "empty", []],
  ] as const)("%j → %s %j", (typed, kind, titles) => {
    expect(content(typed)).toEqual([kind, titles]);
  });

  it("shows at most 4 albums, newest first, even when more match", () => {
    const many = Array.from({ length: 9 }, (_, i) => ({ title: `Album ${i}`, artist: "Prolific", releaseYear: 1970 + i }));
    const c = boxContent(many, "prolific");
    expect(c.kind).toBe("albums");
    expect("albums" in c && c.albums.map((a) => a.releaseYear)).toEqual([1978, 1977, 1976, 1975]);
  });
});

describe("suggestionTag", () => {
  it.each([
    [{ versionCount: 3, access: "open" }, "3 versions"],
    [{ versionCount: 1, access: "open" }, "1 version"],
    [{ versionCount: 2, access: "no_listings" }, "No listings"],
    [{ versionCount: 2, access: "not_in_demo" }, "Not in the demo"],
  ] as const)("%j → %s", (album, tag) => {
    expect(suggestionTag(album)).toBe(tag);
  });
});

describe("moveHighlight", () => {
  it.each([
    [null, "ArrowDown", 4, 0],
    [0, "ArrowDown", 4, 1],
    [3, "ArrowDown", 4, 3], // the end does not wrap
    [null, "ArrowUp", 4, null],
    [0, "ArrowUp", 4, null], // up from the first row: nothing highlighted, Enter opens the results page
    [2, "ArrowUp", 4, 1],
    [null, "ArrowDown", 0, null],
  ] as const)("%j %s of %d → %j", (current, key, count, expected) => {
    expect(moveHighlight(current, key, count)).toBe(expected);
  });
});
