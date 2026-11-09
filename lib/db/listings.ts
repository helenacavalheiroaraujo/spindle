// Listing rows → the facts the rules need (lib/rules/activeListings), and the listings screen data (stories 5 and 6).
import { db } from "./client";
import type { TypicalRange } from "@/lib/rules/fairPrice";
import type { ListingForList } from "@/lib/rules/listingOrder";
import type { ListingFacts } from "@/lib/rules/activeListings";
import { trafficLight, type CheckItem, type CheckResult, type Light } from "@/lib/rules/trafficLight";
import { sellerOf, type Seller } from "@/lib/rules/seller";
import type { RatingSummary } from "@/lib/rules/sellerRating";
import { sellerRatings } from "./reviews";

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
  sellerId: string; // profile id: the seller sees "Your listing" instead of Buy (finding #12)
  seller: Seller;
  rating: RatingSummary; // story 18: the seller's reviews
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
      `id, price, seller_id, ${LISTING_FACTS_COLUMNS},
       profiles (shop_name, city),
       condition_grades (code, name, explanation),
       claimed:versions!listings_claimed_version_id_fkey (name),
       actual:versions!listings_actual_version_id_fkey (name, typical_price_min, typical_price_max)`,
    )
    .eq("status", "on_sale")
    .or(`claimed_version_id.eq.${versionId},actual_version_id.eq.${versionId}`);
  if (listings.error) throw listings.error;
  const ratings = await sellerRatings(listings.data.map((l) => l.seller_id));

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
        sellerId: l.seller_id,
        seller: sellerOf(seller.shop_name),
        rating: ratings.get(l.seller_id)!,
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
      `id, price, seller_id, cover_photo_url, record_photo_url, ${LISTING_FACTS_COLUMNS},
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
  const ratings = await sellerRatings([l.seller_id]);
  return {
    ...toListingFacts(l as unknown as ListingRow),
    id: l.id,
    price: Number(l.price),
    sellerId: l.seller_id,
    seller: sellerOf(seller.shop_name),
    rating: ratings.get(l.seller_id)!,
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

// --- My listings (story 8) --------------------------------------------------

export type MyListing = {
  id: string;
  status: ListingFacts["status"];
  albumTitle: string;
  versionId: string;
  versionName: string;
  condition: { code: string; name: string };
  price: number;
  coverPhoto: string | null;
  light: Light;
  typicalRange: TypicalRange; // of the actual version, for the price label (story 6)
};

// The seller's listings on sale and sold, newest first. Removed listings are not read (finding #35).
export async function getMyListings(sellerId: string): Promise<MyListing[]> {
  const { data, error } = await db()
    .from("listings")
    .select(
      `id, price, cover_photo_url, created_at, ${LISTING_FACTS_COLUMNS},
       condition_grades (code, name),
       actual:versions!listings_actual_version_id_fkey (id, name, typical_price_min, typical_price_max, albums (title))`,
    )
    .eq("seller_id", sellerId)
    .in("status", ["on_sale", "sold"])
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map((l) => {
    const facts = toListingFacts(l as unknown as ListingRow);
    const actual = l.actual as unknown as RangeRow & { id: string; name: string; albums: { title: string } };
    return {
      id: l.id,
      status: facts.status,
      albumTitle: actual.albums.title,
      versionId: actual.id,
      versionName: actual.name,
      condition: l.condition_grades as unknown as { code: string; name: string },
      price: Number(l.price),
      coverPhoto: l.cover_photo_url,
      light: trafficLight(facts.checks, facts.hasMatrixPhoto),
      typicalRange: toTypicalRange(actual),
    };
  });
}

// "ok": changed. "sold": bought meanwhile, nothing changed ("This record was just sold").
// "not_found": not this seller's listing, or not in the status the change needs.
export type ListingChange = "ok" | "sold" | "not_found";

// Changes one of the seller's listings only if it is in the expected status, in one update,
// so a purchase at the same moment can never be undone or edited (Edge cases).
async function changeListing(
  sellerId: string,
  listingId: string,
  expected: ListingFacts["status"],
  values: { price?: number; status?: ListingFacts["status"] },
): Promise<ListingChange> {
  const client = db();
  const { data, error } = await client
    .from("listings")
    .update(values)
    .eq("id", listingId)
    .eq("seller_id", sellerId)
    .eq("status", expected)
    .select("id");
  if (error?.code === "22P02") return "not_found";
  if (error) throw error;
  if (data.length > 0) return "ok";
  const now = await client.from("listings").select("status").eq("id", listingId).eq("seller_id", sellerId).maybeSingle();
  if (now.error) throw now.error;
  return now.data?.status === "sold" ? "sold" : "not_found";
}

// Edit the price (use case 4): only the price changes (finding #80); the caller checks the price rule.
export const updateListingPrice = (sellerId: string, listingId: string, price: number) =>
  changeListing(sellerId, listingId, "on_sale", { price });

// Remove (use case 5): at once, so no buyer can buy it meanwhile (finding #81).
export const removeListing = (sellerId: string, listingId: string) =>
  changeListing(sellerId, listingId, "on_sale", { status: "removed" });

// Undo (use case 6): back on sale as before; price, photos and checks were never touched.
export const undoRemoveListing = (sellerId: string, listingId: string) =>
  changeListing(sellerId, listingId, "removed", { status: "on_sale" });
