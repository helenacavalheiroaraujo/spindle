// Decision table from story 9 · "On listings, sellers with a shop name show 'Shop'; others show 'Private seller'"
// and DECISIONS.md (finding #64): shops also show their shop name.
import { describe, expect, it } from "vitest";
import { listingPlace, sellerOf, sellerText } from "@/lib/rules/seller";

describe("sellerOf", () => {
  it.each([
    ["Discos do Rui", { kind: "shop", shopName: "Discos do Rui" }],
    ["  Discos do Rui  ", { kind: "shop", shopName: "Discos do Rui" }], // spaces trimmed
    [null, { kind: "private" }], // no shop name
    ["", { kind: "private" }],
    ["   ", { kind: "private" }], // blank counts as none
  ])("%j → %j", (shopName, expected) => {
    expect(sellerOf(shopName)).toEqual(expected);
  });
});

describe("sellerText", () => {
  it.each([
    ["Discos do Rui", "Discos do Rui (Shop)"],
    [null, "Private seller"],
  ])("%j → %s", (shopName, expected) => {
    expect(sellerText(sellerOf(shopName))).toBe(expected);
  });
});

// Bug 11: where a listing is sold from.
describe("listingPlace", () => {
  const profile = { city: "Porto", shopName: "Discos do Bairro" };
  it.each([
    [{ sellerCity: "Lisbon", sellerShopName: "Discos da Baixa" }, { city: "Lisbon", shopName: "Discos da Baixa" }], // its own place
    [{ sellerCity: "Lisbon", sellerShopName: null }, { city: "Lisbon", shopName: null }], // own place, no shop: not the profile's shop
    [{ sellerCity: null, sellerShopName: null }, profile], // older listing: the profile, as before
  ])("%j → %j", (listing, expected) => {
    expect(listingPlace(listing, profile)).toEqual(expected);
  });
});
