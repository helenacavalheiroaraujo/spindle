import type { Seller } from "@/lib/rules/seller";

// Seller and city on a listing (story 9 · finding #64). The "Shop" tag has a neutral style so it
// does not compete with the traffic light.
export function SellerLine({ seller, city }: { seller: Seller; city: string | null }) {
  return (
    <>
      {seller.kind === "shop" ? seller.shopName : "Private seller"}
      {city && `, ${city}`}
      {seller.kind === "shop" && (
        <span className="ml-2 inline-block rounded-full border border-navy/30 px-2 py-0.5 text-xs">Shop</span>
      )}
    </>
  );
}
