// Decision tables from story 27 · Scope and Acceptance criteria ("The window shows the right title for the action").
import { describe, expect, it } from "vitest";
import { loginRecord, loginWindowNext, loginWindowText, menuLoginPurpose, type LoginMode, type LoginPurpose } from "@/lib/rules/loginWindow";

describe("loginWindowText", () => {
  it.each<[LoginPurpose, LoginMode, string, string | null]>([
    ["buy", "login", "Log in to buy", "You are buying:"],
    ["cart", "login", "Log in to add to your cart", null],
    ["sell", "login", "Log in to sell", "Selling is free. You need an account."],
    ["menu", "login", "Log in", "Welcome back."],
    ["buy", "signup", "Create an account to buy", null],
    ["cart", "signup", "Create an account to add to your cart", null],
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
    [false, "/cart", null], // the cart page asks for log-in itself
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
    ).toEqual({ title: "Ziggy Stardust", version: "2012 Remaster", condition: "VG+", seller: "Discos do Bairro, Porto", price: "€28" });
  });
  it("private seller without a city", () => {
    expect(
      loginRecord({ albumTitle: "Blue", versionName: "1971 UK", conditionCode: "VG", seller: { kind: "private" }, city: null, price: 31.5 }),
    ).toEqual({ title: "Blue", version: "1971 UK", condition: "VG", seller: "Private seller", price: "€31.50" });
  });
});
