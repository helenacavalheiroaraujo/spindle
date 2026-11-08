// Decision table from SPEC story 8 · use cases 3–6, Acceptance criteria and Edge cases.
import { describe, expect, it } from "vitest";
import { UNDO_SECONDS, canChange, myListingTabs } from "@/lib/rules/myListings";

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
