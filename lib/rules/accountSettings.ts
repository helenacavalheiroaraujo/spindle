// "Your account": change password and saved addresses (bug 9). Covered by tests/unit/accountSettings.test.ts.
import { canPay, postcodeError, type ShippingAddress } from "./shippingAddress";
import { MIN_PASSWORD_LENGTH } from "./signUp";

export type PasswordErrors = { current?: string; next?: string };

export const WRONG_CURRENT_PASSWORD = "That isn't your current password.";
const SHORT_PASSWORD = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
const SAME_PASSWORD = "Choose a password different from the current one.";

// Checked before anything is sent to Supabase Auth. Empty object = the form can be sent.
export function checkPasswordChange(input: { current: string; next: string }): PasswordErrors {
  const errors: PasswordErrors = {};
  if (input.current === "") errors.current = "Enter your current password.";
  if (input.next.length < MIN_PASSWORD_LENGTH) errors.next = SHORT_PASSWORD;
  else if (input.next === input.current) errors.next = SAME_PASSWORD;
  return errors;
}

// Supabase Auth error code → message on the field it belongs to. Null = unexpected: the shared error screen.
export function passwordErrorFor(code: string | undefined): PasswordErrors | null {
  switch (code) {
    case "invalid_credentials":
      return { current: WRONG_CURRENT_PASSWORD };
    case "weak_password":
      return { next: SHORT_PASSWORD };
    case "same_password":
      return { next: SAME_PASSWORD };
    default:
      return null;
  }
}

export const ADDRESS_INCOMPLETE = "Fill in name, street, postcode and city.";

// One address: null when it can be saved, otherwise the message to show (same completeness rule as the checkout).
export function addressError(address: ShippingAddress): string | null {
  if (canPay(address)) return null;
  return postcodeError(address.postcode) ?? ADDRESS_INCOMPLETE;
}

export type AddressesInput = { delivery: ShippingAddress; billingSame: boolean; billing: ShippingAddress };
export type AddressesErrors = { delivery?: string; billing?: string };

// The billing address is only checked when it is different from the delivery address.
export function checkAddresses(input: AddressesInput): AddressesErrors {
  const errors: AddressesErrors = {};
  const delivery = addressError(input.delivery);
  if (delivery) errors.delivery = delivery;
  if (!input.billingSame) {
    const billing = addressError(input.billing);
    if (billing) errors.billing = billing;
  }
  return errors;
}
