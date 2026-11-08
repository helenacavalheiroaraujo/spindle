// A signed-in buyer's saved ranking (story 2 · phase 2). One per account; "Change" replaces it (DECISIONS · finding #11).
import { parsePriorities, type Priority } from "@/lib/rules/priorities";
import { db } from "./client";

// The saved ranking, or null when the buyer has none. Values are read through the same rule as the address.
export async function getSavedRanking(userId: string): Promise<Priority[] | null> {
  const { data, error } = await db().from("user_preferences").select("ranking").eq("user_id", userId).maybeSingle();
  if (error) throw new Error(`Could not load the saved priorities: ${error.message}`);
  if (!data) return null;
  const ranking = parsePriorities((data.ranking as string[]).join(","));
  return ranking.length > 0 ? ranking : null;
}

// Saves the ranking, replacing any saved one. An empty ranking is never saved.
export async function saveRanking(userId: string, ranking: Priority[]): Promise<void> {
  if (ranking.length === 0) return;
  const { error } = await db().from("user_preferences").upsert({ user_id: userId, ranking }, { onConflict: "user_id" });
  if (error) throw new Error(`Could not save the priorities: ${error.message}`);
}
