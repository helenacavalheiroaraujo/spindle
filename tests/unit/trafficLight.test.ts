// Decision table from SPEC story 5 · Traffic light rule.
import { describe, expect, it } from "vitest";
import { LIGHT_WORD, trafficLight, type CheckResult } from "@/lib/rules/trafficLight";

const M: CheckResult = "match", U: CheckResult = "uncertain", X: CheckResult = "no_match";

describe("trafficLight", () => {
  it.each([
    // cover/label, country/year, matrix, matrix photo, light
    [M, M, M, true, "green"],
    [M, M, U, true, "yellow"],
    [U, M, M, true, "yellow"],
    [M, M, M, false, "yellow"], // missing matrix photo → never green
    [X, M, M, true, "red"],
    [M, M, X, true, "red"],
    [X, U, M, false, "red"], // any ✗ wins
  ] as const)("%s / %s / %s, photo %s → %s", (cover_label, country_year, matrix, photo, light) => {
    expect(trafficLight({ cover_label, country_year, matrix }, photo)).toBe(light);
  });

  it("always has a word, never colour alone", () => {
    expect(LIGHT_WORD).toEqual({ green: "Match", yellow: "Check", red: "No match" });
  });
});
