// Decision table from story 7 · Phase 4 (step 3): the buyer confirms receipt → "Seller paid".
// Step 2 does not work in the MVP, so "Shipped" stays undone and the buyer can confirm right after paying.
import { describe, expect, it } from "vitest";
import { canConfirmReceipt, PROGRESS_LABELS, splitOrders, stepsDone } from "@/lib/rules/orderProgress";

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
  const o = (id: string, status: "paid_waiting_seller" | "seller_paid") => ({ id, status });

  it.each([
    ["no orders", [], [], []],
    ["one waiting", [o("a", "paid_waiting_seller")], ["a"], []],
    ["one confirmed", [o("a", "seller_paid")], [], ["a"]],
    ["mixed, order kept", [o("a", "seller_paid"), o("b", "paid_waiting_seller"), o("c", "paid_waiting_seller")], ["b", "c"], ["a"]],
  ] as const)("%s", (_case, orders, onItsWay, delivered) => {
    const result = splitOrders([...orders]);
    expect(result.onItsWay.map((x) => x.id)).toEqual(onItsWay);
    expect(result.delivered.map((x) => x.id)).toEqual(delivered);
  });
});
