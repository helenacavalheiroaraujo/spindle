// Decision tables from bug 8 (design option A): who can message the seller, and what can be sent.
import { describe, expect, it } from "vitest";
import { EMPTY_MESSAGE, MAX_MESSAGE_LENGTH, MESSAGE_TOO_LONG, canMessageSeller, checkMessage } from "@/lib/rules/orderMessage";

describe("canMessageSeller", () => {
  it.each([
    ["paid_waiting_seller", false, true], // Paid, nothing sent yet
    ["paid_waiting_seller", true, false], // only one message
    ["seller_paid", false, false], // delivered: the button is gone
    ["seller_paid", true, false],
  ] as const)("%s, already sent %s → %s", (status, sent, expected) => {
    expect(canMessageSeller(status, sent)).toBe(expected);
  });
});

describe("checkMessage", () => {
  it.each([
    ["Hi, could you send it with tracking?", { text: "Hi, could you send it with tracking?" }],
    ["  spaces around  ", { text: "spaces around" }], // trimmed
    ["", { error: EMPTY_MESSAGE }],
    ["   \n  ", { error: EMPTY_MESSAGE }], // only spaces count as empty
    ["a".repeat(MAX_MESSAGE_LENGTH), { text: "a".repeat(MAX_MESSAGE_LENGTH) }], // exactly 500
    ["a".repeat(MAX_MESSAGE_LENGTH + 1), { error: MESSAGE_TOO_LONG }],
    [` ${"a".repeat(MAX_MESSAGE_LENGTH)} `, { text: "a".repeat(MAX_MESSAGE_LENGTH) }], // spaces do not count
  ])("%s", (typed, expected) => {
    expect(checkMessage(typed)).toEqual(expected);
  });
});
