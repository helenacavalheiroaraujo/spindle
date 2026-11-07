// Price label (story 6 · Label rule): covered by tests/unit/fairPrice.test.ts.
// A red listing is compared with the range of its actual version; the caller passes that range.

export type PriceLabel = "Below typical" | "Typical" | "Above typical";
export type TypicalRange = { min: number | null; max: number | null };

// Null when the version has no range: no label, never a guess.
export function priceLabel(price: number, range: TypicalRange): PriceLabel | null {
  if (range.min === null || range.max === null) return null;
  if (price < range.min) return "Below typical";
  if (price > range.max) return "Above typical";
  return "Typical"; // limits included
}
