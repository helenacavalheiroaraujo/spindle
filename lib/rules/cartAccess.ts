// Who can add to the cart, and which records stay in it (story 20 · Acceptance criteria): covered by tests/unit/cartAccess.test.ts.
import { canCheckout } from "./checkoutAccess";
import type { ListingForList } from "./listingOrder";

type CartListing = ListingForList & { sellerId?: string };

// A red or sold listing cannot be added, and a signed-in seller cannot add their own (finding #12): the same
// rule as the checkout, so Add to cart and Buy always agree. A listing is judged under its actual version:
// red under the claimed one means yellow ("Moved here") under the actual one, and that can be added.
export function canAddToCart(listing: CartListing, viewerSellerId: string | null): boolean {
  return canCheckout(listing, listing.actualVersionId, viewerSellerId);
}

// A record already in the cart stays only while it can still be bought (use case 5: sold to someone else).
export function staysInCart(listing: CartListing): boolean {
  return canCheckout(listing, listing.actualVersionId);
}

// A record that can no longer be bought stays in the cart, greyed, until the buyer removes it (story 35, replacing the
// story 20 rule that it leaves on its own). Its tag and its message: sold → "Sold" and "was sold to someone else";
// removed by its seller or no longer matching → "No longer available".
type ListingStatus = "on_sale" | "sold" | "removed";

export function unavailableTag(status: ListingStatus): string {
  return status === "sold" ? "Sold" : "No longer available";
}

export function unavailableMessage(title: string, status: ListingStatus): string {
  const why = status === "sold" ? "was sold to someone else" : "is no longer available";
  return `“${title}” ${why}. Remove it to go to checkout.`;
}

// "Go to checkout" works only when the cart has records and every one of them can still be bought.
export function canGoToCheckout(items: { available: boolean }[]): boolean {
  return items.length > 0 && items.every((item) => item.available);
}
