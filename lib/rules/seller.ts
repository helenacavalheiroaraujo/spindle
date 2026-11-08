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
