// Sign-up rules (story 9 · Acceptance criteria): covered by tests/unit/signUp.test.ts.

export const MIN_PASSWORD_LENGTH = 8;

export type SignUpInput = { name: string; email: string; password: string };
export type SignUpField = keyof SignUpInput;
export type FieldErrors = Partial<Record<SignUpField, string>>;

// Checked before anything is sent to Supabase Auth. Empty object = the form can be sent.
export function checkSignUp(input: SignUpInput): FieldErrors {
  const errors: FieldErrors = {};
  if (input.name.trim() === "") errors.name = "Enter your name.";
  if (input.email.trim() === "") errors.email = "Enter your email.";
  if (input.password.length < MIN_PASSWORD_LENGTH)
    errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  return errors;
}

// Shown for a registered email, so the screen never says that the email has an account (bug 15).
// It promises no email: email confirmation is off in the MVP, so none would be sent.
export const ACCOUNT_NOT_CREATED = "We couldn't create an account with these details.";

// Supabase Auth error code → true when the answer must be the generic "couldn't create" screen.
export function isAccountNotCreated(code: string | undefined): boolean {
  return code === "user_already_exists" || code === "email_exists";
}

// Supabase Auth error code → message on the field it belongs to. Null = unexpected: the shared error screen.
export function signUpErrorFor(code: string | undefined): FieldErrors | null {
  switch (code) {
    case "email_address_invalid":
    case "validation_failed":
      return { email: "Enter a valid email address." };
    case "weak_password":
      return { password: `Use at least ${MIN_PASSWORD_LENGTH} characters.` };
    default:
      return null;
  }
}
