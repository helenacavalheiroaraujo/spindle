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

// The message when a record leaves the cart (design: cart-options.html, part 3). Sold → the design's text;
// removed by its seller or no longer matching → a plain "no longer available".
export function leftCartMessage(title: string, status: "on_sale" | "sold" | "removed"): string {
  const why = status === "sold" ? "was just sold to someone else" : "is no longer available";
  return `“${title}” ${why} and left your cart. The total is updated.`;
}
