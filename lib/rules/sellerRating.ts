// What a seller's reviews look like on listings (story 18): covered by tests/unit/sellerRating.test.ts.
// One place for the average, the count and the words; the screens only show what comes back.
export const MIN_RATING = 1;
export const MAX_RATING = 5;

export type RatingSummary = { count: number; average: number | null };

// A rating is a whole number from 1 to 5.
export function isValidRating(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= MIN_RATING && value <= MAX_RATING;
}

export function summarize(ratings: number[]): RatingSummary {
  if (ratings.length === 0) return { count: 0, average: null };
  const sum = ratings.reduce((total, r) => total + r, 0);
  return { count: ratings.length, average: Math.round((sum / ratings.length) * 10) / 10 };
}

// "★ 4.8 · 12 reviews", "★ 5.0 · 1 review", or "No reviews yet".
export function ratingText(summary: RatingSummary): string {
  if (summary.count === 0 || summary.average === null) return "No reviews yet";
  return `★ ${summary.average.toFixed(1)} · ${summary.count} ${summary.count === 1 ? "review" : "reviews"}`;
}

// What the question on the order card shows while the buyer chooses.
export function starsText(chosen: number | null): string {
  return chosen === null ? "Choose from 1 to 5 stars" : `${chosen} of ${MAX_RATING} stars`;
}

// "Send review" waits for a star.
export function canSendReview(chosen: number | null): boolean {
  return chosen !== null && isValidRating(chosen);
}

// The question is open for an order that is delivered, not yet rated, and not closed with "Not now".
export function canRate(status: "paid_waiting_seller" | "seller_paid", reviewed: boolean): boolean {
  return status === "seller_paid" && !reviewed;
}
