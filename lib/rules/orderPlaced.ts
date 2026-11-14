// After Pay (story 30): where the buyer lands and what the "Order placed" page of a cart says.
// Covered by tests/unit/orderPlaced.test.ts.
import { euros } from "./checkoutTotal";
import { recordCount } from "./cartTotal";

// The two next steps on every "Order placed" page (story 30 · Scope, option A).
export const MY_ORDERS_PATH = "/account/orders"; // Your account, Orders tab (story 31)
export const HOME_PATH = "/";

// One record: story 7's confirmation. Several records (the cart): one page with a card per record (option B).
export function orderPlacedPath(orderIds: string[]): string {
  if (orderIds.length === 1) return `/orders/${orderIds[0]}`;
  return `/orders/placed?ids=${orderIds.map(encodeURIComponent).join(",")}`;
}

// The order ids in the address of the cart's page: "a,b" → ["a", "b"]; blanks and repeats dropped, order kept.
export function parseOrderIds(raw: string | string[] | undefined): string[] {
  const text = Array.isArray(raw) ? raw.join(",") : (raw ?? "");
  const ids = text
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id.length > 0);
  return [...new Set(ids)];
}

// "€71.80 paid for 2 records": the order totals added up in cents, so €34.90 + €36.90 is exactly €71.80.
export function paidSummary(orderTotals: number[]): string {
  const cents = orderTotals.reduce((all, total) => all + Math.round(total * 100), 0);
  return `${euros(cents / 100)} paid for ${recordCount(orderTotals.length)}`;
}
