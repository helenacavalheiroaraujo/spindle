// Decision tables from SPEC story 26 · Acceptance criteria (change the saved buying order on the account page).
import { describe, expect, it } from "vitest";
import { addPriority, missingPriorities, movePriority, rowArrows, type Priority } from "@/lib/rules/priorities";

const three: Priority[] = ["price", "original", "sound"];

describe("movePriority: a row moves one place", () => {
  it.each([
    ["Sound up from 3rd → 2nd", three, "sound", "up", ["price", "sound", "original"]],
    ["Price down from 1st → 2nd", three, "price", "down", ["original", "price", "sound"]],
    ["Original up from 2nd → 1st", three, "original", "up", ["original", "price", "sound"]],
    ["top row up → unchanged", three, "price", "up", three],
    ["bottom row down → unchanged", three, "sound", "down", three],
    ["option not in the order → unchanged", three, "condition", "up", three],
    ["single row → unchanged", ["price"], "price", "down", ["price"]],
  ] as const)("%s", (_case, ranking, priority, direction, expected) => {
    expect(movePriority([...ranking], priority, direction)).toEqual(expected);
  });
});

describe("rowArrows: no up arrow on top, no down arrow at the bottom", () => {
  it.each([
    ["top row", three, "price", { up: false, down: true }],
    ["middle row", three, "original", { up: true, down: true }],
    ["bottom row", three, "sound", { up: true, down: false }],
    ["only row", ["price"], "price", { up: false, down: false }],
    ["not in the order", three, "condition", { up: false, down: false }],
  ] as const)("%s", (_case, ranking, priority, expected) => {
    expect(rowArrows([...ranking], priority)).toEqual(expected);
  });
});

describe("missingPriorities: one Add line per option not in the order", () => {
  it.each([
    ["three saved → Condition", three, ["condition"]],
    ["all four saved → none", ["price", "original", "sound", "condition"], []],
    ["one saved → the other three, in screen order", ["original"], ["sound", "price", "condition"]],
  ] as const)("%s", (_case, ranking, expected) => {
    expect(missingPriorities([...ranking]).map((p) => p.id)).toEqual(expected);
  });
});

describe("addPriority: added at the end of the order", () => {
  it.each([
    ["Condition after three", three, "condition", ["price", "original", "sound", "condition"]],
    ["already in the order → unchanged", three, "sound", three],
  ] as const)("%s", (_case, ranking, priority, expected) => {
    expect(addPriority([...ranking], priority)).toEqual(expected);
  });
});
