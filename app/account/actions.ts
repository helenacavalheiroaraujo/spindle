"use server";
// Log out (story 9 · use case 3): signed out, back to the home page.
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { changePassword, currentUser, currentUserId, logOut } from "@/lib/db/session";
import { saveAddresses } from "@/lib/db/addresses";
import { sendOrderMessage } from "@/lib/db/messages";
import { checkMessage } from "@/lib/rules/orderMessage";
import { checkAddresses, checkPasswordChange, passwordErrorFor, type AddressesErrors, type PasswordErrors } from "@/lib/rules/accountSettings";
import type { ShippingAddress } from "@/lib/rules/shippingAddress";
import { confirmReceipt } from "@/lib/db/orders";
import { addReview } from "@/lib/db/reviews";
import { isValidRating } from "@/lib/rules/sellerRating";

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

// "Send review" (story 18): the buyer rates the seller of a "Seller paid" order, once. Only its buyer can do it.
// "done": saved now, or already rated (nothing to retry). "failed": anything unexpected.
export type RateState = { status: "ready" | "done" | "failed" };

export async function rateSellerAction(orderId: string, _prev: RateState, formData: FormData): Promise<RateState> {
  try {
    const userId = await currentUserId();
    const rating = Number(formData.get("rating"));
    if (!userId || !isValidRating(rating)) return { status: "failed" };
    await addReview(orderId, userId, rating);
  } catch {
    return { status: "failed" };
  }
  revalidatePath("/account");
  return { status: "done" };
}

// "Save password" (bug 9): the current password is checked by Supabase Auth; neither password is sent back.
export type PasswordState = { status: "ready" | "done" | "failed"; errors: PasswordErrors };

export async function changePasswordAction(_prev: PasswordState, form: FormData): Promise<PasswordState> {
  const input = { current: String(form.get("current") ?? ""), next: String(form.get("next") ?? "") };
  const errors = checkPasswordChange(input);
  if (Object.keys(errors).length > 0) return { status: "ready", errors };
  try {
    const user = await currentUser();
    if (!user) return { status: "failed", errors: {} };
    const result = await changePassword(user.email, input.current, input.next);
    if ("errorCode" in result) {
      const fieldErrors = passwordErrorFor(result.errorCode);
      return fieldErrors ? { status: "ready", errors: fieldErrors } : { status: "failed", errors: {} };
    }
  } catch {
    return { status: "failed", errors: {} };
  }
  return { status: "done", errors: {} };
}

// "Save addresses" (bug 9): the delivery address and, when it is different, the billing address.
export type AddressesState = { status: "ready" | "done" | "failed"; errors: AddressesErrors };

const read = (form: FormData, prefix: string): ShippingAddress => ({
  name: String(form.get(`${prefix}name`) ?? ""),
  street: String(form.get(`${prefix}street`) ?? ""),
  postcode: String(form.get(`${prefix}postcode`) ?? ""),
  city: String(form.get(`${prefix}city`) ?? ""),
});

export async function saveAddressesAction(_prev: AddressesState, form: FormData): Promise<AddressesState> {
  const input = { delivery: read(form, "delivery-"), billingSame: form.get("billingSame") === "on", billing: read(form, "billing-") };
  const errors = checkAddresses(input);
  if (Object.keys(errors).length > 0) return { status: "ready", errors };
  try {
    const user = await currentUser();
    if (!user) return { status: "failed", errors: {} };
    await saveAddresses(user.id, user.name, input.delivery, input.billingSame ? null : input.billing);
  } catch {
    return { status: "failed", errors: {} };
  }
  revalidatePath("/account");
  return { status: "done", errors: {} };
}

// "Send message" (bug 8): the buyer writes once to the seller of a "Paid" order, without cancelling it.
// "done": saved now, or already sent (nothing to retry). "ready" with `error`: the text is not valid.
export type MessageState = { status: "ready" | "done" | "failed"; error?: string; text?: string };

export async function sendMessageAction(orderId: string, _prev: MessageState, form: FormData): Promise<MessageState> {
  const checked = checkMessage(String(form.get("message") ?? ""));
  if ("error" in checked) return { status: "ready", error: checked.error };
  try {
    const userId = await currentUserId();
    if (!userId) return { status: "failed" };
    const result = await sendOrderMessage(orderId, userId, checked.text);
    if (result === "not_allowed") return { status: "failed" };
  } catch {
    return { status: "failed" };
  }
  revalidatePath("/account");
  revalidatePath("/my-listings");
  return { status: "done", text: checked.text };
}
