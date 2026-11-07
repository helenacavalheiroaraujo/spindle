// Listings shown for one version (story 5 · Order, red listing moved): covered by tests/unit/listingOrder.test.ts.
import type { ListingFacts } from "./activeListings";
import { trafficLight, type Light } from "./trafficLight";

export type ListingForList = ListingFacts & { id: string; price: number };

export type ListingRow<L extends ListingForList = ListingForList> = {
  listing: L;
  light: Light;
  movedToVersionId: string | null; // red here: the version it was moved to
  movedHere: boolean; // yellow here: "Moved here · check pending"
};

// On-sale listings for the version: those claimed for it (with their own light) and red listings
// moved to it (yellow, because their checklist was made against the claimed version).
// Green and yellow mixed, cheapest first; red listings at the end, also cheapest first.
export function listingsForVersion<L extends ListingForList>(listings: L[], versionId: string): ListingRow<L>[] {
  const rows: ListingRow<L>[] = [];
  for (const listing of listings) {
    if (listing.status !== "on_sale") continue;
    const moved = listing.actualVersionId !== listing.claimedVersionId;
    if (listing.claimedVersionId === versionId) {
      const light = moved ? "red" : trafficLight(listing.checks, listing.hasMatrixPhoto);
      rows.push({ listing, light, movedToVersionId: moved ? listing.actualVersionId : null, movedHere: false });
    } else if (moved && listing.actualVersionId === versionId) {
      rows.push({ listing, light: "yellow", movedToVersionId: null, movedHere: true });
    }
  }
  const redLast = (r: ListingRow<L>) => (r.light === "red" ? 1 : 0);
  return rows.sort((a, b) => redLast(a) - redLast(b) || a.listing.price - b.listing.price);
}

// Edge case "All listings red": no Buy button anywhere, message "No listing matches this version yet".
export function allRed(rows: ListingRow[]): boolean {
  return rows.length > 0 && rows.every((r) => r.light === "red");
}
