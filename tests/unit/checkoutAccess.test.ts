// Decision table from story 7 · Acceptance criteria: red listings cannot reach the checkout;
// a sold listing cannot be bought again. Green and yellow can (use case 1).
import { describe, expect, it } from "vitest";
import { canCheckout, checkoutPath } from "@/lib/rules/checkoutAccess";
import type { ListingForList } from "@/lib/rules/listingOrder";

const allMatch = { cover_label: "match", country_year: "match", matrix: "match" } as const;
const matrixUnsure = { ...allMatch, matrix: "uncertain" } as const;
const noMatch = { cover_label: "match", country_year: "no_match", matrix: "no_match" } as const;
const listing = (o: Partial<ListingForList> = {}): ListingForList => ({
  id: "l1", price: 28, status: "on_sale", claimedVersionId: "v2012", actualVersionId: "v2012", hasMatrixPhoto: true, checks: allMatch, ...o,
});

describe("canCheckout", () => {
  it.each([
    // case, listing, version in the address, can reach the checkout
    ["green", listing(), "v2012", true],
    ["yellow (matrix uncertain)", listing({ checks: matrixUnsure }), "v2012", true],
    ["yellow (no matrix photo)", listing({ hasMatrixPhoto: false }), "v2012", true],
    ["red (a check doesn't match)", listing({ checks: noMatch }), "v2012", false],
    ["red, moved: under its claimed version", listing({ actualVersionId: "v1990", checks: noMatch }), "v2012", false],
    ["moved: yellow under its actual version", listing({ actualVersionId: "v1990", checks: noMatch }), "v1990", true],
    ["green but sold", listing({ status: "sold" }), "v2012", false],
    ["green but removed", listing({ status: "removed" }), "v2012", false],
    ["version it is not shown under", listing(), "v1972", false],
  ] as const)("%s → %s", (_case, l, versionId, expected) => {
    expect(canCheckout(l, versionId)).toBe(expected);
  });
});

describe("checkoutPath", () => {
  it("carries the version the buyer came from", () => {
    expect(checkoutPath("l1", "v1990")).toBe("/checkout/l1?version=v1990");
  });
});
