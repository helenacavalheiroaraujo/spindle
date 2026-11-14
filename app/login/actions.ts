"use server";
// Log in (story 9 · use case 2): rules in lib/rules/login, Supabase access in lib/db.
import { checkLogin, loginErrorFor, returnPath, type LoginErrors } from "@/lib/rules/login";
import { logInWithPassword } from "@/lib/db/session";
import { ensureProfile } from "@/lib/db/profiles";

export type LoginState = { errors: LoginErrors; failed: boolean; email: string; done?: string };

// Log in from the log-in window (stories 27, 29), the only way to log in: returns where to go (`done`), and the window
// opens it with a full page load, so the header and the cart are read again after the action goes on (e.g. a record
// added through /cart/add).
export async function logInOnly(_prev: LoginState, form: FormData): Promise<LoginState> {
  const input = {
    email: String(form.get("email") ?? "").trim(),
    password: String(form.get("password") ?? ""),
  };
  const email = input.email; // the password is never sent back

  const errors = checkLogin(input);
  if (Object.keys(errors).length > 0) return { errors, failed: false, email };

  let result;
  try {
    result = await logInWithPassword(input.email, input.password);
  } catch {
    return { errors: {}, failed: true, email };
  }
  if ("errorCode" in result) {
    const formErrors = loginErrorFor(result.errorCode);
    return formErrors ? { errors: formErrors, failed: false, email } : { errors: {}, failed: true, email };
  }

  // The user is signed in either way; a missing profile is tried again before Buy / Sell.
  await ensureProfile(result.userId, result.name).catch(() => undefined);
  return { errors: {}, failed: false, email, done: returnPath(String(form.get("next") ?? "")) };
}
