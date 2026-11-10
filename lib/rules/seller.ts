// How a seller appears on listings (story 9 · finding #64): covered by tests/unit/seller.test.ts.
// A seller with a shop name shows that name and a "Shop" tag; everyone else shows "Private seller".
// A seller's personal name is never shown on listings.
export type Seller = { kind: "shop"; shopName: string } | { kind: "private" };

export function sellerOf(shopName: string | null): Seller {
  const name = shopName?.trim() ?? "";
  return name === "" ? { kind: "private" } : { kind: "shop", shopName: name };
}

// The seller in words, for labels read aloud (e.g. the Buy button).
export function sellerText(seller: Seller): string {
  return seller.kind === "shop" ? `${seller.shopName} (Shop)` : "Private seller";
}

// Where a listing is sold from (bug 11). A listing made since the seller could choose its place keeps its own
// city and shop name; an older listing has none and shows the seller's profile, as before.
export type Place = { city: string | null; shopName: string | null };

export function listingPlace(listing: { sellerCity: string | null; sellerShopName: string | null }, profile: Place): Place {
  return listing.sellerCity !== null ? { city: listing.sellerCity, shopName: listing.sellerShopName } : profile;
}
