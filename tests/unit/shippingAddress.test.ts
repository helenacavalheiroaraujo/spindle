// Decision table from story 7 · Acceptance criteria: Pay is disabled until name, street, postcode
// and city are filled in and the postcode has the format 0000-000.
import { describe, expect, it } from "vitest";
import { canPay, maskPostcode, postcodeError, POSTCODE_FORMAT } from "@/lib/rules/shippingAddress";

const FULL = { name: "Ana Silva", street: "Rua das Flores 12", postcode: "4050-262", city: "Porto" };

describe("canPay", () => {
  it.each([
    // change to a full address, can pay
    [{}, true], // all four filled, postcode 0000-000
    [{ name: "" }, false], // name missing
    [{ street: "" }, false], // street missing
    [{ city: "" }, false], // city missing
    [{ postcode: "" }, false], // postcode missing
    [{ name: "   " }, false], // only spaces count as empty
    [{ postcode: "4050262" }, false], // no hyphen
    [{ postcode: "4050-26" }, false], // too short
    [{ postcode: "405-0262" }, false], // hyphen in the wrong place
    [{ postcode: "ABCD-EFG" }, false], // letters
    [{ postcode: " 4050-262 " }, true], // spaces around are ignored
  ] as const)("%o → %s", (change, expected) => {
    expect(canPay({ ...FULL, ...change })).toBe(expected);
  });
});

describe("postcodeError", () => {
  it.each([
    ["", null], // nothing typed yet: no message
    ["4050-262", null], // right format
    ["4050262", POSTCODE_FORMAT], // story 7: another format → "Use the format 0000-000"
    ["40", POSTCODE_FORMAT], // still typing: the message shows as soon as the format is wrong
  ] as const)("%j → %s", (postcode, message) => {
    expect(postcodeError(postcode)).toBe(message);
  });
});

describe("maskPostcode (bug 7)", () => {
  it.each([
    ["", ""], // nothing typed
    ["4", "4"], // digits as typed
    ["4050", "4050"], // no hyphen yet, so backspace is not blocked
    ["40502", "4050-2"], // hyphen appears with the fifth digit
    ["4050262", "4050-262"], // complete
    ["4050-262", "4050-262"], // already masked stays the same
    ["4050-", "4050"], // hyphen deleted by hand together with nothing after it
    ["40502623", "4050-262"], // more than seven digits are dropped
    ["4a05b0", "4050"], // letters are ignored
    [" 4050 262 ", "4050-262"], // spaces are ignored (pasted text)
  ] as const)("%j → %j", (typed, masked) => {
    expect(maskPostcode(typed)).toBe(masked);
  });
});
