// Listing check screen (story 5 · "Is it really this one?"): covered by tests/unit/listingCheck.test.ts.
import type { CheckItem, CheckResult, Light } from "./trafficLight";

export type CheckMark = CheckResult | "pending";

export type ChecklistRow = { item: CheckItem; label: string; mark: CheckMark; note: string | null };

const ITEMS: { item: CheckItem; label: string }[] = [
  { item: "cover_label", label: "Cover and label match the version" },
  { item: "country_year", label: "Country and year match" },
  { item: "matrix", label: "Matrix photo matches" },
];

// The three items in SPEC order. A missing matrix photo is "uncertain" (SPEC · Edge cases).
// A listing moved here was checked against another version, so every item is pending (DECISIONS.md).
export function checklist(
  checks: Record<CheckItem, CheckResult>,
  hasMatrixPhoto: boolean,
  movedHere: boolean,
): ChecklistRow[] {
  return ITEMS.map(({ item, label }) => {
    if (movedHere) return { item, label, mark: "pending", note: "Check pending" };
    if (item === "matrix" && !hasMatrixPhoto) return { item, label, mark: "uncertain", note: "No matrix photo" };
    return { item, label, mark: checks[item], note: null };
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
