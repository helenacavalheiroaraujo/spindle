"use server";
// Log out (story 9 · use case 3): signed out, back to the home page.
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { currentUserId, logOut } from "@/lib/db/session";
import { confirmReceipt } from "@/lib/db/orders";

export type LogOutState = { failed: boolean };

export async function logOutAction(_prev: LogOutState): Promise<LogOutState> {
  try {
    await logOut();
  } catch {
    return { failed: true };
  }
  redirect("/");
}

// "It arrived, all good" (story 7 · step 3): the order becomes "Seller paid". Only its buyer can do it, once.
// "done": confirmed now, or already confirmed (nothing to retry). "failed": anything unexpected.
export type ConfirmState = { status: "ready" | "done" | "failed" };

export async function confirmReceiptAction(orderId: string, _prev: ConfirmState): Promise<ConfirmState> {
  try {
    const userId = await currentUserId();
    if (!userId) return { status: "failed" };
    await confirmReceipt(orderId, userId);
  } catch {
    return { status: "failed" };
  }
  revalidatePath("/account");
  return { status: "done" };
}
