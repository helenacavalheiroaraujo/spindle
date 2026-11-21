// Decision table from story 20 · Acceptance criteria: a red or sold listing cannot be added; a seller cannot add
// their own listing (finding #12); a record that can no longer be bought stays in the cart, greyed (story 35).
import { describe, expect, it } from "vitest";
import { canAddToCart, canGoToCheckout, staysInCart, unavailableMessage, unavailableTag } from "@/lib/rules/cartAccess";
import type { ListingForList } from "@/lib/rules/listingOrder";

const allMatch = { cover_label: "match", country_year: "match", matrix: "match" } as const;
const matrixUnsure = { ...allMatch, matrix: "uncertain" } as const;
const noMatch = { cover_label: "match", country_year: "no_match", matrix: "no_match" } as const;
const listing = (o: Partial<ListingForList> & { sellerId?: string } = {}) => ({
  id: "l1", price: 28, status: "on_sale" as const, claimedVersionId: "v2012", actualVersionId: "v2012",
  hasMatrixPhoto: true, checks: allMatch, sellerId: "seller", ...o,
});

describe("canAddToCart", () => {
  it.each([
    // case, listing, signed-in profile id, can add
    ["green", listing(), "buyer", true],
    ["yellow (matrix uncertain)", listing({ checks: matrixUnsure }), "buyer", true],
    ["red (a check does not match)", listing({ checks: noMatch }), "buyer", false],
    ["red under its claimed version, moved: yellow under its actual one", listing({ actualVersionId: "v1990", checks: noMatch }), "buyer", true],
    ["sold", listing({ status: "sold" }), "buyer", false],
    ["removed", listing({ status: "removed" }), "buyer", false],
    ["the seller's own listing (finding #12)", listing(), "seller", false],
    ["signed out (the link asks to log in)", listing(), null, true],
  ] as const)("%s → %s", (_case, l, viewer, expected) => {
    expect(canAddToCart(l, viewer)).toBe(expected);
  });
});

describe("staysInCart", () => {
  it.each([
    ["still on sale", listing(), true],
    ["sold to someone else", listing({ status: "sold" }), false],
    ["removed by its seller", listing({ status: "removed" }), false],
    ["now red", listing({ checks: noMatch }), false],
  ] as const)("%s → %s", (_case, l, expected) => {
    expect(staysInCart(l)).toBe(expected);
  });

  it("the seller's own listing is not judged by who is looking: it stays", () => {
    expect(staysInCart(listing({ sellerId: "seller" }))).toBe(true);
  });
});

describe("unavailableMessage and unavailableTag", () => {
  it.each([
    // case, status, tag, message
    ["sold", "sold", "Sold", "“Homogenic, 2017 Reissue” was sold to someone else. Remove it to go to checkout."],
    ["removed by its seller", "removed", "No longer available", "“Homogenic, 2017 Reissue” is no longer available. Remove it to go to checkout."],
    ["on sale but no longer matching", "on_sale", "No longer available", "“Homogenic, 2017 Reissue” is no longer available. Remove it to go to checkout."],
  ] as const)("%s → %s", (_case, status, tag, message) => {
    expect(unavailableTag(status)).toBe(tag);
    expect(unavailableMessage("Homogenic, 2017 Reissue", status)).toBe(message);
  });
});

describe("canGoToCheckout", () => {
  it.each([
    ["empty cart", [], false],
    ["one record, available", [{ available: true }], true],
    ["two records, both available", [{ available: true }, { available: true }], true],
    ["one sold, one available", [{ available: false }, { available: true }], false],
    ["only a sold record", [{ available: false }], false],
  ] as const)("%s → %s", (_case, items, expected) => {
    expect(canGoToCheckout([...items])).toBe(expected);
  });
});
