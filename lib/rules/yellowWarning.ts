// Warning shown before buying a yellow listing (story 5 · Yellow): covered by tests/unit/yellowWarning.test.ts.
import type { CheckItem, CheckResult } from "./trafficLight";

export const MONEY_BACK = "If it turns out to be another pressing, you get your money back.";

// What is uncertain, one sentence per item, then the money-back promise.
// A listing moved here was checked against another version, so that is what is uncertain.
export function yellowWarning(checks: Record<CheckItem, CheckResult>, hasMatrixPhoto: boolean, movedHere: boolean): string[] {
  if (movedHere) return ["This copy was listed as another pressing and hasn't been checked against this one yet.", MONEY_BACK];
  const unsure: string[] = [];
  if (checks.cover_label === "uncertain") unsure.push("The cover and label photos don't clearly show this pressing.");
  if (checks.country_year === "uncertain") unsure.push("The country and year can't be confirmed from the photos.");
  if (!hasMatrixPhoto) unsure.push("There's no matrix photo.");
  else if (checks.matrix === "uncertain") unsure.push("The matrix photo isn't sharp.");
  return [...unsure, MONEY_BACK];
}
