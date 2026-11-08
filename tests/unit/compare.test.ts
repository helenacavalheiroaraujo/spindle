// Decision table from SPEC story 4 · Scope, Acceptance criteria and Edge cases, with the example data of story 3.
import { describe, expect, it } from "vitest";
import {
  compareColumns,
  compareRows,
  conditionName,
  firstPressingId,
  fitOf,
  soundWord,
  typicalRangeText,
} from "@/lib/rules/compare";
import type { Priority } from "@/lib/rules/priorities";
import type { VersionFacts } from "@/lib/rules/recommendation";

// Same versions as tests/unit/recommendation.test.ts: the 1972 original has no listings.
const v1990: VersionFacts = { id: "1990", soundScore: 2, originalScore: 2, activePrices: [24, 30, 185], activeConditions: ["VG+", "VG"] };
const v2012: VersionFacts = { id: "2012", soundScore: 5, originalScore: 3, activePrices: [32, 36], activeConditions: ["NM", "VG+"] };
const v1972: VersionFacts = { id: "1972", soundScore: 4, originalScore: 5, activePrices: [], activeConditions: [] };
// A third version with listings, for the desktop case.
const v2003: VersionFacts = { id: "2003", soundScore: 3, originalScore: 2, activePrices: [40], activeConditions: ["VG"] };

const columns = (ranking: Priority[], versions: VersionFacts[], max: 2 | 3) => compareColumns(ranking, versions, max);

describe("which versions are compared", () => {
  it.each([
    ["phone: 2 versions", [v1972, v1990, v2012, v2003], 2, 2],
    ["desktop: up to 3 versions", [v1972, v1990, v2012, v2003], 3, 3],
    ["desktop with only 2 versions on sale → 2", [v1972, v1990, v2012], 3, 2],
  ] as const)("%s", (_case, versions, max, count) => {
    expect(columns(["price", "sound"], [...versions], max)).toHaveLength(count);
  });

  it("the first column is the recommended version (1. Price, 2. Sound → 2012 Remaster)", () => {
    expect(columns(["price", "sound"], [v1972, v1990, v2012], 3)[0]).toBe("2012");
  });

  it("the other columns follow by total score (1. Price, 2. Sound: 2012 = 22, 1990 = 19, 2003 = 15)", () => {
    expect(columns(["price", "sound"], [v2003, v1990, v2012], 3)).toEqual(["2012", "1990", "2003"]);
  });

  it("the order depends on the buyer's ranking (1. Sound only: 2012 = 15, 2003 = 9, 1990 = 6)", () => {
    expect(columns(["sound"], [v1990, v2003, v2012], 3)).toEqual(["2012", "2003", "1990"]);
  });

  it("a version without active listings is never shown", () => {
    expect(columns(["original"], [v1972, v1990, v2012], 3)).not.toContain("1972");
  });

  it.each([
    ["only one version on sale → no comparison", [v1972, v2012]],
    ["no version on sale → no comparison", [v1972]],
  ] as const)("%s", (_case, versions) => {
    expect(columns(["price"], [...versions], 3)).toEqual([]);
  });

  it("no priority chosen → no comparison (there is no recommendation either)", () => {
    expect(columns([], [v1990, v2012], 3)).toEqual([]);
  });

  it("two versions with the same total: the cheaper one first (same tie rule as story 3)", () => {
    const a: VersionFacts = { id: "a", soundScore: 3, originalScore: 3, activePrices: [30], activeConditions: ["NM"] };
    const b: VersionFacts = { id: "b", soundScore: 3, originalScore: 3, activePrices: [30], activeConditions: ["NM"] };
    // Both have the same score and price: the order given decides, and the recommendation is stable.
    expect(columns(["sound"], [a, b], 2)).toEqual(["a", "b"]);
  });
});

