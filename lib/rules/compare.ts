// Compare pressings (story 4): which versions, which rows, and the words shown. Covered by tests/unit/compare.test.ts.
// Scores, totals and the recommended version come from recommendation.ts: this file only orders and words them.
import { CONDITIONS } from "./sellForm";
import type { Priority } from "./priorities";
import { formatPrice, recommend, scoresOf, totalOf, type ConditionCode, type VersionFacts } from "./recommendation";

export type CompareRowId = "price" | "sound" | "firstPressing" | "condition" | "forSale";

// The row each priority highlights. "Original" is the buyer's "I want the first pressing" (story 2).
const ROW_OF: Record<Priority, CompareRowId> = {
  price: "price",
  sound: "sound",
  original: "firstPressing",
  condition: "condition",
};

// Order of the rows the buyer did not choose. "For sale" is never a priority, so it is always last.
const FIXED_ORDER: CompareRowId[] = ["price", "sound", "firstPressing", "condition", "forSale"];

export type CompareRow = { id: CompareRowId; rank: number | null };

// The buyer's chosen priorities first, in rank order (with their rank number); the other rows after, in fixed order.
export function compareRows(ranking: Priority[]): CompareRow[] {
  const chosen: CompareRow[] = ranking.map((p, i) => ({ id: ROW_OF[p], rank: i + 1 }));
  const others: CompareRow[] = FIXED_ORDER.filter((id) => !chosen.some((c) => c.id === id)).map((id) => ({ id, rank: null }));
  return [...chosen, ...others];
}

// Version ids to compare: the recommended version first, then the others by total score (ties: the cheaper,
// then the order given). Only versions with active listings. Empty when fewer than 2 can be compared.
// maxColumns: 2 on a phone, 3 on desktop.
export function compareColumns(ranking: Priority[], versions: VersionFacts[], maxColumns: 2 | 3): string[] {
  const recommendation = recommend(ranking, versions);
  if (!recommendation) return [];
  const onSale = versions.filter((v) => v.activePrices.length > 0);
  if (onSale.length < 2) return [];

  const lowest = (v: VersionFacts) => Math.min(...v.activePrices);
  const cheapest = Math.min(...onSale.map(lowest));
  const rest = onSale
    .filter((v) => v.id !== recommendation.recommendedId)
    .map((v) => ({ id: v.id, total: totalOf(scoresOf(v, cheapest), ranking), price: lowest(v) }))
    .sort((a, b) => b.total - a.total || a.price - b.price);
  return [recommendation.recommendedId, ...rest.map((r) => r.id)].slice(0, maxColumns);
}

// Which of the buyer's chosen priorities this version matches (score 4 or 5, same threshold as story 3) and which
// it does not, both in rank order. Scores use the album's cheapest price, like the recommendation.
export function fitOf(
  ranking: Priority[],
  version: VersionFacts,
  versions: VersionFacts[],
): { matches: Priority[]; misses: Priority[] } {
  const prices = versions.filter((v) => v.activePrices.length > 0).map((v) => Math.min(...v.activePrices));
  const scores = scoresOf(version, prices.length ? Math.min(...prices) : null);
  return {
    matches: ranking.filter((p) => scores[p] >= 4),
    misses: ranking.filter((p) => scores[p] < 4),
  };
}

// The 1–5 sound score as a short word. The number itself is never shown (story 4 · Scope).
const SOUND_WORDS: Record<number, string> = { 5: "Very clean", 4: "Clean", 3: "Balanced", 2: "A bit flat", 1: "Flat" };
export function soundWord(score: number): string {
  return SOUND_WORDS[score];
}

// "€28–€36" from the stored typical range (story 6); null when the version has none.
export function typicalRangeText(min: number | null, max: number | null): string | null {
  return min === null || max === null ? null : `${formatPrice(min)}–${formatPrice(max)}`;
}

// The album's oldest version, whether or not it has listings (same meaning as in story 3 · finding #52).
export function firstPressingId(versions: { id: string; releaseYear: number }[]): string | null {
  if (versions.length === 0) return null;
  return [...versions].sort((a, b) => a.releaseYear - b.releaseYear)[0].id;
}

// Name of the best condition among the active listings ("Near mint"), or null when there are none.
export function conditionName(conditions: ConditionCode[]): string | null {
  const best = CONDITIONS.find((c) => conditions.includes(c.code));
  return best ? best.name : null;
}
