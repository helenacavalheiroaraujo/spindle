"use server";
// Sign-up (story 9 · use case 1): rules in lib/rules/signUp, Supabase access in lib/db.
import { redirect } from "next/navigation";
import { returnPath } from "@/lib/rules/login";
import { checkSignUp, isAccountNotCreated, signUpErrorFor, type FieldErrors } from "@/lib/rules/signUp";
import { signUpWithPassword } from "@/lib/db/session";
import { createProfile } from "@/lib/db/profiles";

export type SignUpState = { errors: FieldErrors; failed: boolean; checkEmail: boolean; values: { name: string; email: string } };

export async function signUp(_prev: SignUpState, form: FormData): Promise<SignUpState> {
  const input = {
    name: String(form.get("name") ?? "").trim(),
    email: String(form.get("email") ?? "").trim(),
    password: String(form.get("password") ?? ""),
  };
  const values = { name: input.name, email: input.email }; // the password is never sent back

  const errors = checkSignUp(input);
  if (Object.keys(errors).length > 0) return { errors, failed: false, checkEmail: false, values };

  let result;
  try {
    result = await signUpWithPassword(input.name, input.email, input.password);
  } catch {
    return { errors: {}, failed: true, checkEmail: false, values };
  }
  if ("errorCode" in result) {
    if (isAccountNotCreated(result.errorCode)) return { errors: {}, failed: false, checkEmail: true, values };
    const fieldErrors = signUpErrorFor(result.errorCode);
    return fieldErrors
      ? { errors: fieldErrors, failed: false, checkEmail: false, values }
      : { errors: {}, failed: true, checkEmail: false, values };
  }

  // If this fails, the user is still signed in; the profile is recreated at login or before Buy / Sell.
  await createProfile(result.userId, input.name).catch(() => false);
  redirect(returnPath(String(form.get("next") ?? "")));
}
