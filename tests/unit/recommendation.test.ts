// Decision table from SPEC story 3 · How the pick is made, Acceptance criteria, Example data and Edge cases.
import { describe, expect, it } from "vitest";
import { fillReason, priceText, recommend, scoresOf, type VersionFacts } from "@/lib/rules/recommendation";
import type { Priority } from "@/lib/rules/priorities";

// Example data (SPEC story 3) plus the seed's 1972 UK original, which nobody is selling.
const v1990: VersionFacts = { id: "1990", soundScore: 2, originalScore: 2, activePrices: [24, 30, 185], activeConditions: ["VG+", "VG"] };
const v2012: VersionFacts = { id: "2012", soundScore: 5, originalScore: 3, activePrices: [32, 36], activeConditions: ["NM", "VG+"] };
const v1972: VersionFacts = { id: "1972", soundScore: 4, originalScore: 5, activePrices: [], activeConditions: [] };
const album = [v1972, v1990, v2012];

const run = (ranking: Priority[], versions = album) => recommend(ranking, versions)!;

describe("scores", () => {
  it.each([
    ["€24 (cheapest) → price 5", v1990, 5],
    ["€32 → price 4", v2012, 4],
    ["€185 → price 1 (minimum)", { ...v2012, activePrices: [185] }, 1],
    ["no listings → price 0 (finding #28)", v1972, 0],
  ] as const)("%s", (_case, version, expected) => {
    expect(scoresOf(version as VersionFacts, 24).price).toBe(expected);
  });

  it.each([
    ["best condition is Near mint → 5", v2012, 5],
    ["best condition is Very good (VG+) → 4", v1990, 4],
    ["Good (VG) only → 3", { ...v1990, activeConditions: ["VG"] }, 3],
    ["Fair (G) only → 2", { ...v1990, activeConditions: ["G"] }, 2],
    ["no listings → 0 (finding #28)", v1972, 0],
  ] as const)("condition: %s", (_case, version, expected) => {
    expect(scoresOf(version as VersionFacts, 24).condition).toBe(expected);
  });
});

describe("recommended version", () => {
  it.each([
    ["1. Price, 2. Sound → 2012 Remaster (22 vs 19)", ["price", "sound"], "2012"],
    ["1. Price only → 1990 Reissue", ["price"], "1990"],
    ["1. Sound, 2. Price → 2012 Remaster", ["sound", "price"], "2012"],
    ["1. Original only → never the 1972, which has no listings", ["original"], "2012"],
  ] as const)("%s", (_case, ranking, expected) => {
    expect(run([...ranking]).recommendedId).toBe(expected);
  });

  it("on a tie, the cheaper version wins", () => {
    // Sound only: both score 5 → equal totals; €28 beats €32.
    const cheaper: VersionFacts = { ...v2012, id: "cheaper", activePrices: [28] };
    expect(run(["sound"], [v2012, cheaper]).recommendedId).toBe("cheaper");
    expect(run(["sound"], [cheaper, v2012]).recommendedId).toBe("cheaper");
  });

  it("returns nothing when no version has listings or no priority was chosen", () => {
    expect(recommend(["price"], [v1972])).toBeNull();
    expect(recommend([], album)).toBeNull();
  });
});

describe("matches (score 4 or 5, chosen priorities only, rank order)", () => {
  it.each([
    ["1. Price, 2. Sound → price (4) and sound (5)", ["price", "sound"], ["price", "sound"]],
    ["1. Sound, 2. Original → sound only (original is 3)", ["sound", "original"], ["sound"]],
    ["1. Price → price only, condition not chosen", ["price"], ["price"]],
  ] as const)("%s", (_case, ranking, expected) => {
    expect(run([...ranking]).matches).toEqual(expected);
  });
});

describe("reasons", () => {
  it("follow the rank order: 1. Sound, 2. Price → sound, then price", () => {
    expect(run(["sound", "price"]).reasons).toEqual(["sound", "price"]);
  });
  it("are at most 3", () => {
    expect(run(["condition", "sound", "price", "original"]).reasons).toEqual(["condition", "sound", "price"]);
  });
});

