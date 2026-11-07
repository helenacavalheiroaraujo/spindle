// Decision table from SPEC story 9 · "The header shows the user's initials when signed in".
import { describe, expect, it } from "vitest";
import { initials } from "@/lib/rules/initials";

describe("initials", () => {
  it.each([
    ["Ana Silva", "AS"],
    ["Helena Cavalheiro Araújo", "HA"], // first and last word
    ["madonna", "M"], // one word → one letter
    ["  Rui   Costa  ", "RC"], // extra spaces ignored
    ["Élio Ávila", "ÉÁ"], // accents kept
    ["", ""],
  ])("%s → %s", (name, expected) => {
    expect(initials(name)).toBe(expected);
  });
});
