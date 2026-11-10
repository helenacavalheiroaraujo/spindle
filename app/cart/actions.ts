"use server";
// Add to cart and Remove (story 20). The browser never reads the database; the rules are in lib/rules/cartAccess.
import { revalidatePath } from "next/cache";
import { addToCart, removeFromCart } from "@/lib/db/cart";
import { currentUser } from "@/lib/db/session";

// "login": signed out, the link asks to log in first. "failed": anything unexpected (the caller shows "Try again").
export type AddResult = "added" | "already" | "not_allowed" | "login" | "failed";

export async function addListingToCart(listingId: string): Promise<AddResult> {
  try {
    const user = await currentUser();
    if (!user) return "login";
    const result = await addToCart(user.id, listingId, user.name);
    revalidatePath("/", "layout"); // the count in the header and "In your cart" on the listings
    return result;
  } catch {
    return "failed";
  }
}

export async function removeListingFromCart(listingId: string): Promise<"removed" | "failed"> {
  try {
    const user = await currentUser();
    if (user) await removeFromCart(user.id, listingId);
    revalidatePath("/", "layout");
    return "removed";
  } catch {
    return "failed";
  }
}