describe("rows", () => {
  const ids = (ranking: Priority[]) => compareRows(ranking).map((r) => r.id);

  it.each([
    ["1. Price, 2. Sound", ["price", "sound"], ["price", "sound", "firstPressing", "condition", "forSale"]],
    ["1. Sound, 2. Price", ["sound", "price"], ["sound", "price", "firstPressing", "condition", "forSale"]],
    ["1. Condition only", ["condition"], ["condition", "price", "sound", "firstPressing", "forSale"]],
    ["1. Original, 2. Condition, 3. Sound", ["original", "condition", "sound"], ["firstPressing", "condition", "sound", "price", "forSale"]],
    ["all four, ranked", ["sound", "original", "condition", "price"], ["sound", "firstPressing", "condition", "price", "forSale"]],
  ] as const)("%s → chosen rows first in rank order, the rest in fixed order, 'For sale' last", (_case, ranking, expected) => {
    expect(ids([...ranking])).toEqual(expected);
  });

  it("chosen rows carry their rank number; the others carry none", () => {
    expect(compareRows(["sound", "price"])).toEqual([
      { id: "sound", rank: 1 },
      { id: "price", rank: 2 },
      { id: "firstPressing", rank: null },
      { id: "condition", rank: null },
      { id: "forSale", rank: null },
    ]);
  });

  it("'For sale' is never a priority row", () => {
    expect(compareRows(["price", "sound", "original", "condition"]).find((r) => r.id === "forSale")!.rank).toBeNull();
  });
});

describe("how a version fits the buyer's priorities (version page)", () => {
  const album = [v1972, v1990, v2012];

  it.each([
    ["2012 Remaster, 1. Price 2. Sound → matches both (price 4, sound 5)", v2012, ["price", "sound"], ["price", "sound"], []],
    ["1990 Reissue, 1. Price 2. Sound → matches price (5), not sound (2)", v1990, ["price", "sound"], ["price"], ["sound"]],
    ["1990 Reissue, 1. Sound only → not a match", v1990, ["sound"], [], ["sound"]],
    ["rank order is kept", v2012, ["sound", "price"], ["sound", "price"], []],
  ] as const)("%s", (_case, version, ranking, matches, misses) => {
    expect(fitOf([...ranking], version, album)).toEqual({ matches, misses });
  });

  it("scores use the whole album's cheapest price, as the recommendation does", () => {
    // 2012 alone is €32 vs the album's cheapest €24 → price 4, a match.
    expect(fitOf(["price"], v2012, album).matches).toEqual(["price"]);
  });
});

describe("sound word (from the 1–5 score; no number is shown)", () => {
  it.each([
    [5, "Very clean"],
    [4, "Clean"],
    [3, "Balanced"],
    [2, "A bit flat"],
    [1, "Flat"],
  ] as const)("score %i → %s", (score, word) => {
    expect(soundWord(score)).toBe(word);
  });
});

describe("typical price (the stored range of story 6)", () => {
  it.each([
    ["a range", 28, 36, "€28–€36"],
    ["a range with cents", 28.5, 36, "€28.50–€36"],
    ["no range stored", null, null, null],
  ] as const)("%s", (_case, min, max, expected) => {
    expect(typicalRangeText(min, max)).toBe(expected);
  });
});

describe("first pressing: the album's oldest version", () => {
  const versions = [
    { id: "2012", releaseYear: 2012 },
    { id: "1972", releaseYear: 1972 },
    { id: "1990", releaseYear: 1990 },
  ];

  it("the oldest version is the first pressing, the others are not", () => {
    expect(firstPressingId(versions)).toBe("1972");
  });

  it("works on the whole album, even when the oldest version has no listings", () => {
    expect(firstPressingId(versions.slice(0, 1).concat(versions.slice(2)))).toBe("1990");
  });

  it("no versions → null", () => {
    expect(firstPressingId([])).toBeNull();
  });
});

describe("best condition on sale (grade name)", () => {
  it.each([
    [["NM", "VG+"], "Near mint"],
    [["VG+", "VG"], "Very good"],
    [["VG"], "Good"],
    [["G"], "Fair"],
  ] as const)("%j → %s", (conditions, name) => {
    expect(conditionName([...conditions])).toBe(name);
  });

  it("no active listings → null", () => {
    expect(conditionName([])).toBeNull();
  });
});
