// Who can reach the checkout (story 7 · Acceptance criteria: red listings cannot reach the checkout;
// a sold listing cannot be bought again): covered by tests/unit/checkoutAccess.test.ts.
import { listingsForVersion, type ListingForList } from "./listingOrder";

// A signed-in seller's own listing (story 8 · finding #12): "Your listing" instead of Buy, never the checkout.
// viewerSellerId is the signed-in user's profile id, or null when signed out.
export function isOwnListing(listingSellerId: string, viewerSellerId: string | null): boolean {
  return viewerSellerId !== null && listingSellerId === viewerSellerId;
}

// The version in the address is the one the buyer came from: a listing that is red under its claimed
// version is yellow ("Moved here · check pending") under its actual one, and can be bought there.
// The seller's own listing never reaches the checkout (finding #12).
export function canCheckout(
  listing: ListingForList & { sellerId?: string },
  versionId: string,
  viewerSellerId: string | null = null,
): boolean {
  if (listing.sellerId !== undefined && isOwnListing(listing.sellerId, viewerSellerId)) return false;
  const row = listingsForVersion([listing], versionId)[0];
  return row !== undefined && row.light !== "red"; // no row = not on sale, or not shown under that version
}

// Address of the checkout for a listing seen under a version.
export function checkoutPath(listingId: string, versionId: string): string {
  return `/checkout/${listingId}?version=${versionId}`;
}

// The seller who opens the checkout address of their own listing is sent to the listing's page, with a notice
// (bug 12, DECISIONS 2026-11-10), instead of a "not found" page.
export const OWN_LISTING_NOTICE = "This listing is yours, you can't buy it";
export function ownListingPath(listingId: string, versionId: string): string {
  return `/listings/${listingId}?version=${versionId}&notice=own`;
}
// The listing page shows the notice only for this exact value in the address.
export function listingNotice(param: string | undefined): string | null {
  return param === "own" ? OWN_LISTING_NOTICE : null;
}

// A listing opened from a link after it was sold or removed (story 7 / story 5 · finding #61, DECISIONS 2026-11-08):
// "This record is no longer available" instead of the generic "not found".
export function isNoLongerAvailable(status: "on_sale" | "sold" | "removed"): boolean {
  return status !== "on_sale";
}
