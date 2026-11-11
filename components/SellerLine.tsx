import type { Seller } from "@/lib/rules/seller";

// Seller and city on a listing (story 9 · finding #64). No "Shop" tag (story 25, finding 42).
export function SellerLine({ seller, city }: { seller: Seller; city: string | null }) {
  return (
    <>
      {seller.kind === "shop" ? seller.shopName : "Private seller"}
      {city && `, ${city}`}
    </>
  );
}
