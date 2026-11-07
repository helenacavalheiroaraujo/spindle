// Listing rows → the facts the rules need (lib/rules/activeListings), and the listings screen data (story 5).
import { db } from "./client";
import type { ListingForList } from "@/lib/rules/listingOrder";
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

// --- Listings screen (story 5) ----------------------------------------------

export type ListingDetails = ListingForList & {
  sellerName: string;
  city: string | null;
  condition: { code: string; name: string; explanation: string };
  claimedVersionName: string;
  actualVersionName: string;
};

export type VersionListings = {
  version: { id: string; name: string; albumId: string; albumTitle: string; artist: string };
  listings: ListingDetails[]; // on sale, claimed for this version or moved to it; the rules order them
};

// Null when there is no such version.
export async function getVersionListings(versionId: string): Promise<VersionListings | null> {
  const client = db();
  const versionResult = await client
    .from("versions")
    .select("id, name, albums (id, title, artist)")
    .eq("id", versionId)
    .maybeSingle();
  if (versionResult.error?.code === "22P02") return null; // not a valid version id
  if (versionResult.error) throw versionResult.error;
  const v = versionResult.data;
  if (!v) return null;
  const album = v.albums as unknown as { id: string; title: string; artist: string };

  const listings = await client
    .from("listings")
    .select(
      `id, price, ${LISTING_FACTS_COLUMNS},
       profiles (name, city),
       condition_grades (code, name, explanation),
       claimed:versions!listings_claimed_version_id_fkey (name),
       actual:versions!listings_actual_version_id_fkey (name)`,
    )
    .eq("status", "on_sale")
    .or(`claimed_version_id.eq.${versionId},actual_version_id.eq.${versionId}`);
  if (listings.error) throw listings.error;

  return {
    version: { id: v.id, name: v.name, albumId: album.id, albumTitle: album.title, artist: album.artist },
    listings: listings.data.map((l) => {
      const seller = l.profiles as unknown as { name: string; city: string | null };
      const grade = l.condition_grades as unknown as ListingDetails["condition"];
      return {
        ...toListingFacts(l as unknown as ListingRow),
        id: l.id,
        price: Number(l.price),
        sellerName: seller.name,
        city: seller.city,
        condition: grade,
        claimedVersionName: (l.claimed as unknown as { name: string }).name,
        actualVersionName: (l.actual as unknown as { name: string }).name,
      };
    }),
  };
}
