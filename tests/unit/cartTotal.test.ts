// Decision table from story 20 · Acceptance criteria and Edge cases.
import { describe, expect, it } from "vitest";
import { cartTotal, perRecordLabel, recordCount } from "@/lib/rules/cartTotal";

describe("cartTotal", () => {
  it.each([
    // record prices, total
    [[], 0], // empty cart
    [[28], 34.9], // one €28 record: 28 + 4.90 + 2.00
    [[28, 30], 71.8], // €34.90 + €36.90
    [[24.5, 0.1], 38.4], // cents add up exactly: 31.40 + 7.00
    [[28, 30, 32], 110.7], // three records, 34.90 + 36.90 + 38.90
  ] as const)("record prices %j → total €%s", (prices, total) => {
    expect(cartTotal([...prices]).total).toBe(total);
  });

  it("two records: the summary rows of the design (€58.00, €9.80, €4.00, €71.80)", () => {
    expect(cartTotal([28, 30])).toMatchObject({ count: 2, records: 58, shipping: 9.8, protectionFee: 4, total: 71.8 });
  });

  it("each record keeps its own total, in order", () => {
    expect(cartTotal([28, 30]).lines.map((l) => l.total)).toEqual([34.9, 36.9]);
  });

  it("removing a record recalculates the total", () => {
    expect(cartTotal([28, 30]).total).toBe(71.8);
    expect(cartTotal([30]).total).toBe(36.9);
  });

  it("an empty cart costs nothing", () => {
    expect(cartTotal([])).toEqual({ count: 0, lines: [], records: 0, shipping: 0, protectionFee: 0, total: 0 });
  });
});

describe("words", () => {
  it.each([
    [1, "1 record"],
    [2, "2 records"],
    [0, "0 records"],
  ] as const)("%s → %s", (n, text) => expect(recordCount(n)).toBe(text));

  it("labels the repeated fees", () => {
    expect(perRecordLabel("Insured shipping", 2, 4.9)).toBe("Insured shipping · 2 × €4.90");
    expect(perRecordLabel("Buyer protection", 2, 2)).toBe("Buyer protection · 2 × €2.00");
  });
});
