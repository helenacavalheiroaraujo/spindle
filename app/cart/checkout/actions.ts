"use server";
// Pay for the cart (story 20 · use case 4). Simulated payment: no money is charged and no card or bank details exist.
import { redirect } from "next/navigation";
import { getCart, placeCartOrders } from "@/lib/db/cart";
import { currentUserId } from "@/lib/db/session";
import { withReturn } from "@/lib/rules/login";
import { canPay, type ShippingAddress } from "@/lib/rules/shippingAddress";
import { orderPlacedPath } from "@/lib/rules/orderPlaced";
import type { PayState } from "@/app/checkout/[listingId]/actions";

// A record sold meanwhile sends the buyer back to the cart: nothing was paid, and the cart screen removes the
// record with its message (Edge cases). "failed": anything unexpected (the error screen; the form keeps the address).
export async function payCart(_prev: PayState, form: FormData): Promise<PayState> {
  const address: ShippingAddress = {
    name: String(form.get("name") ?? ""),
    street: String(form.get("street") ?? ""),
    postcode: String(form.get("postcode") ?? ""),
    city: String(form.get("city") ?? ""),
  };
  if (!canPay(address)) return { status: "ready" }; // the Pay button is disabled in this case anyway

  const userId = await currentUserId().catch(() => undefined);
  if (userId === undefined) return { status: "failed" };
  if (userId === null) redirect(withReturn("/login", "/cart/checkout")); // session ended meanwhile

  let orderIds: string[] = [];
  try {
    const { items, messages } = await getCart(userId, false);
    if (items.length > 0 && messages.length === 0) {
      // otherwise something left the cart: nothing is paid
      const result = await placeCartOrders(userId, items, address);
      if ("orderIds" in result) orderIds = result.orderIds;
    }
  } catch {
    return { status: "failed" };
  }
  // Story 30 (option B): the "Order placed" page with one card per record; "Your account" shows them like any other.
  redirect(orderIds.length === 0 ? "/cart" : orderPlacedPath(orderIds));
}
