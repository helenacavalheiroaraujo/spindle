// Who can reach the checkout (story 7 · Acceptance criteria: red listings cannot reach the checkout;
// a sold listing cannot be bought again): covered by tests/unit/checkoutAccess.test.ts.
import { listingsForVersion, type ListingForList } from "./listingOrder";

// The version in the address is the one the buyer came from: a listing that is red under its claimed
// version is yellow ("Moved here · check pending") under its actual one, and can be bought there.
export function canCheckout(listing: ListingForList, versionId: string): boolean {
  const row = listingsForVersion([listing], versionId)[0];
  return row !== undefined && row.light !== "red"; // no row = not on sale, or not shown under that version
}

// Address of the checkout for a listing seen under a version.
export function checkoutPath(listingId: string, versionId: string): string {
  return `/checkout/${listingId}?version=${versionId}`;
}
