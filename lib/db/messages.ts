// The buyer's message to the seller (bug 8): one per order. Server key only; the browser never reads the table.
import { db } from "./client";
import { canMessageSeller } from "@/lib/rules/orderMessage";
import type { OrderStatus } from "@/lib/rules/orderProgress";

// "sent": saved. "not_allowed": not this buyer's order, or no longer "Paid". "already_sent": it has its message.
// Throws on any other failure (the caller shows the error screen).
export async function sendOrderMessage(orderId: string, buyerUserId: string, text: string): Promise<"sent" | "not_allowed" | "already_sent"> {
  const profile = await db().from("profiles").select("id").eq("user_id", buyerUserId).maybeSingle();
  if (profile.error) throw profile.error;
  if (!profile.data) return "not_allowed";
  const order = await db().from("orders").select("status").eq("id", orderId).eq("buyer_id", profile.data.id).maybeSingle();
  if (order.error?.code === "22P02") return "not_allowed"; // not a valid order id
  if (order.error) throw order.error;
  if (!order.data) return "not_allowed";
  if (!canMessageSeller(order.data.status as OrderStatus, false)) return "not_allowed";
  const { error } = await db().from("order_messages").insert({ order_id: orderId, body: text });
  if (error?.code === "23505") return "already_sent"; // the table allows one message per order
  if (error) throw error;
  return "sent";
}

// The message of each of these orders, by order id (the buyer's side).
export async function messagesForOrders(orderIds: string[]): Promise<Map<string, string>> {
  if (orderIds.length === 0) return new Map();
  const { data, error } = await db().from("order_messages").select("order_id, body").in("order_id", orderIds);
  if (error) throw error;
  return new Map((data ?? []).map((m) => [m.order_id as string, m.body as string]));
}

export type ReceivedMessage = { from: string; body: string };

// The message the buyer left on each sold listing, by listing id (the seller's side, Sold tab of My listings).
export async function messagesForSoldListings(listingIds: string[]): Promise<Record<string, ReceivedMessage>> {
  if (listingIds.length === 0) return {};
  const { data, error } = await db()
    .from("orders")
    .select("listing_id, profiles!orders_buyer_id_fkey (name), order_messages (body)")
    .in("listing_id", listingIds);
  if (error) throw error;
  const result: Record<string, ReceivedMessage> = {};
  for (const row of data ?? []) {
    const message = (row.order_messages as unknown as { body: string }[] | { body: string } | null);
    const body = Array.isArray(message) ? message[0]?.body : message?.body;
    if (!body) continue;
    const buyer = row.profiles as unknown as { name: string } | null;
    result[row.listing_id as string] = { from: buyer?.name ?? "The buyer", body };
  }
  return result;
}
