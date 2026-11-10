// Decision table from SPEC story 23 · Acceptance criteria (account page shows the saved buying priorities).
import { describe, expect, it } from "vitest";
import { accountPriorityLines } from "@/lib/rules/priorities";

describe("accountPriorityLines", () => {
  it.each([
    ["no saved ranking → nothing shown", null, []],
    ["empty ranking → nothing shown", [], []],
    [
      "one saved priority → numbered 1",
      ["price"],
      [{ rank: 1, label: "Price" }],
    ],
    [
      "saved order is kept and numbered from 1",
      ["condition", "sound", "original", "price"],
      [
        { rank: 1, label: "Condition" },
        { rank: 2, label: "Sound" },
        { rank: 3, label: "Original" },
        { rank: 4, label: "Price" },
      ],
    ],
  ] as const)("%s", (_case, ranking, expected) => {
    expect(accountPriorityLines(ranking as never)).toEqual(expected);
  });
});
