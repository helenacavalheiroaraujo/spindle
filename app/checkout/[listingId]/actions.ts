"use server";
// Pay (story 7 · use case 2). Simulated payment: no money is charged and no card or bank details exist.
import { redirect } from "next/navigation";
import { getListingCheck } from "@/lib/db/listings";
import { placeOrder } from "@/lib/db/orders";
import { currentUserId } from "@/lib/db/session";
import { currentProfileId } from "@/lib/db/profiles";
import { canCheckout, checkoutPath } from "@/lib/rules/checkoutAccess";
import { checkoutTotal } from "@/lib/rules/checkoutTotal";
import { withReturn } from "@/lib/rules/login";
import { canPay, type ShippingAddress } from "@/lib/rules/shippingAddress";

// "sold": the listing is no longer for sale ("Sorry, this record was just sold"); no order was created.
// "failed": anything unexpected (the error screen with "Try again"; the form keeps what was typed).
export type PayState = { status: "ready" | "sold" | "failed" };

export async function pay(listingId: string, versionId: string, _prev: PayState, form: FormData): Promise<PayState> {
  const address: ShippingAddress = {
    name: String(form.get("name") ?? ""),
    street: String(form.get("street") ?? ""),
    postcode: String(form.get("postcode") ?? ""),
    city: String(form.get("city") ?? ""),
  };
  if (!canPay(address)) return { status: "ready" }; // the Pay button is disabled in this case anyway

  const buyerId = await currentUserId().catch(() => undefined);
  if (buyerId === undefined) return { status: "failed" };
  if (buyerId === null) redirect(withReturn("/login", checkoutPath(listingId, versionId))); // session ended meanwhile

  let orderId: string;
  try {
    const listing = await getListingCheck(listingId);
    // Checked again here: the listing may have been sold, or the page opened for a red listing.
    if (!listing || !canCheckout(listing, versionId)) return { status: "sold" };
    if (!canCheckout(listing, versionId, await currentProfileId())) return { status: "failed" }; // own listing (#12)
    const result = await placeOrder(buyerId, listingId, checkoutTotal(listing.price), address);
    if ("sold" in result) return { status: "sold" };
    orderId = result.orderId;
  } catch {
    return { status: "failed" };
  }
  redirect(`/orders/${orderId}`);
}
