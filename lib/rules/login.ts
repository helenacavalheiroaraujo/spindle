// Log-in rules (story 9 · Acceptance criteria): covered by tests/unit/login.test.ts.

export type LoginInput = { email: string; password: string };
export type LoginField = keyof LoginInput;
export type LoginErrors = Partial<Record<LoginField, string>> & { form?: string };

// Checked before anything is sent to Supabase Auth. Empty object = the form can be sent.
export function checkLogin(input: LoginInput): LoginErrors {
  const errors: LoginErrors = {};
  if (input.email.trim() === "") errors.email = "Enter your email.";
  if (input.password === "") errors.password = "Enter your password.";
  return errors;
}

// Exact text from the acceptance criterion: never says whether the email or the password was wrong.
export const WRONG_LOGIN = "That email and password don't match. Check them and try again.";

// Supabase Auth error code → message for the whole form. Null = unexpected: the shared error screen.
export function loginErrorFor(code: string | undefined): LoginErrors | null {
  switch (code) {
    case "invalid_credentials":
    case "user_not_found":
      return { form: WRONG_LOGIN };
    case "email_address_invalid":
    case "validation_failed":
      return { email: "Enter a valid email address." };
    default:
      return null;
  }
}

// Where to go after log-in or sign-up ("returns to where they were").
// Only addresses inside Spindle are followed; anything else goes to the home page,
// so a link from outside cannot send the user to another site after they log in.
export function returnPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return "/";
  return next;
}

// Adds the return address to the log-in and sign-up links, so it survives switching between them.
export function withReturn(page: "/login" | "/signup", next: string): string {
  const path = returnPath(next);
  return path === "/" ? page : `${page}?next=${encodeURIComponent(path)}`;
}
