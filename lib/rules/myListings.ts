// My listings rules (story 8 · use cases 3–6, findings #35, #74, #80, #81): covered by tests/unit/myListings.test.ts.
import type { ListingFacts } from "./activeListings";

export type MyListingStatus = ListingFacts["status"];

// Removed listings are not shown (finding #35); the rest go to the "On sale" or "Sold" tab.
export function myListingTabs<T extends { status: MyListingStatus }>(listings: T[]): { onSale: T[]; sold: T[] } {
  return {
    onSale: listings.filter((l) => l.status === "on_sale"),
    sold: listings.filter((l) => l.status === "sold"),
  };
}

// Only a listing on sale can have its price edited or be removed; sold listings can be seen only.
export const canChange = (status: MyListingStatus) => status === "on_sale";

// Undo stays this long after "Listing removed"; then the removal is final (use case 6).
export const UNDO_SECONDS = 5;

// A listing bought while the seller edits or removes it (Edge cases).
export const JUST_SOLD_MESSAGE = "This record was just sold";

// "Save changes" in the edit sheet is enabled only when something changed (bug 10): the condition, the
// price or at least one new photo. A price that is not valid counts as no change (the price rule blocks it).
export type ListingEdit = {
  conditionBefore: string;
  conditionNow: string | null;
  priceBefore: number;
  priceNow: number | null; // null when the typed price is not valid
  newPhotos: number;
};
export function hasChanges(e: ListingEdit): boolean {
  return (
    (e.conditionNow !== null && e.conditionNow !== e.conditionBefore) ||
    (e.priceNow !== null && e.priceNow !== e.priceBefore) ||
    e.newPhotos > 0
  );
}
