// Public profile of a signed-in user (story 9). Created by the app at sign-up, not by a database trigger (DECISIONS · story 9).
import { db } from "./client";

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
