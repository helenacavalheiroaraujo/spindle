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

// The fair price bar next to the recommendation on desktop (design option A): where the lowest price on sale sits
// against the typical range. Covered by tests/unit/fairPrice.test.ts. All figures are percentages of the bar's width.
// The bar runs from half a range below the minimum to half a range above the maximum, so a price outside the range
// still shows. Null when the version has no range: no bar, never a guess.
export type PriceBar = { bandLeft: number; bandRight: number; marker: number };

export function priceBar(price: number, range: TypicalRange): PriceBar | null {
  if (range.min === null || range.max === null) return null;
  const pad = Math.max((range.max - range.min) / 2, 1);
  const start = range.min - pad;
  const total = range.max - range.min + 2 * pad;
  const pct = (value: number) => Math.round(((value - start) / total) * 1000) / 10;
  return { bandLeft: pct(range.min), bandRight: pct(range.max), marker: Math.min(100, Math.max(0, pct(price))) };
}
