// Shipping address on the checkout (story 7 · What the checkout shows, Acceptance criteria):
// covered by tests/unit/shippingAddress.test.ts. Typed for each order, never saved to the account.

export type ShippingAddress = { name: string; street: string; postcode: string; city: string };

export const POSTCODE_FORMAT = "Use the format 0000-000";

const POSTCODE = /^[0-9]{4}-[0-9]{3}$/; // same check as the orders table

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
