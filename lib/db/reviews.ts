// Reviews of sellers (story 18). Facts only: lib/rules/sellerRating decides the average and the words.
import { db } from "./client";
import { summarize, type RatingSummary } from "@/lib/rules/sellerRating";

// The summary for each seller (profile id); a seller with no reviews gets { count: 0, average: null }.
export async function sellerRatings(sellerIds: string[]): Promise<Map<string, RatingSummary>> {
  const ids = [...new Set(sellerIds)];
  const result = new Map<string, RatingSummary>();
  if (ids.length === 0) return result;
  const { data, error } = await db().from("reviews").select("seller_id, rating").in("seller_id", ids);
  if (error) throw error;
  for (const id of ids) result.set(id, summarize(data.filter((r) => r.seller_id === id).map((r) => r.rating)));
  return result;
}

// Which of these orders already have a review.
export async function reviewedOrderIds(orderIds: string[]): Promise<Set<string>> {
  if (orderIds.length === 0) return new Set();
  const { data, error } = await db().from("reviews").select("order_id").in("order_id", orderIds);
  if (error) throw error;
  return new Set(data.map((r) => r.order_id as string));
}

// "saved": the review is in. "not_allowed": not this buyer's order, or it is not "Seller paid" yet, or it was already
// rated; nothing changed. Throws on any other failure (the caller shows the error screen).
// The unique order_id in the table makes two taps or two tabs rate only once.
export async function addReview(orderId: string, buyerUserId: string, rating: number): Promise<"saved" | "not_allowed"> {
  const profile = await db().from("profiles").select("id").eq("user_id", buyerUserId).maybeSingle();
  if (profile.error) throw profile.error;
  if (!profile.data) return "not_allowed";
  const order = await db()
    .from("orders")
    .select("id, status, listings (seller_id)")
    .eq("id", orderId)
    .eq("buyer_id", profile.data.id)
    .maybeSingle();
  if (order.error?.code === "22P02") return "not_allowed"; // not a valid order id
  if (order.error) throw order.error;
  if (!order.data || order.data.status !== "seller_paid") return "not_allowed";
  const sellerId = (order.data.listings as unknown as { seller_id: string }).seller_id;
  const { error } = await db().from("reviews").insert({ order_id: orderId, seller_id: sellerId, rating });
  if (error?.code === "23505") return "not_allowed"; // already rated
  if (error) throw error;
  return "saved";
}
