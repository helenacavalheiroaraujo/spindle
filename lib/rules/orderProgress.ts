// Where an order stands, in the four protection steps (story 7 · step 3, phase 4):
// covered by tests/unit/orderProgress.test.ts.
// Step 2 ("Seller ships") is not a working feature (story 7 · Out of scope), so it stays undone;
// the buyer can confirm receipt as soon as the order is paid (DECISIONS 2026-11-08).
export type OrderStatus = "paid_waiting_seller" | "seller_paid";

export const PROGRESS_LABELS = ["Paid", "Shipped", "You confirm", "Seller paid"] as const;

// Steps with a filled bar: "Paid" only while waiting; all four once the seller is paid.
export function stepsDone(status: OrderStatus): number {
  return status === "seller_paid" ? PROGRESS_LABELS.length : 1;
}

// Only an order still waiting can be confirmed; a confirmed one cannot be changed.
export function canConfirmReceipt(status: OrderStatus): boolean {
  return status === "paid_waiting_seller";
}

// Orders still on their way first, delivered ones after; each group keeps the order it came in (newest first).
export function splitOrders<T extends { status: OrderStatus }>(orders: T[]): { onItsWay: T[]; delivered: T[] } {
  return {
    onItsWay: orders.filter((o) => canConfirmReceipt(o.status)),
    delivered: orders.filter((o) => !canConfirmReceipt(o.status)),
  };
}
