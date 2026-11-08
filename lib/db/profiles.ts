// Public profile of a signed-in user (story 9). Created by the app at sign-up, not by a database trigger (DECISIONS · story 9).
import { db } from "./client";
import { currentUserId } from "./session";

// True when the profile was saved. False leaves the account without a profile; it is recreated at login or before Buy / Sell.
export async function createProfile(userId: string, name: string): Promise<boolean> {
  const { error } = await db().from("profiles").insert({ user_id: userId, name });
  return !error;
}

export async function getProfileName(userId: string): Promise<string | null> {
  const { data, error } = await db().from("profiles").select("name").eq("user_id", userId).maybeSingle();
  if (error) throw new Error(`Could not load the profile: ${error.message}`);
  return data?.name ?? null;
}

// At log-in: recreates the profile if sign-up saved the account but not the profile (DECISIONS · story 9).
export async function ensureProfile(userId: string, name: string): Promise<void> {
  if ((await getProfileName(userId)) === null && name) await createProfile(userId, name);
}

export type SellerProfile = { id: string; city: string | null; shopName: string | null };

// The signed-in user's profile for selling (story 8). Recreated first if sign-up saved the account
// but not the profile (DECISIONS · story 9). Null if it still cannot be found.
export async function getSellerProfile(userId: string, nameIfMissing: string): Promise<SellerProfile | null> {
  const read = () => db().from("profiles").select("id, city, shop_name").eq("user_id", userId).maybeSingle();
  let { data, error } = await read();
  if (error) throw new Error(`Could not load the profile: ${error.message}`);
  if (!data) {
    await createProfile(userId, nameIfMissing || "Seller");
    ({ data, error } = await read());
    if (error) throw new Error(`Could not load the profile: ${error.message}`);
  }
  return data ? { id: data.id, city: data.city, shopName: data.shop_name } : null;
}

// The signed-in user's profile id, or null when signed out or without a profile.
// Used to show "Your listing" instead of Buy on the seller's own listings (finding #12).
export async function currentProfileId(): Promise<string | null> {
  const userId = await currentUserId();
  if (!userId) return null;
  const { data, error } = await db().from("profiles").select("id").eq("user_id", userId).maybeSingle();
  if (error) throw new Error(`Could not load the profile: ${error.message}`);
  return data?.id ?? null;
}
