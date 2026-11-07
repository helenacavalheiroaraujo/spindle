// Traffic light rule (story 5): one place, covered by tests/unit/trafficLight.test.ts.
export type CheckResult = "match" | "uncertain" | "no_match";
export type CheckItem = "cover_label" | "country_year" | "matrix";
export type Light = "green" | "yellow" | "red";

export const LIGHT_WORD: Record<Light, string> = { green: "Match", yellow: "Check", red: "No match" };

export function trafficLight(checks: Record<CheckItem, CheckResult>, hasMatrixPhoto: boolean): Light {
  const results = Object.values(checks);
  if (results.includes("no_match")) return "red";
  // A missing matrix photo is "uncertain", so the listing is never green.
  if (!hasMatrixPhoto || results.includes("uncertain")) return "yellow";
  return "green";
}
