// Decision tables from story 27 · Scope and Acceptance criteria ("The window shows the right title for the action"),
// story 29 (every log-in opens the window; pages that need an account) and bug 32 (the cart icon).
import { describe, expect, it } from "vitest";
import {
  gateCloseTarget,
  gatePurpose,
  loginRecord,
  loginWindowNext,
  loginWindowText,
  menuLoginPurpose,
  PROMISE_LINES,
  PROTECTION_LINE,
  type LoginMode,
  type LoginPurpose,
} from "@/lib/rules/loginWindow";

describe("loginWindowText", () => {
  it.each<[LoginPurpose, LoginMode, string, string | null]>([
    ["buy", "login", "Log in to buy", "You are buying:"],
    ["cart", "login", "Log in to add to your cart", null],
    ["cartView", "login", "Log in to see your cart", null], // bug 32
    ["sell", "login", "Log in to sell", "Selling is free. You need an account."],
    ["menu", "login", "Log in", "Welcome back."],
    ["buy", "signup", "Create an account to buy", null],
    ["cart", "signup", "Create an account to add to your cart", null],
    ["cartView", "signup", "Create an account to see your cart", null], // DECISIONS 2026-11-14 (story 29)
    ["sell", "signup", "Create an account to sell", "Selling is free. You need an account."],
    ["menu", "signup", "Create an account", null],
  ])("%s, %s → %s", (purpose, mode, title, note) => {
    expect(loginWindowText(purpose, mode)).toEqual({ title, note });
  });
});

describe("menuLoginPurpose", () => {
  it.each<[boolean, string | null, LoginPurpose | null]>([
    [false, "/sell", "sell"],
    [false, "/login", "menu"],
    [false, "/login?next=%2Falbums%2F1", "menu"],
    [false, "/cart", "cartView"], // bug 32: the cart icon opens the window too
    [true, "/cart", null],
    [false, "/", null],
    [false, null, null], // "Soon" items have no link
    [true, "/sell", null], // signed in: ordinary links
    [true, "/account", null],
  ])("signed in %s, %s → %s", (signedIn, href, expected) => {
    expect(menuLoginPurpose(signedIn, href)).toBe(expected);
  });
});

describe("loginWindowNext", () => {
  it.each<[LoginPurpose, string, string | null, string]>([
    ["buy", "/versions/v1/listings", "/checkout/l1?version=v1", "/checkout/l1?version=v1"],
    ["cart", "/versions/v1/listings?priorities=price", "l1", "/cart/add/l1?next=%2Fversions%2Fv1%2Flistings%3Fpriorities%3Dprice"],
    ["sell", "/albums/a1", null, "/sell"],
    ["cartView", "/albums/a1", null, "/cart"], // bug 32: after logging in, the cart opens
    ["menu", "/albums/a1?x=1", null, "/albums/a1?x=1"],
    ["menu", "https://evil.example", null, "/"], // only addresses inside Spindle
    ["buy", "/", "//evil.example", "/"],
  ])("%s from %s → %s", (purpose, here, target, expected) => {
    expect(loginWindowNext(purpose, here, target)).toBe(expected);
  });
});

describe("loginRecord", () => {
  it("shop with a city", () => {
    expect(
      loginRecord({ albumTitle: "Ziggy Stardust", versionName: "2012 Remaster", conditionCode: "VG+", seller: { kind: "shop", shopName: "Discos do Bairro" }, city: "Porto", price: 28 }),
    ).toEqual({ title: "Ziggy Stardust", version: "2012 Remaster", condition: "VG+", seller: "Discos do Bairro, Porto", price: "€28", cover: null });
  });
  it("with the seller's cover photo (story 29, design B)", () => {
    expect(
      loginRecord({ albumTitle: "Ziggy Stardust", versionName: "2012 Remaster", conditionCode: "NM", seller: { kind: "private" }, city: null, price: 28, cover: "https://x/c.jpg" }).cover,
    ).toBe("https://x/c.jpg");
  });
  it("private seller without a city", () => {
    expect(
      loginRecord({ albumTitle: "Blue", versionName: "1971 UK", conditionCode: "VG", seller: { kind: "private" }, city: null, price: 31.5 }),
    ).toEqual({ title: "Blue", version: "1971 UK", condition: "VG", seller: "Private seller", price: "€31.50", cover: null });
  });
});

// Story 29 · Scope: a page that needs an account, opened signed out, opens the window for that page.
// Orders, "Order placed" and the add-to-cart link: same as the pages in the list (DECISIONS 2026-11-14, story 29).
describe("gatePurpose", () => {
  it.each<[string, LoginPurpose | null]>([
    ["/checkout/l1?version=v1", "buy"], // with the record (design B)
    ["/cart", "cartView"],
    ["/cart/checkout", "cartView"],
    ["/cart/add/l1?next=%2Fversions%2Fv1%2Flistings", "cart"],
    ["/sell", "sell"],
    ["/sell/albums/a1", "sell"],
    ["/sell/versions/v1", "sell"],
    ["/account", "menu"],
    ["/account/details", "menu"],
    ["/account/for-sale", "menu"],
    ["/orders/o1", "menu"],
    ["/orders/placed?ids=o1,o2", "menu"],
    ["/", null],
    ["/versions/v1/listings", null],
    ["/selling-tips", null], // only /sell and its pages
    ["/cartoons", null],
  ])("%s → %s", (path, expected) => {
    expect(gatePurpose(path)).toBe(expected);
  });
});

// Story 29 · Scope: "Closing the window on a page that needs an account goes to the previous page, or to the home page
// if there is none." Previous = the previous Spindle page in this tab.
describe("gateCloseTarget", () => {
  it.each<[string | null, string, "back" | "home"]>([
    [null, "/sell", "home"], // a bookmark in a new tab, or a link from another site
    ["/search?q=bjork", "/account", "back"],
    ["/versions/v1/listings", "/checkout/l1?version=v1", "back"],
    ["/account", "/account", "home"], // a reload of the same page
  ])("previous %s, here %s → %s", (previous, here, expected) => {
    expect(gateCloseTarget(previous, here)).toBe(expected);
  });
});

// Story 29 · Scope: the texts of the left panel (designs B and B1).
describe("left panel texts", () => {
  it("protection line and the three lines", () => {
    expect(PROTECTION_LINE).toBe("Spindle holds your payment until you confirm it's all good.");
    expect(PROMISE_LINES).toEqual([
      "We tell you which version to buy",
      "Every copy is checked against it",
      "Spindle holds your payment until you confirm it's all good",
    ]);
  });
});
