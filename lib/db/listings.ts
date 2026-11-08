// Listing rows → the facts the rules need (lib/rules/activeListings), and the listings screen data (stories 5 and 6).
import { db } from "./client";
import type { TypicalRange } from "@/lib/rules/fairPrice";
import type { ListingForList } from "@/lib/rules/listingOrder";
import type { ListingFacts } from "@/lib/rules/activeListings";
import type { CheckItem, CheckResult } from "@/lib/rules/trafficLight";
import { sellerOf, type Seller } from "@/lib/rules/seller";

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
  seller: Seller;
  city: string | null;
  condition: { code: string; name: string; explanation: string };
  claimedVersionName: string;
  actualVersionName: string;
  actualTypicalRange: TypicalRange; // story 6: the price label uses the range of the actual version
};

type RangeRow = { typical_price_min: string | number | null; typical_price_max: string | number | null };
export function toTypicalRange(r: RangeRow): TypicalRange {
  return {
    min: r.typical_price_min === null ? null : Number(r.typical_price_min),
    max: r.typical_price_max === null ? null : Number(r.typical_price_max),
  };
}

export type VersionListings = {
  version: { id: string; name: string; albumId: string; albumTitle: string; artist: string; typicalRange: TypicalRange };
  listings: ListingDetails[]; // on sale, claimed for this version or moved to it; the rules order them
};

// Null when there is no such version.
export async function getVersionListings(versionId: string): Promise<VersionListings | null> {
  const client = db();
  const versionResult = await client
    .from("versions")
    .select("id, name, typical_price_min, typical_price_max, albums (id, title, artist)")
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
       profiles (shop_name, city),
       condition_grades (code, name, explanation),
       claimed:versions!listings_claimed_version_id_fkey (name),
       actual:versions!listings_actual_version_id_fkey (name, typical_price_min, typical_price_max)`,
    )
    .eq("status", "on_sale")
    .or(`claimed_version_id.eq.${versionId},actual_version_id.eq.${versionId}`);
  if (listings.error) throw listings.error;

  return {
    version: {
      id: v.id,
      name: v.name,
      albumId: album.id,
      albumTitle: album.title,
      artist: album.artist,
      typicalRange: toTypicalRange(v),
    },
    listings: listings.data.map((l) => {
      const seller = l.profiles as unknown as { shop_name: string | null; city: string | null };
      const grade = l.condition_grades as unknown as ListingDetails["condition"];
      return {
        ...toListingFacts(l as unknown as ListingRow),
        id: l.id,
        price: Number(l.price),
        seller: sellerOf(seller.shop_name),
        city: seller.city,
        condition: grade,
        claimedVersionName: (l.claimed as unknown as { name: string }).name,
        actualVersionName: (l.actual as unknown as { name: string }).name,
        actualTypicalRange: toTypicalRange(l.actual as unknown as RangeRow),
      };
    }),
  };
}

// --- Listing check screen (story 5) -----------------------------------------

export type ListingCheckData = ListingDetails & {
  albumId: string;
  albumTitle: string;
  artist: string;
  photos: { cover: string | null; record: string | null; matrix: string | null };
};

// Null when there is no such listing.
export async function getListingCheck(listingId: string): Promise<ListingCheckData | null> {
  const result = await db()
    .from("listings")
    .select(
      `id, price, cover_photo_url, record_photo_url, ${LISTING_FACTS_COLUMNS},
       profiles (shop_name, city),
       condition_grades (code, name, explanation),
       claimed:versions!listings_claimed_version_id_fkey (name, albums (id, title, artist)),
       actual:versions!listings_actual_version_id_fkey (name, typical_price_min, typical_price_max)`,
    )
    .eq("id", listingId)
    .maybeSingle();
  if (result.error?.code === "22P02") return null; // not a valid listing id
  if (result.error) throw result.error;
  const l = result.data;
  if (!l) return null;
  const seller = l.profiles as unknown as { shop_name: string | null; city: string | null };
  const claimed = l.claimed as unknown as { name: string; albums: { id: string; title: string; artist: string } };
  return {
    ...toListingFacts(l as unknown as ListingRow),
    id: l.id,
    price: Number(l.price),
    seller: sellerOf(seller.shop_name),
    city: seller.city,
    condition: l.condition_grades as unknown as ListingDetails["condition"],
    claimedVersionName: claimed.name,
    actualVersionName: (l.actual as unknown as { name: string }).name,
    actualTypicalRange: toTypicalRange(l.actual as unknown as RangeRow),
    albumId: claimed.albums.id,
    albumTitle: claimed.albums.title,
    artist: claimed.albums.artist,
    photos: { cover: l.cover_photo_url, record: l.record_photo_url, matrix: l.matrix_photo_url },
  };
}

// --- Sell (story 8) ---------------------------------------------------------

export type NewListing = {
  sellerId: string; // profile id
  versionId: string;
  conditionCode: string;
  price: number;
  photos: { cover: string; record: string; matrix: string | null };
  city: string | null; // first time only (finding #73)
  shopName: string | null;
};

export type CreateListingResult =
  | { listingId: string }
  | { error: "version_not_found" | "city_required" | "photos_required" };

// "List for sale": create_listing (migration 0003) creates the listing and its three "uncertain" checks,
// and the first time the seller's city and shop name, all or nothing.
export async function createListing(l: NewListing): Promise<CreateListingResult> {
  const { data, error } = await db().rpc("create_listing", {
    p_seller_id: l.sellerId,
    p_version_id: l.versionId,
    p_condition_code: l.conditionCode,
    p_price: l.price,
    p_cover_photo_url: l.photos.cover,
    p_record_photo_url: l.photos.record,
    p_matrix_photo_url: l.photos.matrix,
    p_city: l.city,
    p_shop_name: l.shopName,
  });
  if (error) {
    for (const known of ["version_not_found", "city_required", "photos_required"] as const)
      if (error.message.includes(known)) return { error: known };
    throw new Error(`Could not create the listing: ${error.message}`);
  }
  return { listingId: data as string };
}
