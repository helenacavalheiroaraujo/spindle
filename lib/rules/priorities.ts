// Priority ranking (story 2): the buyer ranks what matters by tap order.
// The ranking travels in the page address as "?priorities=price,sound" (DECISIONS.md).

export type Priority = "sound" | "price" | "original" | "condition";

export const PRIORITIES: { id: Priority; label: string; line: string }[] = [
  { id: "sound", label: "Sound", line: "I want the best-sounding one" },
  { id: "price", label: "Price", line: "I don't want to overpay" },
  { id: "original", label: "Original", line: "I want the first pressing" },
  { id: "condition", label: "Condition", line: "I want a near-mint copy" },
];

const IDS = PRIORITIES.map((p) => p.id);
const isPriority = (value: string): value is Priority => (IDS as string[]).includes(value);

// Tap an option: picked → removed (the others close the gap); not picked → added last.
export function togglePriority(ranking: Priority[], tapped: Priority): Priority[] {
  return ranking.includes(tapped) ? ranking.filter((p) => p !== tapped) : [...ranking, tapped];
}

// Rank number shown on an option (1 = first tap), or null if not picked.
export function rankOf(ranking: Priority[], priority: Priority): number | null {
  const i = ranking.indexOf(priority);
  return i === -1 ? null : i + 1;
}

// "See recommendation" needs at least one option.
export function canContinue(ranking: Priority[]): boolean {
  return ranking.length > 0;
}

// Read the ranking from the address; unknown or repeated values are ignored, order is kept.
export function parsePriorities(value: string | null | undefined): Priority[] {
  if (!value) return [];
  const ranking: Priority[] = [];
  for (const part of value.split(",")) {
    const p = part.trim().toLowerCase();
    if (isPriority(p) && !ranking.includes(p)) ranking.push(p);
  }
  return ranking;
}

export function formatPriorities(ranking: Priority[]): string {
  return ranking.join(",");
}

// Account page (story 23): the saved ranking as numbered lines, in saved order.
// Nothing is listed when no ranking is saved, so the section is hidden.
export function accountPriorityLines(ranking: Priority[] | null): { rank: number; label: string }[] {
  if (!ranking || ranking.length === 0) return [];
  return ranking.map((id, i) => ({ rank: i + 1, label: PRIORITIES.find((p) => p.id === id)!.label }));
}

// "Change" on the account page (story 26, design option B): each row moves one place up or down.
// The top row cannot go up and the bottom row cannot go down; the order is returned unchanged then.
export function movePriority(ranking: Priority[], priority: Priority, direction: "up" | "down"): Priority[] {
  const i = ranking.indexOf(priority);
  const j = direction === "up" ? i - 1 : i + 1;
  if (i === -1 || j < 0 || j >= ranking.length) return ranking;
  const moved = [...ranking];
  [moved[i], moved[j]] = [moved[j], moved[i]];
  return moved;
}

// Which arrows a row shows: no up arrow on the top row, no down arrow on the bottom row (story 26).
export function rowArrows(ranking: Priority[], priority: Priority): { up: boolean; down: boolean } {
  const i = ranking.indexOf(priority);
  if (i === -1) return { up: false, down: false };
  return { up: i > 0, down: i < ranking.length - 1 };
}

// The options not yet in the order, each shown as its own "Add …" line (story 26 · DECISIONS 2026-11-13).
// Adding one puts it at the end of the order.
export function missingPriorities(ranking: Priority[]): { id: Priority; label: string }[] {
  return PRIORITIES.filter((p) => !ranking.includes(p.id)).map(({ id, label }) => ({ id, label }));
}

export function addPriority(ranking: Priority[], priority: Priority): Priority[] {
  return ranking.includes(priority) ? ranking : [...ranking, priority];
}
