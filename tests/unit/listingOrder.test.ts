// Decision table from SPEC story 5 · Order, Red listing, use case 4 and edge case "All listings red".
import { describe, expect, it } from "vitest";
import { allRed, listingsForVersion, type ListingForList } from "@/lib/rules/listingOrder";

const allMatch = { cover_label: "match", country_year: "match", matrix: "match" } as const;
const matrixUnsure = { ...allMatch, matrix: "uncertain" } as const;
const noMatch = { cover_label: "match", country_year: "no_match", matrix: "no_match" } as const;
const listing = (id: string, price: number, o: Partial<ListingForList> = {}): ListingForList => ({
  id, price, status: "on_sale", claimedVersionId: "v2012", actualVersionId: "v2012", hasMatrixPhoto: true, checks: allMatch, ...o,
});

// Seed example (story 5): 2012 Remaster list = green €32, yellow €36, red €29 moved to the 1990 Reissue.
const seed = [
  listing("green32", 32),
  listing("yellow36", 36, { checks: matrixUnsure }),
  listing("red29", 29, { actualVersionId: "v1990", checks: noMatch }),
  listing("green24", 24, { claimedVersionId: "v1990", actualVersionId: "v1990" }),
];

describe("listingsForVersion", () => {
  it("green and yellow mixed, cheapest first; red last although cheapest", () => {
    const rows = listingsForVersion(seed, "v2012");
    expect(rows.map((r) => [r.listing.id, r.light])).toEqual([
      ["green32", "green"],
      ["yellow36", "yellow"],
      ["red29", "red"],
    ]);
  });

  it("a yellow cheaper than a green comes first (no grouping by colour)", () => {
    const rows = listingsForVersion([listing("g", 30), listing("y", 25, { hasMatrixPhoto: false })], "v2012");
    expect(rows.map((r) => r.listing.id)).toEqual(["y", "g"]);
  });

  it.each([
    // case, listing, version shown, light, moved to, moved here
    ["red, moved: claimed version", listing("r", 29, { actualVersionId: "v1990", checks: noMatch }), "v2012", "red", "v1990", false],
    ["red, moved: actual version", listing("r", 29, { actualVersionId: "v1990", checks: noMatch }), "v1990", "yellow", null, true],
    ["red, not moved (finding #33, not in seed)", listing("r", 29, { checks: noMatch }), "v2012", "red", null, false],
    ["green", listing("g", 32), "v2012", "green", null, false],
    ["missing matrix photo", listing("y", 30, { hasMatrixPhoto: false }), "v2012", "yellow", null, false],
  ] as const)("%s", (_case, l, version, light, movedTo, movedHere) => {
    const [row] = listingsForVersion([l], version);
    expect(row).toMatchObject({ light, movedToVersionId: movedTo, movedHere });
  });

  it.each([
    ["sold", "sold"],
    ["removed", "removed"],
  ] as const)("%s listings are not shown", (_case, status) => {
    expect(listingsForVersion([listing("s", 20, { status })], "v2012")).toEqual([]);
  });

  it("listings of other versions are not shown", () => {
    expect(listingsForVersion(seed, "v1972")).toEqual([]);
  });
});

describe("allRed", () => {
  it.each([
    ["only a red listing (seed: 1972 UK original)", [listing("r", 185, { actualVersionId: "v1990", checks: noMatch })], true],
    ["red and green", [listing("r", 29, { actualVersionId: "v1990", checks: noMatch }), listing("g", 32)], false],
    ["no listings", [], false],
  ] as const)("%s", (_case, ls, expected) => {
    expect(allRed(listingsForVersion([...ls], "v2012"))).toBe(expected);
  });
});
