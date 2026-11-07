// Decision tables from SPEC story 5 · Listing check screen (summary, moved here, missing photo).
import { describe, expect, it } from "vitest";
import { checklist, checkSummary } from "@/lib/rules/listingCheck";
import { trafficLight, type CheckResult } from "@/lib/rules/trafficLight";

const M: CheckResult = "match", U: CheckResult = "uncertain", X: CheckResult = "no_match";

describe("checklist", () => {
  it.each([
    // cover/label, country/year, matrix, matrix photo, moved here → marks shown
    [M, M, M, true, false, ["match", "match", "match"]], // seed: 2012 Remaster €32
    [M, M, U, true, false, ["match", "match", "uncertain"]], // seed: 2012 Remaster €36
    [M, M, U, false, false, ["match", "match", "uncertain"]], // seed: 1990 Reissue €30
    [M, M, M, false, false, ["match", "match", "uncertain"]], // missing photo wins over a stored ✓
    [M, X, X, true, false, ["match", "no_match", "no_match"]], // seed: red under its claimed version
    [M, X, X, true, true, ["pending", "pending", "pending"]], // seed: same listing, moved to the 1990 Reissue
  ] as const)("%s / %s / %s, photo %s, moved %s", (cover_label, country_year, matrix, photo, moved, marks) => {
    expect(checklist({ cover_label, country_year, matrix }, photo, moved).map((r) => r.mark)).toEqual(marks);
  });

  it("names the items in SPEC order and says when the matrix photo is missing", () => {
    const rows = checklist({ cover_label: M, country_year: M, matrix: M }, false, false);
    expect(rows.map((r) => r.label)).toEqual([
      "Cover and label match the version",
      "Country and year match",
      "Matrix photo matches",
    ]);
    expect(rows[2].note).toBe("No matrix photo");
  });
});

describe("checkSummary", () => {
  it.each([
    // cover/label, country/year, matrix, matrix photo, moved here, moved to → summary
    [M, M, M, true, false, null, "All three checks match this version"],
    [M, M, U, true, false, null, "One check is uncertain"],
    [M, M, M, false, false, null, "One check is uncertain"], // no matrix photo
    [U, M, U, true, false, null, "Two checks are uncertain"],
    [U, U, U, false, false, null, "Three checks are uncertain"],
    [M, X, X, true, true, null, "Moved here · check pending"],
    [M, X, X, true, false, "1990 Reissue", "It's a different pressing · moved to 1990 Reissue"],
    [X, M, M, true, false, null, "It's a different pressing"], // red but not moved
  ] as const)("%s / %s / %s, photo %s, moved here %s, moved to %s", (cover_label, country_year, matrix, photo, movedHere, movedTo, summary) => {
    const checks = { cover_label, country_year, matrix };
    const light = movedHere ? "yellow" : trafficLight(checks, photo);
    expect(checkSummary(light, checklist(checks, photo, movedHere), movedHere, movedTo)).toBe(summary);
  });
});
