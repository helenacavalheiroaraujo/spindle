// Active listings (Shared rules): one place, covered by tests/unit/activeListings.test.ts.
import { trafficLight, type CheckItem, type CheckResult } from "./trafficLight";

export type ListingFacts = {
  status: "on_sale" | "sold" | "removed";
  claimedVersionId: string;
  actualVersionId: string;
  hasMatrixPhoto: boolean;
  checks: Record<CheckItem, CheckResult>;
};

// A listing is active for a version when it is on sale and green or yellow there.
// A red listing does not count for the version the seller claimed; once moved to its
// actual version it counts there, shown yellow ("Moved here · check pending").
export function isActiveFor(listing: ListingFacts, versionId: string): boolean {
  if (listing.status !== "on_sale") return false;
  const moved = listing.actualVersionId !== listing.claimedVersionId;
  if (moved) return listing.actualVersionId === versionId;
  return listing.claimedVersionId === versionId && trafficLight(listing.checks, listing.hasMatrixPhoto) !== "red";
}

export function hasActiveListings(listings: ListingFacts[], versionIds: string[]): boolean {
  return listings.some((l) => versionIds.some((v) => isActiveFor(l, v)));
}
