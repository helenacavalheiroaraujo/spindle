// Shipping address on the checkout (story 7 · What the checkout shows, Acceptance criteria):
// covered by tests/unit/shippingAddress.test.ts. Typed for each order; the form starts with the address of the
// buyer's most recent order (bug 6), and it can still be edited.

export type ShippingAddress = { name: string; street: string; postcode: string; city: string };

export const POSTCODE_FORMAT = "Use the format 0000-000";

const POSTCODE = /^[0-9]{4}-[0-9]{3}$/; // same check as the orders table

// Input mask while typing (bug 7): keeps the digits only (at most 7) and puts the hyphen in after the
// fourth one, as soon as a fifth digit comes. Not before, so deleting back past the hyphen works.
// It only shapes what is typed; postcodeError and canPay stay the check.
export function maskPostcode(typed: string): string {
  const digits = typed.replace(/\D/g, "").slice(0, 7);
  return digits.length > 4 ? `${digits.slice(0, 4)}-${digits.slice(4)}` : digits;
}

// Message under the postcode field: only once something is typed and it is not 0000-000.
export function postcodeError(postcode: string): string | null {
  const typed = postcode.trim();
  return typed === "" || POSTCODE.test(typed) ? null : POSTCODE_FORMAT;
}

// Pay is enabled only when all four fields are filled in and the postcode is 0000-000.
export function canPay(address: ShippingAddress): boolean {
  const { name, street, postcode, city } = address;
  return [name, street, city].every((field) => field.trim() !== "") && POSTCODE.test(postcode.trim());
}

// The address the checkout form starts with (bug 9, then bug 6): the delivery address saved on "Your account",
// otherwise the address of the buyer's most recent order, otherwise only the name given at sign-up (bug 27: the name
// is not asked twice), otherwise empty (null). It can still be edited.
export function startingAddress(
  saved: ShippingAddress | null,
  lastOrder: ShippingAddress | null,
  accountName: string | null = null,
): ShippingAddress | null {
  if (saved ?? lastOrder) return saved ?? lastOrder;
  const name = accountName?.trim() ?? "";
  return name ? { name, street: "", postcode: "", city: "" } : null;
}
