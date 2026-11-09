// Decision table from SPEC story 15 · Acceptance criteria.
import { describe, expect, it } from "vitest";
import { menuItems } from "@/lib/rules/menuItems";

const labels = (signedIn: boolean) => menuItems(signedIn, "/").map((i) => i.label);
const current = (signedIn: boolean, path: string) => menuItems(signedIn, path).find((i) => i.current)?.label ?? null;

describe("menuItems", () => {
  it("shows the same five items everywhere; signed out says Log in, signed in says Your account", () => {
    expect(labels(false)).toEqual(["Home", "Sell for free", "Log in", "Artists", "All genres and formats"]);
    expect(labels(true)).toEqual(["Home", "Sell for free", "Your account", "Artists", "All genres and formats"]);
  });

  it.each([
    [false, "/", "Home"],
    [false, "/sell", "Sell for free"],
    [false, "/sell/albums/abc", "Sell for free"],
    [false, "/login", "Log in"],
    [false, "/signup", "Log in"],
    [true, "/account", "Your account"],
    [true, "/my-listings", "Your account"],
    [true, "/search", null], // no item for the results page
    [true, "/sellers", null], // a prefix is not a match
  ] as const)("signed in %s, on %s → current: %s", (signedIn, path, expected) => {
    expect(current(signedIn, path)).toBe(expected);
  });

  it("Artists and All genres and formats are 'Coming soon': no link, never current", () => {
    for (const item of menuItems(true, "/").slice(3)) expect(item).toMatchObject({ href: null, soon: true, current: false });
    for (const item of menuItems(true, "/").slice(0, 3)) expect(item).toMatchObject({ soon: false });
  });

  it("the three working items have a link", () => {
    expect(menuItems(false, "/").slice(0, 3).map((i) => i.href)).toEqual(["/", "/sell", "/login"]);
  });

  it.each([
    ["/", "", "/login"],
    ["/versions/v1/listings", "priorities=price", "/login?next=%2Fversions%2Fv1%2Flistings%3Fpriorities%3Dprice"],
    ["/account", "", "/login?next=%2Faccount"],
    ["/signup", "next=%2Faccount", "/login?next=%2Faccount"], // keeps the return address it carries
    ["/login", "", "/login"],
  ] as const)("'Log in' on %s?%s → %s", (path, query, href) => {
    expect(menuItems(false, path, query)[2].href).toBe(href);
  });
});
