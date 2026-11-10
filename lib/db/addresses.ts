// Saved addresses of the signed-in user (bug 9): one delivery address and, only when different, one billing address.
// No billing row = billing is the same as delivery. Server key only; the browser never reads the table.
import { db } from "./client";
import { getSellerProfile } from "./profiles";
import type { ShippingAddress } from "@/lib/rules/shippingAddress";

export type SavedAddresses = { delivery: ShippingAddress | null; billing: ShippingAddress | null };

const COLUMNS = "kind, name, street, postcode, city";
type Row = { kind: string; name: string; street: string; postcode: string; city: string };
const toAddress = (r: Row): ShippingAddress => ({ name: r.name, street: r.street, postcode: r.postcode, city: r.city });

async function profileIdOf(userId: string, nameIfMissing: string): Promise<string> {
  const profile = await getSellerProfile(userId, nameIfMissing);
  if (!profile) throw new Error("Could not find the profile.");
  return profile.id;
}

export async function getSavedAddresses(userId: string): Promise<SavedAddresses> {
  const { data: profile, error: profileError } = await db().from("profiles").select("id").eq("user_id", userId).maybeSingle();
  if (profileError) throw new Error(`Could not load the profile: ${profileError.message}`);
  if (!profile) return { delivery: null, billing: null };
  const { data, error } = await db().from("addresses").select(COLUMNS).eq("profile_id", profile.id);
  if (error) throw new Error(`Could not load the addresses: ${error.message}`);
  const rows = (data ?? []) as Row[];
  const find = (kind: string) => rows.find((r) => r.kind === kind);
  const delivery = find("delivery");
  const billing = find("billing");
  return { delivery: delivery ? toAddress(delivery) : null, billing: billing ? toAddress(billing) : null };
}

// Saves the delivery address and the billing one; `billing` null means "same as delivery" and removes a saved one.
export async function saveAddresses(userId: string, nameIfMissing: string, delivery: ShippingAddress, billing: ShippingAddress | null): Promise<void> {
  const profileId = await profileIdOf(userId, nameIfMissing);
  const row = (kind: string, a: ShippingAddress) => ({
    profile_id: profileId,
    kind,
    name: a.name.trim(),
    street: a.street.trim(),
    postcode: a.postcode.trim(),
    city: a.city.trim(),
    updated_at: new Date().toISOString(),
  });
  const rows = billing ? [row("delivery", delivery), row("billing", billing)] : [row("delivery", delivery)];
  const saved = await db().from("addresses").upsert(rows, { onConflict: "profile_id,kind" });
  if (saved.error) throw new Error(`Could not save the addresses: ${saved.error.message}`);
  if (!billing) {
    const removed = await db().from("addresses").delete().eq("profile_id", profileId).eq("kind", "billing");
    if (removed.error) throw new Error(`Could not save the addresses: ${removed.error.message}`);
  }
}
