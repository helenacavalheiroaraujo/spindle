// Where an order stands, in the four protection steps (story 7 · step 3, phase 4):
// covered by tests/unit/orderProgress.test.ts.
// Step 2 ("Seller ships") is not a working feature (story 7 · Out of scope), so it stays undone;
// the buyer can confirm receipt as soon as the order is paid (DECISIONS 2026-11-08).
import { euros } from "./checkoutTotal";

// "cancelled": the buyer cancelled while it was "Paid" (story 39).
export type OrderStatus = "paid_waiting_seller" | "seller_paid" | "cancelled";

export const PROGRESS_LABELS = ["Paid", "Shipped", "You confirm", "Seller paid"] as const;

// Steps with a filled bar: "Paid" only while waiting; all four once the seller is paid.
export function stepsDone(status: OrderStatus): number {
  return status === "seller_paid" ? PROGRESS_LABELS.length : 1;
}

// Only an order still waiting can be confirmed; a confirmed one cannot be changed.
export function canConfirmReceipt(status: OrderStatus): boolean {
  return status === "paid_waiting_seller";
}

// Story 39: only an order still "Paid" can be cancelled; a confirmed or cancelled one cannot.
export function canCancel(status: OrderStatus): boolean {
  return status === "paid_waiting_seller";
}

// The texts of story 39 (design part 3, option A, and "After cancelling").
export const CANCEL_REFUSED = "This order can no longer be cancelled.";

export function cancelQuestion(total: number): string {
  return `The record goes back on sale and your ${euros(total)} is returned.`;
}

export function cancelledLine(total: number): string {
  return `Cancelled · ${euros(total)} returned to you`;
}

// Orders still on their way first, then delivered ones, then cancelled ones (story 39, owner's choice 1a);
// each group keeps the order it came in (newest first).
export function splitOrders<T extends { status: OrderStatus }>(orders: T[]): { onItsWay: T[]; delivered: T[]; cancelled: T[] } {
  return {
    onItsWay: orders.filter((o) => o.status === "paid_waiting_seller"),
    delivered: orders.filter((o) => o.status === "seller_paid"),
    cancelled: orders.filter((o) => o.status === "cancelled"),
  };
}
