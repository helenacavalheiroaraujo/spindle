// Decision table from SPEC story 6 · Label rule and Acceptance criteria.
import { describe, expect, it } from "vitest";
import { priceLabel } from "@/lib/rules/fairPrice";

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
