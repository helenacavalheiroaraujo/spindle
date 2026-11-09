// Sell form rules (story 8 · Acceptance criteria, findings #73, #79): covered by tests/unit/sellForm.test.ts.
// Used by the sell form, the server action that publishes, and the price edit in My listings.

export const PRICE_FORMAT_MESSAGE = "Enter a price above €0, with up to 2 decimals";
export const PRICE_MAX_MESSAGE = "The maximum price is €1000";
export const MAX_PRICE = 1000;

export type PriceCheck = { ok: true; price: number } | { ok: false; message: string | null };

// The typed price → a number, or the message to show. Empty → not valid, but no message yet.
// A comma is read as the decimal point ("12,50" = €12.50), as people type prices in Portugal.
export function checkPrice(typed: string): PriceCheck {
  const text = typed.trim().replace(/^€\s*/, "");
  if (text === "") return { ok: false, message: null };
  if (!/^\d+([.,]\d{1,2})?$/.test(text)) return { ok: false, message: PRICE_FORMAT_MESSAGE };
  const price = Number(text.replace(",", "."));
  if (price <= 0) return { ok: false, message: PRICE_FORMAT_MESSAGE };
  if (price > MAX_PRICE) return { ok: false, message: PRICE_MAX_MESSAGE };
  return { ok: true, price };
}

// Condition grades in the buyer's language, with the collector code (story 8 · Data used).
export const CONDITIONS = [
  { code: "NM", name: "Near mint", short: "No marks" },
  { code: "VG+", name: "Very good", short: "Light marks" },
  { code: "VG", name: "Good", short: "Audible noise" },
  { code: "G", name: "Fair", short: "Heavily played" },
] as const;
export type ConditionCode = (typeof CONDITIONS)[number]["code"];
export const isCondition = (code: string): code is ConditionCode => CONDITIONS.some((c) => c.code === code);

// Photo size limit (story 8 · Non-functional), checked on the file the seller picked.
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const PHOTO_TOO_BIG_MESSAGE = "This photo is larger than 5 MB. Choose a smaller one.";
export const photoTooBig = (bytes: number) => bytes > MAX_PHOTO_BYTES;

export type SellFormInput = {
  condition: string | null;
  price: string;
  hasCover: boolean;
  hasRecord: boolean;
  needsCity: boolean; // first time selling (finding #73)
  city: string;
};

// "List for sale" is enabled only when condition, price, cover and record photo are filled in and,
// the first time, the city. The matrix photo and the shop name are optional.
export function canList(f: SellFormInput): boolean {
  return (
    f.condition !== null &&
    isCondition(f.condition) &&
    checkPrice(f.price).ok &&
    f.hasCover &&
    f.hasRecord &&
    (!f.needsCity || f.city.trim() !== "")
  );
}

// The hint under the disabled button (finding #27): everything still needed, in the order of the form
// (the city comes first, only the first time).
export function listHint(f: SellFormInput): string | null {
  const missing = [
    f.needsCity && f.city.trim() === "" ? "city" : null,
    f.condition !== null && isCondition(f.condition) ? null : "condition",
    f.hasCover ? null : "front cover photo",
    f.hasRecord ? null : "record photo",
    checkPrice(f.price).ok ? null : "price",
  ].filter((item): item is string => item !== null);
  return missing.length ? `Still needed: ${missing.join(", ")}` : null;
}
