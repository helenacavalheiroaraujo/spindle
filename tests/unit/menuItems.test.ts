// Decision tables from SPEC story 15 and story 19 · Acceptance criteria.
import { describe, expect, it } from "vitest";
import { desktopMenu, menuItems } from "@/lib/rules/menuItems";

const labels = (signedIn: boolean) => menuItems(signedIn, "/").map((i) => i.label);
const current = (signedIn: boolean, path: string) => menuItems(signedIn, path).find((i) => i.current)?.label ?? null;

describe("menuItems", () => {
  it("shows the same six items everywhere; signed out says Log in, signed in says Your account", () => {
    expect(labels(false)).toEqual(["Home", "Sell for free", "Log in", "Cart", "Artists", "All genres and formats"]);
    expect(labels(true)).toEqual(["Home", "Sell for free", "Your account", "Cart", "Artists", "All genres and formats"]);
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
    for (const item of menuItems(true, "/").slice(4)) expect(item).toMatchObject({ href: null, soon: true, current: false });
    for (const item of menuItems(true, "/").slice(0, 4)) expect(item).toMatchObject({ soon: false });
  });

  it("the four working items have a link", () => {
    expect(menuItems(false, "/").slice(0, 4).map((i) => i.href)).toEqual(["/", "/sell", "/login", "/cart"]);
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

describe("every item has a chevron box (story 19)", () => {
  it("working items say 'Nothing here yet'; Artists and All genres and formats say 'Coming soon'", () => {
    const [home, sell, account, cart, artists, genres] = menuItems(false, "/");
    for (const item of [home, sell, account, cart]) expect(item.note).toEqual({ title: "Nothing here yet", text: "More options will appear here in the future." });
    for (const item of [artists, genres]) expect(item.note).toEqual({ title: "Coming soon", text: "This will open more options in the future." });
  });
});

describe("the Cart cell (story 20)", () => {
  const cart = (path: string, count?: number) => menuItems(true, path, "", count)[3];

  it("sits after the account and shows the number of records; an empty cart shows none", () => {
    expect(cart("/", 2)).toMatchObject({ label: "Cart", href: "/cart", count: 2 });
    expect(cart("/")).toMatchObject({ count: 0 });
  });

  it.each([
    ["/cart", true],
    ["/cart/checkout", true],
    ["/cartoon", false], // a prefix is not a match
    ["/", false],
  ] as const)("on %s → current: %s", (path, expected) => {
    expect(cart(path).current).toBe(expected);
  });

  it("no other item shows a number", () => {
    expect(menuItems(true, "/", "", 3).filter((i) => i.count > 0).map((i) => i.label)).toEqual(["Cart"]);
  });

  it("the desktop cells do not repeat it: the cart is the icon at the right of the header", () => {
    expect(desktopMenu(true, "/").map((c) => c.label)).not.toContain("Cart");
  });
});

describe("desktopMenu (story 19)", () => {
  const labels = (signedIn: boolean, path = "/", initials = "RC") => desktopMenu(signedIn, path, "", initials, "Rui Costa").map((c) => c.label);

  it("Home is the logo, so the cells are Artists, All genres and formats, Log in or the initials, Sell for free", () => {
    expect(labels(false)).toEqual(["Artists", "All genres and formats", "Log in", "Sell for free"]);
    expect(labels(true)).toEqual(["Artists", "All genres and formats", "RC", "Sell for free"]);
  });

  it("no link appears twice: one Sell for free, one Log in or the initials", () => {
    for (const signedIn of [false, true]) {
      const l = labels(signedIn);
      expect(new Set(l).size).toBe(l.length);
      expect(l.filter((x) => x === "Sell for free")).toHaveLength(1);
    }
  });

  it("'Log in' is not shown on the log-in and sign-up pages; the initials always are", () => {
    expect(labels(false, "/login")).toEqual(["Artists", "All genres and formats", "Sell for free"]);
    expect(labels(false, "/signup")).toEqual(["Artists", "All genres and formats", "Sell for free"]);
    expect(labels(true, "/login")).toContain("RC");
  });

  it("a signed-in user with no name shows 'Me' and their account link says so", () => {
    const cell = desktopMenu(true, "/", "", "", "")[2];
    expect(cell).toMatchObject({ label: "Me", accountLabel: "Your account", href: "/account" });
    expect(desktopMenu(true, "/", "", "RC", "Rui Costa")[2].accountLabel).toBe("Your account, signed in as Rui Costa");
  });

  it("Artists and All genres and formats are grey 'Soon' cells without a link; Sell for free is the outline cell; one divider before Log in", () => {
    const cells = desktopMenu(false, "/");
    expect(cells.slice(0, 2).map((c) => [c.href, c.soon, c.cta])).toEqual([[null, true, false], [null, true, false]]);
    expect(cells[3]).toMatchObject({ label: "Sell for free", href: "/sell", cta: true, soon: false });
    expect(cells.filter((c) => c.divider).map((c) => c.label)).toEqual(["Log in"]);
    expect(desktopMenu(false, "/login").filter((c) => c.divider).map((c) => c.label)).toEqual(["Sell for free"]); // no Log in: the divider moves
  });

  it("'Log in' keeps the page the user was on", () => {
    expect(desktopMenu(false, "/search", "q=bowie")[2].href).toBe("/login?next=%2Fsearch%3Fq%3Dbowie");
  });
});
