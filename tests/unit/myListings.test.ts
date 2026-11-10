// Decision table from SPEC story 8 · use cases 3–6, Acceptance criteria and Edge cases.
import { describe, expect, it } from "vitest";
import { UNDO_SECONDS, canChange, hasChanges, myListingTabs } from "@/lib/rules/myListings";

describe("myListingTabs", () => {
  it("on sale and sold go to their tabs; removed listings are not shown", () => {
    const listings = [
      { id: "a", status: "on_sale" as const },
      { id: "b", status: "sold" as const },
      { id: "c", status: "removed" as const },
      { id: "d", status: "on_sale" as const },
    ];
    const tabs = myListingTabs(listings);
    expect(tabs.onSale.map((l) => l.id)).toEqual(["a", "d"]);
    expect(tabs.sold.map((l) => l.id)).toEqual(["b"]);
  });

  it("no listings → both tabs empty", () => {
    expect(myListingTabs([])).toEqual({ onSale: [], sold: [] });
  });
});

describe("canChange", () => {
  it.each([
    ["on_sale", true], // price can be edited, listing can be removed
    ["sold", false], // sold listings can be seen but not edited or removed
    ["removed", false],
  ] as const)("%s → %s", (status, expected) => {
    expect(canChange(status)).toBe(expected);
  });
});

it("Undo stays 5 seconds", () => {
  expect(UNDO_SECONDS).toBe(5);
});

// Bug 10: "Save changes" waits for a change.
describe("hasChanges", () => {
  const SAME = { conditionBefore: "VG+", conditionNow: "VG+", priceBefore: 25, priceNow: 25, newPhotos: 0 };
  it.each([
    [{}, false],
    [{ conditionNow: "NM" }, true],
    [{ priceNow: 30 }, true],
    [{ newPhotos: 1 }, true],
    [{ conditionNow: "NM", priceNow: 30, newPhotos: 2 }, true],
    [{ priceNow: null }, false], // a price that is not valid is no change
    [{ conditionNow: null }, false],
    [{ priceNow: null, newPhotos: 1 }, true], // the photo is still a change (the price rule blocks saving)
  ] as const)("%o → %s", (change, expected) => {
    expect(hasChanges({ ...SAME, ...change })).toBe(expected);
  });
});
