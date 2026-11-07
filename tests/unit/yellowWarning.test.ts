// Decision table from SPEC story 5 · Yellow ("a warning before buying that says what is uncertain").
import { describe, expect, it } from "vitest";
import { MONEY_BACK, yellowWarning } from "@/lib/rules/yellowWarning";
import type { CheckResult } from "@/lib/rules/trafficLight";

const M: CheckResult = "match", U: CheckResult = "uncertain", X: CheckResult = "no_match";
const NO_PHOTO = "There's no matrix photo.";
const NOT_SHARP = "The matrix photo isn't sharp.";
const COVER = "The cover and label photos don't clearly show this pressing.";
const COUNTRY = "The country and year can't be confirmed from the photos.";
const MOVED = "This copy was listed as another pressing and hasn't been checked against this one yet.";

describe("yellowWarning", () => {
  it.each([
    // cover/label, country/year, matrix, matrix photo, moved here, sentences before the money-back line
    [M, M, U, true, false, [NOT_SHARP]], // seed: 2012 Remaster €36
    [M, M, U, false, false, [NO_PHOTO]], // seed: 1990 Reissue €30
    [M, M, M, false, false, [NO_PHOTO]], // missing photo wins over a stored ✓
    [U, M, M, true, false, [COVER]],
    [M, U, M, true, false, [COUNTRY]],
    [U, U, U, false, false, [COVER, COUNTRY, NO_PHOTO]],
    [M, X, X, true, true, [MOVED]], // seed: red listing moved to the 1990 Reissue
  ] as const)("%s / %s / %s, photo %s, moved %s", (cover_label, country_year, matrix, photo, moved, sentences) => {
    expect(yellowWarning({ cover_label, country_year, matrix }, photo, moved)).toEqual([...sentences, MONEY_BACK]);
  });
});
