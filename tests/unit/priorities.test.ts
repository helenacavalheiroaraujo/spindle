// Decision table from SPEC story 2 · Use cases, Acceptance criteria and Edge cases.
import { describe, expect, it } from "vitest";
import {
  canContinue, formatPriorities, parsePriorities, rankOf, togglePriority, type Priority,
} from "@/lib/rules/priorities";

const tapAll = (taps: Priority[]) => taps.reduce<Priority[]>(togglePriority, []);

describe("togglePriority (tap order = rank)", () => {
  it.each([
    ["first tap is rank 1", ["price"], ["price"]],
    ["second tap is rank 2", ["price", "sound"], ["price", "sound"]],
    ["all four can be picked", ["condition", "sound", "original", "price"], ["condition", "sound", "original", "price"]],
    ["unpick rank 2 of 3 → the others close the gap", ["sound", "price", "original", "price"], ["sound", "original"]],
    ["unpick rank 1 → rank 2 becomes 1", ["sound", "price", "sound"], ["price"]],
    ["unpick and pick again → goes last", ["sound", "price", "sound", "sound"], ["price", "sound"]],
    ["unpick everything → empty", ["sound", "price", "sound", "price"], []],
  ] as const)("%s", (_case, taps, expected) => {
    expect(tapAll([...taps])).toEqual(expected);
  });
});

describe("rankOf", () => {
  const ranking: Priority[] = ["price", "sound", "condition"];
  it.each([
    ["price", 1],
    ["sound", 2],
    ["condition", 3],
    ["original", null],
  ] as const)("%s → %s", (priority, expected) => {
    expect(rankOf(ranking, priority)).toBe(expected);
  });
});

describe("canContinue ('See recommendation' enabled)", () => {
  it.each([
    ["nothing picked", [], false],
    ["one picked", ["price"], true],
    ["four picked", ["sound", "price", "original", "condition"], true],
  ] as const)("%s → %s", (_case, ranking, expected) => {
    expect(canContinue([...ranking])).toBe(expected);
  });
});

describe("parsePriorities / formatPriorities (ranking in the page address)", () => {
  it.each([
    ["missing", undefined, []],
    ["empty", "", []],
    ["keeps rank order", "price,sound", ["price", "sound"]],
    ["ignores unknown values", "price,colour,sound", ["price", "sound"]],
    ["ignores repeats", "sound,sound,price", ["sound", "price"]],
    ["ignores case and spaces", " Price , SOUND", ["price", "sound"]],
  ] as const)("%s → %j", (_case, value, expected) => {
    expect(parsePriorities(value)).toEqual(expected);
  });

  it("round-trips a ranking", () => {
    const ranking: Priority[] = ["condition", "original", "price", "sound"];
    expect(formatPriorities(ranking)).toBe("condition,original,price,sound");
    expect(parsePriorities(formatPriorities(ranking))).toEqual(ranking);
  });
});
