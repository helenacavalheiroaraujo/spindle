// Orders (story 7). Pay runs place_order in the database: it marks the listing sold and creates
// the order in one step, or changes nothing if the listing is no longer on sale (docs/database.md).
import { db } from "./client";
import type { CheckoutTotal } from "@/lib/rules/checkoutTotal";
import type { ShippingAddress } from "@/lib/rules/shippingAddress";
import { sellerOf, type Seller } from "@/lib/rules/seller";
import type { OrderStatus } from "@/lib/rules/orderProgress";

export type PlaceOrderResult = { orderId: string } | { sold: true };

// Throws on any other failure (the caller shows the error screen).
// buyerUserId is the signed-in account; orders.buyer_id points to that account's profile.
export async function placeOrder(
  buyerUserId: string,
  listingId: string,
  amounts: CheckoutTotal,
  address: ShippingAddress,
): Promise<PlaceOrderResult> {
  const profile = await db().from("profiles").select("id").eq("user_id", buyerUserId).single();
  if (profile.error) throw profile.error;
  const { data, error } = await db().rpc("place_order", {
    p_buyer_id: profile.data.id,
    p_listing_id: listingId,
    p_shipping: amounts.shipping,
    p_protection_fee: amounts.protectionFee,
    p_total: amounts.total,
    p_ship_name: address.name.trim(),
    p_ship_street: address.street.trim(),
    p_ship_postcode: address.postcode.trim(),
    p_ship_city: address.city.trim(),
  });
  if (error?.message.includes("listing_not_on_sale")) return { sold: true };
  if (error) throw error;
  return { orderId: data as string };
}

export type OrderView = {
  id: string;
  total: number;
  status: OrderStatus;
  albumTitle: string;
  versionName: string;
  condition: { code: string; name: string };
  seller: Seller;
  city: string | null;
  cover: string | null;
};

const ORDER_COLUMNS = `id, total, status, profiles!orders_buyer_id_fkey (user_id),
  listings (cover_photo_url, profiles (shop_name, city), condition_grades (code, name),
    actual:versions!listings_actual_version_id_fkey (name, albums (title)))`;

type OrderRow = { id: string; total: number | string; status: OrderStatus; profiles: unknown; listings: unknown };

function toOrderView(data: OrderRow): OrderView {
  const l = data.listings as {
    cover_photo_url: string | null;
    profiles: { shop_name: string | null; city: string | null };
    condition_grades: { code: string; name: string };
    actual: { name: string; albums: { title: string } };
  };
  return {
    id: data.id,
    total: Number(data.total),
    status: data.status,
    albumTitle: l.actual.albums.title,
    versionName: l.actual.name,
    condition: l.condition_grades,
    seller: sellerOf(l.profiles.shop_name),
    city: l.profiles.city,
    cover: l.cover_photo_url,
  };
}

// The order as its buyer sees it. Null when it does not exist or belongs to someone else.
// The order does not store which version the buyer came from, so the record's actual version is shown.
export async function getOrderForBuyer(orderId: string, buyerUserId: string): Promise<OrderView | null> {
  const { data, error } = await db().from("orders").select(ORDER_COLUMNS).eq("id", orderId).maybeSingle();
  if (error?.code === "22P02") return null; // not a valid order id
  if (error) throw error;
  if (!data) return null;
  const buyer = data.profiles as unknown as { user_id: string };
  if (buyer.user_id !== buyerUserId) return null;
  return toOrderView(data as unknown as OrderRow);
}

// All of the signed-in buyer's orders, newest first (story 7 · step 3: "On its way" on Your account).
export async function getOrdersForBuyer(buyerUserId: string): Promise<OrderView[]> {
  const profile = await db().from("profiles").select("id").eq("user_id", buyerUserId).maybeSingle();
  if (profile.error) throw profile.error;
  if (!profile.data) return []; // no profile yet, so no orders
  const { data, error } = await db()
    .from("orders")
    .select(ORDER_COLUMNS)
    .eq("buyer_id", profile.data.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => toOrderView(row as unknown as OrderRow));
}

// "confirmed": the order is now "Seller paid". "not_waiting": it is not this buyer's order, or it was
// already confirmed; nothing changed. Throws on any other failure (the caller shows the error screen).
// One conditional update, so two taps or two tabs confirm it only once.
export async function confirmReceipt(orderId: string, buyerUserId: string): Promise<"confirmed" | "not_waiting"> {
  const profile = await db().from("profiles").select("id").eq("user_id", buyerUserId).maybeSingle();
  if (profile.error) throw profile.error;
  if (!profile.data) return "not_waiting";
  const { data, error } = await db()
    .from("orders")
    .update({ status: "seller_paid" })
    .eq("id", orderId)
    .eq("buyer_id", profile.data.id)
    .eq("status", "paid_waiting_seller")
    .select("id");
  if (error?.code === "22P02") return "not_waiting"; // not a valid order id
  if (error) throw error;
  return data.length > 0 ? "confirmed" : "not_waiting";
}
