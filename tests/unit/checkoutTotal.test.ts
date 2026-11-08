// Decision table from story 7 · What the checkout shows and Acceptance criteria.
import { describe, expect, it } from "vitest";
import { checkoutTotal, euros } from "@/lib/rules/checkoutTotal";

describe("checkoutTotal", () => {
  it.each([
    // record price, total
    [28, 34.9], // acceptance criterion: 28 + 4.90 + 2.00
    [32, 38.9], // seed: green 2012 Remaster
    [24.5, 31.4], // price with cents
    [0.1, 7.0], // cents add up exactly (no 6.999…)
    [185, 191.9], // three-digit price
  ] as const)("record €%s → total €%s", (price, total) => {
    expect(checkoutTotal(price).total).toBe(total);
  });

  it("shows shipping €4.90 and the protection fee €2.00 before paying", () => {
    expect(checkoutTotal(28)).toEqual({ recordPrice: 28, shipping: 4.9, protectionFee: 2, total: 34.9 });
  });
});

describe("euros", () => {
  it.each([
    [34.9, "€34.90"],
    [2, "€2.00"],
    [4.9, "€4.90"],
    [191.9, "€191.90"],
  ] as const)("%s → %s", (amount, text) => {
    expect(euros(amount)).toBe(text);
  });
});
