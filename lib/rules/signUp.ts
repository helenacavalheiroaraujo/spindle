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

export const EMAIL_IN_USE = "This email already has an account";

// Supabase Auth error code → message on the field it belongs to. Null = unexpected: the shared error screen.
export function signUpErrorFor(code: string | undefined): FieldErrors | null {
  switch (code) {
    case "user_already_exists":
    case "email_exists":
      return { email: EMAIL_IN_USE };
    case "email_address_invalid":
    case "validation_failed":
      return { email: "Enter a valid email address." };
    case "weak_password":
      return { password: `Use at least ${MIN_PASSWORD_LENGTH} characters.` };
    default:
      return null;
  }
}
