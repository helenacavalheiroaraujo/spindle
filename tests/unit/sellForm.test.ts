// Decision tables from SPEC story 8 · Acceptance criteria, Edge cases and Non-functional; findings #73 and #79.
import { describe, expect, it } from "vitest";
import {
  PRICE_FORMAT_MESSAGE as FORMAT,
  PRICE_MAX_MESSAGE as MAX,
  canList,
  checkPrice,
  listHint,
  photoTooBig,
  type SellFormInput,
} from "@/lib/rules/sellForm";

describe("checkPrice", () => {
  it.each([
    // typed, price or message
    ["30", 30], // seed range €28–€36: a typical price
    ["24.50", 24.5],
    ["24,50", 24.5], // comma as decimal point
    ["€30", 30],
    ["0.01", 0.01], // smallest valid price
    ["1000", 1000], // maximum included
    ["1000.00", 1000],
    ["0", FORMAT], // acceptance criterion: 0 refused
    ["0.00", FORMAT],
    ["-5", FORMAT], // acceptance criterion: negative refused
    ["thirty", FORMAT], // acceptance criterion: text refused
    ["12.345", FORMAT], // acceptance criterion: more than 2 decimals refused
    ["12.", FORMAT],
    ["1,000", FORMAT], // a thousands separator reads as 3 decimals: refused
    ["1000.01", MAX], // acceptance criterion: above €1000 refused
    ["3000", MAX], // the typing mistake the limit catches (finding #79)
  ] as const)("%s → %s", (typed, expected) => {
    const result = checkPrice(typed);
    if (typeof expected === "number") expect(result).toEqual({ ok: true, price: expected });
    else expect(result).toEqual({ ok: false, message: expected });
  });

  it("empty → not valid, no message yet", () => {
    expect(checkPrice("")).toEqual({ ok: false, message: null });
    expect(checkPrice("   ")).toEqual({ ok: false, message: null });
  });
});

const FULL: SellFormInput = { condition: "VG+", price: "30", hasCover: true, hasRecord: true, needsCity: false, city: "" };

describe("canList and listHint", () => {
  it.each([
    // change from a complete form, enabled, hint (finding #27: says everything that is still needed)
    [{}, true, null],
    [{ condition: null }, false, "Still needed: condition"],
    [{ condition: "Mint" }, false, "Still needed: condition"], // not one of the four grades
    [{ price: "" }, false, "Still needed: price"],
    [{ price: "0" }, false, "Still needed: price"],
    [{ price: "1001" }, false, "Still needed: price"],
    [{ hasCover: false }, false, "Still needed: front cover photo"],
    [{ hasRecord: false }, false, "Still needed: record photo"],
    [{ hasCover: false, hasRecord: false }, false, "Still needed: front cover photo, record photo"],
    [{ needsCity: true, city: "" }, false, "Still needed: city"], // first time, no city
    [{ needsCity: true, city: "   " }, false, "Still needed: city"],
    [{ needsCity: true, city: "Porto" }, true, null], // first time, city filled in; shop name optional
    [{ needsCity: false, city: "" }, true, null], // city already saved
    [{ needsCity: true, city: "", price: "" }, false, "Still needed: city, price"],
    [{ needsCity: true, city: "", condition: null, hasCover: false, hasRecord: false, price: "" }, false, "Still needed: city, condition, front cover photo, record photo, price"],
    [{ needsCity: false, city: "", condition: null, hasCover: false, hasRecord: false, price: "" }, false, "Still needed: condition, front cover photo, record photo, price"],
  ] as const)("%o → enabled %s, hint %s", (change, enabled, hint) => {
    const form = { ...FULL, ...change } as SellFormInput;
    expect(canList(form)).toBe(enabled);
    expect(listHint(form)).toBe(hint);
  });
});

describe("photoTooBig (5 MB each)", () => {
  it.each([
    [1024 * 1024, false],
    [5 * 1024 * 1024, false], // exactly 5 MB is accepted
    [5 * 1024 * 1024 + 1, true],
  ] as const)("%s bytes → %s", (bytes, tooBig) => {
    expect(photoTooBig(bytes)).toBe(tooBig);
  });
});
