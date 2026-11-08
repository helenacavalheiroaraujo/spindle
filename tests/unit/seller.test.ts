// Decision table from story 9 · "On listings, sellers with a shop name show 'Shop'; others show 'Private seller'"
// and DECISIONS.md (finding #64): shops also show their shop name.
import { describe, expect, it } from "vitest";
import { sellerOf, sellerText } from "@/lib/rules/seller";

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
