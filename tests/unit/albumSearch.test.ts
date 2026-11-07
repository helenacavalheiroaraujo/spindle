// Decision table from SPEC story 1 · Acceptance criteria (seed-like data).
import { describe, expect, it } from "vitest";
import { normalize, searchAlbums } from "@/lib/rules/albumSearch";
import { albums, ZIGGY } from "./fixtures/albums";

const titles = (typed: string) => searchAlbums(albums, typed).map((a) => a.title);

describe("searchAlbums", () => {
  it.each([
    ["", []],
    ["zi", []], // fewer than 3 characters → nothing
    ["  b ", []], // spaces do not count
    ["ziggy", [ZIGGY]],
    ["bowie", ["Blackstar", "Let's Dance", ZIGGY, "Hunky Dory"]],
    ["BOWIE", ["Blackstar", "Let's Dance", ZIGGY, "Hunky Dory"]],
    ["bjork", ["Homogenic"]],
    ["Björk", ["Homogenic"]],
    ["zig", [ZIGGY]], // from the 3rd character
    ["dory", ["Hunky Dory"]], // title
    ["zigy", []], // typo → no match (suggestions handle it)
  ] as const)("%j → %j", (typed, expected) => {
    expect(titles(typed)).toEqual(expected);
  });

  it("lists every album of a prolific artist, newest first", () => {
    const many = Array.from({ length: 25 }, (_, i) => ({ title: `Album ${i}`, artist: "Prolific", releaseYear: 1970 + i }));
    const result = searchAlbums(many, "prolific");
    expect(result).toHaveLength(25);
    expect(result[0].releaseYear).toBe(1994);
    expect(result[24].releaseYear).toBe(1970);
  });
});

describe("normalize", () => {
  it("ignores case and accents", () => {
    expect(normalize("  BJÖRK ")).toBe("bjork");
    expect(normalize("Sigur Rós")).toBe("sigur ros");
  });
});
