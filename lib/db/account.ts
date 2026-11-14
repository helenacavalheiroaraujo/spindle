// The counts next to the Your account tabs (story 31): all the buyer's orders, and the listings on sale.
import { db } from "./client";
import type { AccountCounts } from "@/lib/rules/accountTabs";

export async function getAccountCounts(userId: string): Promise<AccountCounts> {
  const profile = await db().from("profiles").select("id").eq("user_id", userId).maybeSingle();
  if (profile.error) throw profile.error;
  if (!profile.data) return { orders: 0, forSale: 0 }; // no profile yet: nothing bought or listed
  const [orders, forSale] = await Promise.all([
    db().from("orders").select("id", { count: "exact", head: true }).eq("buyer_id", profile.data.id),
    db().from("listings").select("id", { count: "exact", head: true }).eq("seller_id", profile.data.id).eq("status", "on_sale"),
  ]);
  if (orders.error) throw orders.error;
  if (forSale.error) throw forSale.error;
  return { orders: orders.count ?? 0, forSale: forSale.count ?? 0 };
}
