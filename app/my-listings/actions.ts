"use server";
// My listings (story 8 · use cases 4–6): edit the price, remove, undo. The rules are checked again here.
import { getSellerProfile } from "@/lib/db/profiles";
import { removeListing, undoRemoveListing, updateListingPrice, type ListingChange } from "@/lib/db/listings";
import { currentUser } from "@/lib/db/session";
import { checkPrice } from "@/lib/rules/sellForm";

// "failed": anything unexpected (signed out meanwhile, connection): the error screen with "Try again".
export type ChangeResult = ListingChange | "invalid" | "failed";

async function asSeller(change: (sellerId: string) => Promise<ListingChange>): Promise<ChangeResult> {
  try {
    const user = await currentUser();
    if (!user) return "failed";
    const profile = await getSellerProfile(user.id, user.name);
    if (!profile) return "failed";
    return await change(profile.id);
  } catch {
    return "failed";
  }
}

export async function savePrice(listingId: string, typed: string): Promise<ChangeResult> {
  const price = checkPrice(typed);
  if (!price.ok) return "invalid";
  return asSeller((sellerId) => updateListingPrice(sellerId, listingId, price.price));
}

export async function remove(listingId: string): Promise<ChangeResult> {
  return asSeller((sellerId) => removeListing(sellerId, listingId));
}

export async function undoRemove(listingId: string): Promise<ChangeResult> {
  return asSeller((sellerId) => undoRemoveListing(sellerId, listingId));
}
