// Decision table from SPEC · Shared rules (active listing) and story 5 (red listing moved).
import { describe, expect, it } from "vitest";
import { hasActiveListings, isActiveFor, type ListingFacts } from "@/lib/rules/activeListings";

const allMatch = { cover_label: "match", country_year: "match", matrix: "match" } as const;
const noMatch = { cover_label: "match", country_year: "no_match", matrix: "no_match" } as const;
const listing = (o: Partial<ListingFacts>): ListingFacts => ({
  status: "on_sale", claimedVersionId: "v1990", actualVersionId: "v1990", hasMatrixPhoto: true, checks: allMatch, ...o,
});

describe("isActiveFor", () => {
  it.each([
    ["green, on sale", listing({}), "v1990", true],
    ["yellow (no matrix photo), on sale", listing({ hasMatrixPhoto: false }), "v1990", true],
    ["sold", listing({ status: "sold" }), "v1990", false],
    ["removed", listing({ status: "removed" }), "v1990", false],
    ["red, not moved", listing({ checks: noMatch }), "v1990", false],
    ["red, moved: claimed version", listing({ claimedVersionId: "v1972", checks: noMatch }), "v1972", false],
    ["red, moved: actual version", listing({ claimedVersionId: "v1972", checks: noMatch }), "v1990", true],
    ["other version", listing({}), "v2012", false],
  ] as const)("%s → %s", (_case, l, version, expected) => {
    expect(isActiveFor(l, version)).toBe(expected);
  });
});

describe("hasActiveListings (story 1: 'No listings' label)", () => {
  it("is false when the album only has sold listings", () => {
    expect(hasActiveListings([listing({ status: "sold" })], ["v1990"])).toBe(false);
  });
  it("is false when the album has no listings", () => {
    expect(hasActiveListings([], ["v1990", "v2012"])).toBe(false);
  });
  it("is true when one version has an active listing", () => {
    expect(hasActiveListings([listing({})], ["v2012", "v1990"])).toBe(true);
  });
});
