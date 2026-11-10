// Decision table from story 20 · Acceptance criteria: a red or sold listing cannot be added; a seller cannot add
// their own listing (finding #12); a record that can no longer be bought leaves the cart (use case 5).
import { describe, expect, it } from "vitest";
import { canAddToCart, leftCartMessage, staysInCart } from "@/lib/rules/cartAccess";
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

describe("leftCartMessage", () => {
  it("sold: the text of the design", () => {
    expect(leftCartMessage("Homogenic, 2017 Reissue", "sold")).toBe(
      "“Homogenic, 2017 Reissue” was just sold to someone else and left your cart. The total is updated.",
    );
  });
  it("removed: no longer available", () => {
    expect(leftCartMessage("Vespertine, 2001", "removed")).toBe("“Vespertine, 2001” is no longer available and left your cart. The total is updated.");
  });
});
