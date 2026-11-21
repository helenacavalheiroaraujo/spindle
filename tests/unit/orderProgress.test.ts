// Decision table from story 7 · Phase 4 (step 3): the buyer confirms receipt → "Seller paid".
// Step 2 does not work in the MVP, so "Shipped" stays undone and the buyer can confirm right after paying.
import { describe, expect, it } from "vitest";
import {
  cancelledLine,
  cancelQuestion,
  canCancel,
  canConfirmReceipt,
  PROGRESS_LABELS,
  splitOrders,
  stepsDone,
  type OrderStatus,
} from "@/lib/rules/orderProgress";

describe("order progress", () => {
  it.each([
    // status, steps with a filled bar, buyer can confirm
    ["paid_waiting_seller", 1, true],
    ["seller_paid", 4, false],
  ] as const)("%s → %i steps done, can confirm %s", (status, done, confirm) => {
    expect(stepsDone(status)).toBe(done);
    expect(canConfirmReceipt(status)).toBe(confirm);
  });

  it("has the four steps of the design, in order", () => {
    expect(PROGRESS_LABELS).toEqual(["Paid", "Shipped", "You confirm", "Seller paid"]);
  });
});

describe("splitOrders", () => {
  const o = (id: string, status: OrderStatus) => ({ id, status });

  it.each([
    ["no orders", [], [], [], []],
    ["one waiting", [o("a", "paid_waiting_seller")], ["a"], [], []],
    ["one confirmed", [o("a", "seller_paid")], [], ["a"], []],
    ["mixed, order kept", [o("a", "seller_paid"), o("b", "paid_waiting_seller"), o("c", "paid_waiting_seller")], ["b", "c"], ["a"], []],
    // story 39: cancelled orders go to their own group, under "Delivered" (owner's choice 1a)
    ["one cancelled", [o("a", "cancelled")], [], [], ["a"]],
    [
      "all three, order kept",
      [o("a", "cancelled"), o("b", "paid_waiting_seller"), o("c", "seller_paid"), o("d", "cancelled")],
      ["b"],
      ["c"],
      ["a", "d"],
    ],
  ] as const)("%s", (_case, orders, onItsWay, delivered, cancelled) => {
    const result = splitOrders([...orders]);
    expect(result.onItsWay.map((x) => x.id)).toEqual(onItsWay);
    expect(result.delivered.map((x) => x.id)).toEqual(delivered);
    expect(result.cancelled.map((x) => x.id)).toEqual(cancelled);
  });
});

// Decision table from story 39: only a "Paid" order can be cancelled.
describe("canCancel", () => {
  it.each([
    // status, buyer can cancel
    ["paid_waiting_seller", true],
    ["seller_paid", false],
    ["cancelled", false],
  ] as const)("%s → can cancel %s", (status, expected) => {
    expect(canCancel(status)).toBe(expected);
  });

  it("a cancelled order cannot be confirmed either", () => {
    expect(canConfirmReceipt("cancelled")).toBe(false);
  });
});

describe("story 39 texts", () => {
  it.each([
    [38.9, "The record goes back on sale and your €38.90 is returned.", "Cancelled · €38.90 returned to you"],
    [12, "The record goes back on sale and your €12.00 is returned.", "Cancelled · €12.00 returned to you"],
  ])("total %d", (total, question, line) => {
    expect(cancelQuestion(total)).toBe(question);
    expect(cancelledLine(total)).toBe(line);
  });
});
