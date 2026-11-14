// Decision table from story 30 · Scope and Acceptance criteria.
import { describe, expect, it } from "vitest";
import { HOME_PATH, MY_ORDERS_PATH, orderPlacedPath, paidSummary, parseOrderIds } from "@/lib/rules/orderPlaced";

describe("paidSummary", () => {
  it.each([
    // order totals, summary line
    [[34.9, 36.9], "€71.80 paid for 2 records"], // €28 and €30 records (story 20 example)
    [[34.9], "€34.90 paid for 1 record"],
    [[34.9, 36.9, 38.9], "€110.70 paid for 3 records"],
    [[0.1, 0.2], "€0.30 paid for 2 records"], // cents add up exactly
  ] as const)("totals %j → %s", (totals, line) => {
    expect(paidSummary([...totals])).toBe(line);
  });
});

describe("orderPlacedPath", () => {
  it.each([
    [["o1"], "/orders/o1"], // one record: story 7's confirmation
    [["o1", "o2"], "/orders/placed?ids=o1,o2"], // the cart: one page for all the records
    [["o1", "o2", "o3"], "/orders/placed?ids=o1,o2,o3"],
  ] as const)("%j → %s", (ids, path) => {
    expect(orderPlacedPath([...ids])).toBe(path);
  });
});

describe("parseOrderIds", () => {
  it.each([
    ["o1,o2", ["o1", "o2"]],
    ["o2,o1", ["o2", "o1"]], // order kept
    ["o1,,o1, o2 ", ["o1", "o2"]], // blanks and repeats dropped
    ["", []],
    [undefined, []],
    [["o1", "o2,o3"], ["o1", "o2", "o3"]], // ?ids= given twice
  ] as const)("%j → %j", (raw, ids) => {
    expect(parseOrderIds(raw as string | string[] | undefined)).toEqual(ids);
  });
});

describe("next steps", () => {
  it("See my orders opens the Orders tab; Back to the home page opens /", () => {
    expect(MY_ORDERS_PATH).toBe("/account/orders");
    expect(HOME_PATH).toBe("/");
  });
});
