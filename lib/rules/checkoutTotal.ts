// Price breakdown before paying (story 7 · What the checkout shows): covered by tests/unit/checkoutTotal.test.ts.
// The one place the total is calculated (story 7 · Non-functional). Amounts in euros, 2 decimals.

export const INSURED_SHIPPING = 4.9;
export const BUYER_PROTECTION = 2.0;

export type CheckoutTotal = { recordPrice: number; shipping: number; protectionFee: number; total: number };

// Summed in cents, so 28 + 4.90 + 2.00 is exactly 34.90 (the orders table checks the same sum).
export function checkoutTotal(recordPrice: number): CheckoutTotal {
  const cents = (euros: number) => Math.round(euros * 100);
  const total = (cents(recordPrice) + cents(INSURED_SHIPPING) + cents(BUYER_PROTECTION)) / 100;
  return { recordPrice, shipping: INSURED_SHIPPING, protectionFee: BUYER_PROTECTION, total };
}

// "€34.90": always two decimals, as on the Pay button and in the breakdown.
export function euros(amount: number): string {
  return `€${amount.toFixed(2)}`;
}
