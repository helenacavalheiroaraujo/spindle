// Recommendation (story 3): one place, covered by tests/unit/recommendation.test.ts.
// Scores, weights, tie, alternative and ideal version follow SPEC story 3 · How the pick is made.
import type { Priority } from "./priorities";

export type ConditionCode = "NM" | "VG+" | "VG" | "G";

// Near mint = 5, Very good = 4, Good = 3, Fair = 2 (codes from the condition_grades table).
const CONDITION_SCORE: Record<ConditionCode, number> = { NM: 5, "VG+": 4, VG: 3, G: 2 };

// Weight of each rank position: 1st = 3, 2nd = 2, 3rd = 1, 4th = 0.5 (starting values).
export const WEIGHTS = [3, 2, 1, 0.5];

export const ALTERNATIVE_LABEL: Record<Priority, string> = {
  price: "Cheapest option",
  sound: "Best sound",
  original: "Closest to the original",
  condition: "Best condition",
};

// Facts about one version. The listing facts come from its ACTIVE listings only (Shared rules).
export type VersionFacts = {
  id: string;
  soundScore: number;
  originalScore: number;
  activePrices: number[];
  activeConditions: ConditionCode[];
};

export type Scores = Record<Priority, number>;

export type Recommendation = {
  recommendedId: string;
  scores: Scores; // of the recommended version
  matches: Priority[]; // chosen priorities scoring 4 or 5, in rank order
  reasons: Priority[]; // one sentence per chosen priority, rank order, max 3
  alternative: { versionId: string; label: string } | null;
  idealUnavailableId: string | null;
};

const lowest = (v: VersionFacts) => (v.activePrices.length ? Math.min(...v.activePrices) : null);

// Price: 5 × (cheapest lowest price of the album ÷ this version's lowest price), rounded, min 1.
// Condition: the best condition among the active listings.
// A version with no active listings scores 0 on both (finding #28).
export function scoresOf(version: VersionFacts, cheapestOfAlbum: number | null): Scores {
  const own = lowest(version);
  return {
    sound: version.soundScore,
    original: version.originalScore,
    price: own === null || cheapestOfAlbum === null ? 0 : Math.max(1, Math.round((5 * cheapestOfAlbum) / own)),
    condition: version.activeConditions.length ? Math.max(...version.activeConditions.map((c) => CONDITION_SCORE[c])) : 0,
  };
}

export function totalOf(scores: Scores, ranking: Priority[]): number {
  return ranking.reduce((sum, p, i) => sum + scores[p] * (WEIGHTS[i] ?? 0), 0);
}

// Highest value wins; on a tie, the cheaper version; then the order given.
function best<T extends { version: VersionFacts }>(items: T[], value: (item: T) => number): T {
  return items.reduce((a, b) => {
    const va = value(a), vb = value(b);
    if (vb !== va) return vb > va ? b : a;
    return (lowest(b.version) ?? Infinity) < (lowest(a.version) ?? Infinity) ? b : a;
  });
}

// Returns null when no version has active listings (story 1 stops the buyer before this screen)
// or when no priority was chosen.
export function recommend(ranking: Priority[], versions: VersionFacts[]): Recommendation | null {
  if (ranking.length === 0) return null;
  const onSale = versions.filter((v) => lowest(v) !== null);
  if (onSale.length === 0) return null;

  const cheapest = Math.min(...onSale.map((v) => lowest(v)!));
  const scored = versions.map((version) => {
    const scores = scoresOf(version, cheapest);
    return { version, scores, total: totalOf(scores, ranking) };
  });
  const scoredOnSale = scored.filter((s) => lowest(s.version) !== null);

  const pick = best(scoredOnSale, (s) => s.total);
  const first = ranking[0];
  const firstBest = best(scoredOnSale, (s) => s.scores[first]);

  // Ideal but unavailable: a version with no listings that beats the recommendation.
  const unlisted = scored.filter((s) => lowest(s.version) === null);
  const ideal = unlisted.length ? best(unlisted, (s) => s.total) : null;

  return {
    recommendedId: pick.version.id,
    scores: pick.scores,
    matches: ranking.filter((p) => pick.scores[p] >= 4),
    reasons: ranking.slice(0, 3),
    alternative:
      firstBest.version.id === pick.version.id
        ? null
        : { versionId: firstBest.version.id, label: ALTERNATIVE_LABEL[first] },
    idealUnavailableId: ideal && ideal.total > pick.total ? ideal.version.id : null,
  };
}

// --- Reason sentences -------------------------------------------------------

export function formatPrice(value: number): string {
  return Number.isInteger(value) ? `€${value}` : `€${value.toFixed(2)}`;
}

export type PriceFacts = { lowestPrice: number | null; typicalMin: number | null; typicalMax: number | null };

// A price for a sentence: the lowest active price, or "typically €min–€max" for a version
// with no active listings (finding #32). Null when neither is known.
export function priceText(facts: PriceFacts): string | null {
  if (facts.lowestPrice !== null) return formatPrice(facts.lowestPrice);
  if (facts.typicalMin !== null && facts.typicalMax !== null) {
    return `typically ${formatPrice(facts.typicalMin)}–${formatPrice(facts.typicalMax)}`;
  }
  return null;
}

// Placeholders: {lowest_price} (this version) and {first_pressing_price} (the album's oldest version).
// Returns null if a placeholder has no price, so the screen leaves that sentence out.
export function fillReason(
  sentence: string,
  prices: { own: PriceFacts; firstPressing: PriceFacts | null },
): string | null {
  const values: Record<string, string | null> = {
    lowest_price: priceText(prices.own),
    first_pressing_price: prices.firstPressing ? priceText(prices.firstPressing) : null,
  };
  let missing = false;
  const filled = sentence.replace(/\{(\w+)\}/g, (_m, key: string) => {
    const v = values[key];
    if (v == null) missing = true;
    return v ?? "";
  });
  return missing ? null : filled;
}
