// Decision table for story 38: which pages show the search in the desktop header.
import { describe, expect, it } from "vitest";
import { showsHeaderSearch } from "@/lib/rules/headerSearch";

describe("showsHeaderSearch", () => {
  it.each([
    ["home", "/", true],
    ["search results", "/search", true],
    ["album page", "/albums/abc", true],
    ["genre page", "/genres/jazz", true],
    ["versions", "/versions/v1", true],
    ["listings", "/versions/v1/listings", true],
    ["one listing", "/listings/l1", true],
    ["order placed", "/orders/placed", true],
    ["log in", "/login", true],
    ["a page that only starts like the cart", "/cartography", true],
    ["cart", "/cart", false],
    ["checkout of the cart", "/cart/checkout", false],
    ["checkout of one record", "/checkout/l1", false],
    ["account, Orders tab", "/account/orders", false],
    ["account, For sale tab", "/account/for-sale", false],
    ["account, details tab", "/account/details", false],
    ["account root", "/account", false],
    ["sell", "/sell", false],
    ["sell, one version", "/sell/versions/v1", false],
  ])("%s → %s", (_name, path, expected) => {
    expect(showsHeaderSearch(path)).toBe(expected);
  });
});
