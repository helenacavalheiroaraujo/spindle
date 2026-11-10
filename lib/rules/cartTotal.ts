// The cart total (story 20 · Acceptance criteria): covered by tests/unit/cartTotal.test.ts.
// The one place it is calculated: for each record, price + insured shipping + buyer protection (checkoutTotal),
// added up. Amounts in euros, 2 decimals, summed in cents so €58.00 + €9.80 + €4.00 is exactly €71.80.
import { BUYER_PROTECTION, INSURED_SHIPPING, checkoutTotal, type CheckoutTotal } from "./checkoutTotal";

export type CartTotal = {
  count: number; // records in the cart
  lines: CheckoutTotal[]; // what each record really costs, in the order of the prices given
  records: number; // sum of the record prices
  shipping: number; // count × €4.90
  protectionFee: number; // count × €2.00
  total: number;
};

export function cartTotal(prices: number[]): CartTotal {
  const cents = (euros: number) => Math.round(euros * 100);
  const lines = prices.map(checkoutTotal);
  const sum = (amounts: number[]) => amounts.reduce((all, amount) => all + cents(amount), 0) / 100;
  return {
    count: prices.length,
    lines,
    records: sum(prices),
    shipping: sum(lines.map((l) => l.shipping)),
    protectionFee: sum(lines.map((l) => l.protectionFee)),
    total: sum(lines.map((l) => l.total)),
  };
}

// "2 records", "1 record": the cart's count in words (the header icon's label, the summary).
export function recordCount(count: number): string {
  return `${count} ${count === 1 ? "record" : "records"}`;
}

// Summary rows of the cart and of its checkout: "Insured shipping · 2 × €4.90", "Buyer protection · 2 × €2.00".
export function perRecordLabel(label: string, count: number, each: number): string {
  return `${label} · ${count} × €${each.toFixed(2)}`;
}
export const SHIPPING_EACH = INSURED_SHIPPING;
export const PROTECTION_EACH = BUYER_PROTECTION;

// The rows above the total, on the cart screen and in the checkout: records, shipping and protection for each record.
export function cartSummaryRows(amounts: CartTotal): [label: string, amount: number][] {
  return [
    ["Records", amounts.records],
    [perRecordLabel("Insured shipping", amounts.count, SHIPPING_EACH), amounts.shipping],
    [perRecordLabel("Buyer protection", amounts.count, PROTECTION_EACH), amounts.protectionFee],
  ];
}
