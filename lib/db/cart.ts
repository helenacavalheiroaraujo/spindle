// The cart (story 20). It belongs to the account: cart_items.buyer_id is the buyer's profile (docs/database.md).
// Who can add, and which records stay, are decided in lib/rules/cartAccess.ts; this file only reads and writes.
import { db } from "./client";
import { LISTING_FACTS_COLUMNS, getListingCheck, toListingFacts } from "./listings";
import { sellerOf, type Seller } from "@/lib/rules/seller";
import { canAddToCart, leftCartMessage, staysInCart } from "@/lib/rules/cartAccess";
import { cartTotal } from "@/lib/rules/cartTotal";
import type { ShippingAddress } from "@/lib/rules/shippingAddress";

async function profileIdOf(userId: string): Promise<string | null> {
  const { data, error } = await db().from("profiles").select("id").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

// The ids of the records in the signed-in buyer's cart that are still on sale: the header's count and the
// "In your cart" state of the listings. A sold record is not counted, even before the cart screen removes it.
export async function cartListingIds(userId: string): Promise<string[]> {
  const buyerId = await profileIdOf(userId);
  if (!buyerId) return [];
  const { data, error } = await db()
    .from("cart_items")
    .select("listing_id, listings!inner (status)")
    .eq("buyer_id", buyerId)
    .eq("listings.status", "on_sale");
  if (error) throw error;
  return (data ?? []).map((row) => row.listing_id);
}

// "added", "already" (it was in the cart) or "not_allowed" (red, sold, removed, or the buyer's own listing).
// Throws on any other failure (the caller shows the error). nameIfMissing recreates a missing profile (story 9).
export async function addToCart(userId: string, listingId: string, nameIfMissing: string): Promise<"added" | "already" | "not_allowed"> {
  const profile = await db().from("profiles").select("id").eq("user_id", userId).maybeSingle();
  if (profile.error) throw profile.error;
  let buyerId = profile.data?.id ?? null;
  if (!buyerId) {
    const created = await db().from("profiles").insert({ user_id: userId, name: nameIfMissing || "Buyer" }).select("id").single();
    if (created.error) throw created.error;
    buyerId = created.data.id;
  }
  const listing = await getListingCheck(listingId);
  if (!listing || !canAddToCart(listing, buyerId)) return "not_allowed";
  const { error } = await db().from("cart_items").insert({ buyer_id: buyerId, listing_id: listingId });
  if (error?.code === "23505") return "already"; // the same listing cannot be in the cart twice
  if (error) throw error;
  return "added";
}

export async function removeFromCart(userId: string, listingId: string): Promise<void> {
  const buyerId = await profileIdOf(userId);
  if (!buyerId) return;
  const { error } = await db().from("cart_items").delete().eq("buyer_id", buyerId).eq("listing_id", listingId);
  if (error && error.code !== "22P02") throw error; // 22P02: not a valid listing id, so nothing to remove
}

export type CartItem = {
  listingId: string;
  title: string; // "Homogenic, 2017 Reissue"
  price: number;
  condition: { code: string; name: string };
  seller: Seller;
  city: string | null;
  cover: string | null;
};

// The cart as the buyer sees it. A record that can no longer be bought (sold to someone else, removed) leaves the
// cart here, and the message for it comes back once (use case 5). The rest is in the order it was added.
// sweep = false only looks (the checkout does): a screen that sends the buyer back to the cart leaves the removal,
// and so the message, to the cart screen.
export async function getCart(userId: string, sweep = true): Promise<{ items: CartItem[]; messages: string[] }> {
  const buyerId = await profileIdOf(userId);
  if (!buyerId) return { items: [], messages: [] };
  const { data, error } = await db()
    .from("cart_items")
    .select(
      `listing_id, listings (id, price, seller_id, cover_photo_url, ${LISTING_FACTS_COLUMNS},
         profiles (shop_name, city),
         condition_grades (code, name),
         actual:versions!listings_actual_version_id_fkey (name, albums (title)))`,
    )
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: true });
  if (error) throw error;

  const items: CartItem[] = [];
  const messages: string[] = [];
  const gone: string[] = [];
  for (const row of data ?? []) {
    const l = row.listings as unknown as {
      id: string;
      price: number | string;
      cover_photo_url: string | null;
      profiles: { shop_name: string | null; city: string | null };
      condition_grades: { code: string; name: string };
      actual: { name: string; albums: { title: string } };
    } & Parameters<typeof toListingFacts>[0];
    const facts = toListingFacts(l);
    const title = `${l.actual.albums.title}, ${l.actual.name}`;
    if (!staysInCart({ ...facts, id: l.id, price: Number(l.price) })) {
      gone.push(row.listing_id);
      messages.push(leftCartMessage(title, facts.status));
      continue;
    }
    items.push({
      listingId: l.id,
      title,
      price: Number(l.price),
      condition: l.condition_grades,
      seller: sellerOf(l.profiles.shop_name),
      city: l.profiles.city,
      cover: l.cover_photo_url,
    });
  }
  if (sweep && gone.length > 0) {
    const removed = await db().from("cart_items").delete().eq("buyer_id", buyerId).in("listing_id", gone);
    if (removed.error) throw removed.error;
  }
  return { items, messages };
}

// Pay for the whole cart: one order per record, all or nothing (place_orders in the database).
// { sold: true } when a record was sold meanwhile: nothing was paid, and the cart screen removes it with a message.
// orderIds in the order of the cart. Throws on any other failure (the caller shows the error screen).
export async function placeCartOrders(
  userId: string,
  items: CartItem[],
  address: ShippingAddress,
): Promise<{ orderIds: string[] } | { sold: true }> {
  const buyerId = await profileIdOf(userId);
  if (!buyerId) throw new Error("No profile for the buyer.");
  const amounts = cartTotal(items.map((i) => i.price));
  const { data, error } = await db().rpc("place_orders", {
    p_buyer_id: buyerId,
    p_items: items.map((item, i) => ({ listing_id: item.listingId, total: amounts.lines[i].total })),
    p_shipping: amounts.lines[0]?.shipping ?? 0,
    p_protection_fee: amounts.lines[0]?.protectionFee ?? 0,
    p_ship_name: address.name.trim(),
    p_ship_street: address.street.trim(),
    p_ship_postcode: address.postcode.trim(),
    p_ship_city: address.city.trim(),
  });
  if (error?.message.includes("listing_not_on_sale")) return { sold: true };
  if (error) throw error;
  return { orderIds: data as string[] };
}
