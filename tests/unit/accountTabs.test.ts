// Decision tables from story 31 (tabs, their addresses and counts) and story 32 (first name, Log out).
import { describe, expect, it } from "vitest";
import { ACCOUNT_TABS, accountTabFor, afterLogOut, firstName, needsAccount, tabCount } from "@/lib/rules/accountTabs";

describe("ACCOUNT_TABS", () => {
  it("lists Orders, For sale and Account details, in that order, each with its own address", () => {
    expect(ACCOUNT_TABS.map((t) => [t.label, t.href])).toEqual([
      ["Orders", "/account/orders"],
      ["For sale", "/account/for-sale"],
      ["Account details", "/account/details"],
    ]);
  });
});

describe("accountTabFor", () => {
  it.each([
    ["/account", "orders"], // Orders opens first
    ["/account/", "orders"],
    ["/account/orders", "orders"],
    ["/account/for-sale", "for-sale"],
    ["/account/details", "details"],
    ["/my-listings", null], // redirected by the server to /account/for-sale
    ["/account/other", null],
    ["/", null],
  ])("%s → %s", (path, expected) => {
    expect(accountTabFor(path)).toBe(expected);
  });
});

describe("tabCount", () => {
  const counts = { orders: 2, forSale: 3 };
  it.each([
    ["orders", counts, 2], // all the buyer's orders
    ["for-sale", counts, 3], // listings on sale
    ["details", counts, null], // no number
    ["orders", { orders: 0, forSale: 0 }, 0], // zero is shown
    ["orders", null, null], // counts not loaded: no number
  ] as const)("%s with %o → %s", (tab, c, expected) => {
    expect(tabCount(tab, c)).toBe(expected);
  });
});

describe("firstName", () => {
  it.each([
    ["Rita Lopes", "Rita"],
    ["Helena Cavalheiro Araújo", "Helena"],
    ["madonna", "madonna"], // one word
    ["  Rui   Costa  ", "Rui"], // extra spaces ignored
    ["Maximiliana-Josefina Souza", "Maximiliana-Josefina"], // long names are cut with … on screen, not here
    ["", ""],
  ])("%s → %s", (name, expected) => {
    expect(firstName(name)).toBe(expected);
  });
});

describe("afterLogOut", () => {
  it.each([
    ["/", null], // home: stays
    ["/albums/123", null], // album page: stays (use case 2)
    ["/search", null],
    ["/listings/abc", null],
    ["/account", "/"], // pages that need an account → home
    ["/account/for-sale", "/"],
    ["/my-listings", "/"],
    ["/cart", "/"],
    ["/cart/checkout", "/"],
    ["/checkout/abc", "/"],
    ["/orders/abc", "/"],
    ["/sell", "/"],
    ["/sell/albums/1", "/"],
    ["/seller", null], // only whole path segments count
    ["/accounts", null],
  ])("%s → %s", (path, expected) => {
    expect(afterLogOut(path)).toBe(expected);
    expect(needsAccount(path)).toBe(expected === "/");
  });
});