describe("alternative (best on the 1st priority alone)", () => {
  it.each([
    ["1. Price, 2. Sound → Cheapest option: 1990", ["price", "sound"], { versionId: "1990", label: "Cheapest option" }],
    ["1. Price only → same as recommendation, not shown", ["price"], null],
    ["1. Condition, 2. Price, 3. Sound → same (2012), not shown", ["condition", "price", "sound"], null],
  ] as const)("%s", (_case, ranking, expected) => {
    expect(run([...ranking]).alternative).toEqual(expected);
  });

  it("conflicting priorities: 1. Sound, 2. Price → the cheaper one wins, alternative is Best sound", () => {
    // cheap: sound 4, €10 → price 5 → 4×3 + 5×2 = 22. best: sound 5, €40 → price 1 → 5×3 + 1×2 = 17.
    const cheap: VersionFacts = { id: "cheap", soundScore: 4, originalScore: 2, activePrices: [10], activeConditions: ["VG"] };
    const bestSound: VersionFacts = { id: "best", soundScore: 5, originalScore: 3, activePrices: [40], activeConditions: ["NM"] };
    const r = run(["sound", "price"], [cheap, bestSound]);
    expect(r.recommendedId).toBe("cheap");
    expect(r.alternative).toEqual({ versionId: "best", label: "Best sound" });
  });

  it.each([
    ["original", "Closest to the original"],
    ["condition", "Best condition"],
  ] as const)("1st priority %s → label \"%s\"", (first, label) => {
    // A listed version that beats 2012 on the 1st priority but loses on the total.
    const strong: VersionFacts = { id: "strong", soundScore: 1, originalScore: 5, activePrices: [200], activeConditions: ["NM"] };
    const weak: VersionFacts = { ...v2012, activeConditions: ["VG+"] };
    const r = run([first, "price", "sound"], [strong, weak]);
    expect(r.recommendedId).toBe("2012");
    expect(r.alternative).toEqual({ versionId: "strong", label });
  });

  it("only one version on sale → no alternative", () => {
    expect(run(["price", "sound"], [v1972, v2012]).alternative).toBeNull();
  });
});

describe("ideal but unavailable (finding #28)", () => {
  it.each([
    ["1. Original, 2. Sound → 1972 (23 vs 19)", ["original", "sound"], "1972"],
    ["1. Sound, 2. Original → 1972 (22 vs 21)", ["sound", "original"], "1972"],
    ["1. Original, 2. Price → none (price counts 0)", ["original", "price"], null],
    ["1. Price → none", ["price"], null],
  ] as const)("%s", (_case, ranking, expected) => {
    expect(run([...ranking]).idealUnavailableId).toBe(expected);
  });

  it("a tie with the recommendation shows no note", () => {
    // Sound only: 1972 has 4, a listed version with 4 ties → no note.
    const listed4: VersionFacts = { ...v1990, soundScore: 4 };
    expect(run(["sound"], [v1972, listed4]).idealUnavailableId).toBeNull();
  });
});

describe("prices in the reasons", () => {
  const own = { lowestPrice: 32, typicalMin: 28, typicalMax: 36 };
  const firstPressing = { lowestPrice: null, typicalMin: 150, typicalMax: 220 };

  it.each([
    ["lowest active price", own, "€32"],
    ["no listings → typical range with 'typically' (finding #32)", firstPressing, "typically €150–€220"],
    ["cents are kept", { ...own, lowestPrice: 24.5 }, "€24.50"],
    ["nothing known → none", { lowestPrice: null, typicalMin: null, typicalMax: null }, null],
  ] as const)("%s", (_case, facts, expected) => {
    expect(priceText(facts)).toBe(expected);
  });

  it("fills the placeholders from the listings", () => {
    expect(fillReason("Costs {lowest_price}, vs {first_pressing_price} for a first pressing.", { own, firstPressing }))
      .toBe("Costs €32, vs typically €150–€220 for a first pressing.");
  });
  it("leaves a sentence out when a price is unknown", () => {
    expect(fillReason("vs {first_pressing_price}", { own, firstPressing: null })).toBeNull();
  });
  it("keeps a sentence without placeholders", () => {
    expect(fillReason("A careful remaster.", { own, firstPressing: null })).toBe("A careful remaster.");
  });
});
