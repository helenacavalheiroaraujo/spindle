// Listing rows → the facts the rules need (lib/rules/activeListings).
import type { ListingFacts } from "@/lib/rules/activeListings";
import type { CheckItem, CheckResult } from "@/lib/rules/trafficLight";

export const LISTING_FACTS_COLUMNS =
  "status, claimed_version_id, actual_version_id, matrix_photo_url, check_results (item, result)";

type ListingRow = {
  status: ListingFacts["status"];
  claimed_version_id: string;
  actual_version_id: string;
  matrix_photo_url: string | null;
  check_results: { item: CheckItem; result: CheckResult }[];
};

export function toListingFacts(l: ListingRow): ListingFacts {
  return {
    status: l.status,
    claimedVersionId: l.claimed_version_id,
    actualVersionId: l.actual_version_id,
    hasMatrixPhoto: l.matrix_photo_url !== null,
    checks: Object.fromEntries(l.check_results.map((c) => [c.item, c.result])) as Record<CheckItem, CheckResult>,
  };
}
