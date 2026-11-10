// Decision table from SPEC story 6 · Label rule and Acceptance criteria.
import { describe, expect, it } from "vitest";
import { priceBar, priceLabel } from "@/lib/rules/fairPrice";

const R2012 = { min: 28, max: 36 }; // seed: 2012 Remaster
const R1990 = { min: 20, max: 28 }; // seed: 1990 Reissue
const NONE = { min: null, max: null }; // seed: Hunky Dory versions

describe("priceLabel", () => {
  it.each([
    // price, range, label
    [24, R2012, "Below typical"], // acceptance criterion
    [28, R2012, "Typical"], // bottom limit included
    [36, R2012, "Typical"], // top limit included
    [40, R2012, "Above typical"], // acceptance criterion
    [32, R2012, "Typical"], // seed: green 2012 Remaster
    [27.99, R2012, "Below typical"], // just under the bottom limit
    [36.01, R2012, "Above typical"], // just over the top limit
    [185, R1990, "Above typical"], // seed: red, claimed 1972 original, compared with its actual 1990 Reissue
    [29, R1990, "Above typical"], // seed: red, claimed 2012 Remaster, compared with its actual 1990 Reissue
    [30, NONE, null], // version with no range: no label
  ] as const)("€%s with %o → %s", (price, range, label) => {
    expect(priceLabel(price, range)).toBe(label);
  });
});

// Fair price bar next to the recommendation on desktop (design option A): where the lowest price sits in the range.
describe("priceBar", () => {
  it.each([
    ["inside the range", 19, { min: 15, max: 25 }, { bandLeft: 25, bandRight: 75, marker: 45 }],
    ["on the lower limit", 15, { min: 15, max: 25 }, { bandLeft: 25, bandRight: 75, marker: 25 }],
    ["on the upper limit", 25, { min: 15, max: 25 }, { bandLeft: 25, bandRight: 75, marker: 75 }],
    ["below the range, still on the bar", 12, { min: 15, max: 25 }, { bandLeft: 25, bandRight: 75, marker: 10 }],
    ["above the range, still on the bar", 28, { min: 15, max: 25 }, { bandLeft: 25, bandRight: 75, marker: 90 }],
    ["far below: stays at the left end", 1, { min: 15, max: 25 }, { bandLeft: 25, bandRight: 75, marker: 0 }],
    ["far above: stays at the right end", 90, { min: 15, max: 25 }, { bandLeft: 25, bandRight: 75, marker: 100 }],
    ["seed 2012 Remaster, €32 (middle of €28–€36)", 32, R2012, { bandLeft: 25, bandRight: 75, marker: 50 }],
    ["a range of a single price", 20, { min: 20, max: 20 }, { bandLeft: 50, bandRight: 50, marker: 50 }],
  ])("%s", (_name, price, range, expected) => {
    expect(priceBar(price, range)).toEqual(expected);
  });
  it("no range → no bar, never a guess", () => {
    expect(priceBar(30, NONE)).toBeNull();
    expect(priceBar(30, { min: 20, max: null })).toBeNull();
  });
});
