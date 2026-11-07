// Decision table from SPEC story 1 · suggestions criterion (finding #29).
import { describe, expect, it } from "vitest";
import { lettersDifferent, searchSuggestions, tolerance } from "@/lib/rules/searchSuggestions";
import { albums, ZIGGY } from "./fixtures/albums";

const titles = (typed: string) => searchSuggestions(albums, typed).map((a) => a.title);

describe("tolerance by letters typed", () => {
  it.each([[3, 0], [4, 1], [5, 1], [6, 2], [9, 2]])("%i letters → %i", (n, t) => expect(tolerance(n)).toBe(t));
});

describe("searchSuggestions", () => {
  it.each([
    ["zigy", [ZIGGY]], // 4 letters typed, 1 letter different
    ["ZIGY", [ZIGGY]], // case ignored
    ["zgy", []], // 3 letters → no suggestions, only "No albums found"
    ["zgyy", []], // 4 letters, 2 different → too far
    ["bjrok", []], // 5 letters, swapped letters count as 2 → too far
    ["homogenik", ["Homogenic"]], // 9 letters, 1 different
    ["stardsut", [ZIGGY]], // 8 letters, 2 different
    ["xyzzy", []], // nothing close → "No albums found"
  ] as const)("%j → %j", (typed, expected) => {
    expect(titles(typed)).toEqual(expected);
  });

  it("shows at most 3, closest first, then newest", () => {
    const bowie = (title: string, releaseYear: number) => ({ title, artist: "David Bowie", releaseYear });
    const four = [bowie("A", 1970), bowie("B", 1980), bowie("C", 1990), bowie("D", 2000)];
    expect(searchSuggestions(four, "bowee").map((a) => a.title)).toEqual(["D", "C", "B"]);
  });
});

describe("lettersDifferent", () => {
  it.each([["zigy", "ziggy", 1], ["bowie", "bowie", 0], ["kitten", "sitting", 3], ["", "abc", 3]] as const)(
    "%s vs %s → %i", (a, b, n) => expect(lettersDifferent(a, b)).toBe(n),
  );
});
