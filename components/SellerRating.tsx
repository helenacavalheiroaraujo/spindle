import { ratingText, type RatingSummary } from "@/lib/rules/sellerRating";

// The seller's reviews on their own line under the seller (story 18): "★ 4.8 · 12 reviews" or "No reviews yet".
export function SellerRating({ rating }: { rating: RatingSummary }) {
  return (
    <span className={`block ${rating.count > 0 ? "font-semibold text-navy" : "text-navy/70"}`}>{ratingText(rating)}</span>
  );
}
