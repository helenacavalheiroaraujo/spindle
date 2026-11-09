// Listing check screen (story 5 · "Is it really this one?"): covered by tests/unit/listingCheck.test.ts.
import type { CheckItem, CheckResult, Light } from "./trafficLight";

export type CheckMark = CheckResult | "pending";

// Each row is worded by its result (UX #9, DECISIONS 2026-11-09), so a row never reads as a contradiction.
export type ChecklistRow = { item: CheckItem; label: string; mark: CheckMark };

const WORDS: Record<CheckItem, Record<CheckMark, string>> = {
  cover_label: {
    match: "Cover and label match the version",
    uncertain: "Cover and label: can't be sure",
    no_match: "Cover and label don't match the version",
    pending: "Cover and label: check pending",
  },
  country_year: {
    match: "Country and year match",
    uncertain: "Country and year: can't be sure",
    no_match: "Country and year don't match",
    pending: "Country and year: check pending",
  },
  matrix: {
    match: "Matrix photo matches",
    uncertain: "Matrix photo: can't be sure",
    no_match: "Matrix photo doesn't match",
    pending: "Matrix photo: check pending",
  },
};
const ITEMS: CheckItem[] = ["cover_label", "country_year", "matrix"];

// The three items in SPEC order. A missing matrix photo is "uncertain" (SPEC · Edge cases) and says so.
// A listing moved here was checked against another version, so every item is pending (DECISIONS.md).
export function checklist(
  checks: Record<CheckItem, CheckResult>,
  hasMatrixPhoto: boolean,
  movedHere: boolean,
): ChecklistRow[] {
  return ITEMS.map((item) => {
    if (movedHere) return { item, label: WORDS[item].pending, mark: "pending" };
    if (item === "matrix" && !hasMatrixPhoto) return { item, label: "Matrix photo: no photo to check", mark: "uncertain" };
    return { item, label: WORDS[item][checks[item]], mark: checks[item] };
  });
}

const COUNT = ["", "One check is", "Two checks are", "Three checks are"];

// One-line summary beside the traffic light (SPEC story 5 · Listing check screen · Summary).
export function checkSummary(
  light: Light,
  rows: ChecklistRow[],
  movedHere: boolean,
  movedToVersionName: string | null,
): string {
  if (light === "green") return "All three checks match this version";
  if (light === "red") return movedToVersionName ? `It's a different pressing · moved to ${movedToVersionName}` : "It's a different pressing";
  if (movedHere) return "Moved here · check pending";
  const unsure = rows.filter((r) => r.mark === "uncertain").length;
  return `${COUNT[unsure]} uncertain`;
}
