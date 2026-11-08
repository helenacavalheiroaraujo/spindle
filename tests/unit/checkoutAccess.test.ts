// Decision table from story 7 · Acceptance criteria: red listings cannot reach the checkout;
// a sold listing cannot be bought again. Green and yellow can (use case 1).
import { describe, expect, it } from "vitest";
import { canCheckout, checkoutPath, isOwnListing } from "@/lib/rules/checkoutAccess";
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

// Story 8 · finding #12 (DECISIONS): a signed-in seller sees "Your listing" instead of Buy, and never reaches the checkout.
describe("isOwnListing and the seller's own listing", () => {
  it.each([
    // listing's seller, signed-in seller, own
    ["p1", "p1", true],
    ["p1", "p2", false],
    ["p1", null, false], // signed out: Buy, then log in (story 7)
  ] as const)("seller %s, viewer %s → %s", (seller, viewer, expected) => {
    expect(isOwnListing(seller, viewer)).toBe(expected);
  });

  it.each([
    ["green, own listing", "p1", false],
    ["green, someone else's", "p2", true],
    ["green, signed out", null, true],
  ] as const)("%s → can reach the checkout %s", (_case, viewer, expected) => {
    expect(canCheckout({ ...listing(), sellerId: "p1" }, "v2012", viewer)).toBe(expected);
  });
});

describe("checkoutPath", () => {
  it("carries the version the buyer came from", () => {
    expect(checkoutPath("l1", "v1990")).toBe("/checkout/l1?version=v1990");
  });
});
