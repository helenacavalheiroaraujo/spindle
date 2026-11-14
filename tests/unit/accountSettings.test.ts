// Decision tables from bug 9: change password and saved addresses on "Your account".
import { describe, expect, it } from "vitest";
import {
  ADDRESS_INCOMPLETE,
  WRONG_CURRENT_PASSWORD,
  addressError,
  checkAddresses,
  checkPasswordChange,
  passwordErrorFor,
} from "@/lib/rules/accountSettings";
import { POSTCODE_FORMAT, startingAddress } from "@/lib/rules/shippingAddress";

const HOME = { name: "Ana Silva", street: "Rua das Flores 12", postcode: "4050-262", city: "Porto" };
const WORK = { name: "Ana Silva", street: "Avenida da Boavista 1", postcode: "4100-110", city: "Porto" };
const LAST = { name: "Rui Costa", street: "Rua do Ouro 5", postcode: "1100-060", city: "Lisboa" };

describe("checkPasswordChange", () => {
  it.each([
    [{ current: "old-password", next: "new-password" }, {}], // both fine
    [{ current: "", next: "new-password" }, { current: "Enter your current password." }],
    [{ current: "old-password", next: "short" }, { next: "Use at least 8 characters." }],
    [{ current: "old-password", next: "1234567" }, { next: "Use at least 8 characters." }], // 7 characters
    [{ current: "old-password", next: "12345678" }, {}], // exactly 8
    [{ current: "same-password", next: "same-password" }, { next: "Choose a password different from the current one." }],
    [{ current: "", next: "" }, { current: "Enter your current password.", next: "Use at least 8 characters." }],
  ])("%j", (input, expected) => {
    expect(checkPasswordChange(input)).toEqual(expected);
  });
});

describe("passwordErrorFor", () => {
  it.each([
    ["invalid_credentials", { current: WRONG_CURRENT_PASSWORD }],
    ["weak_password", { next: "Use at least 8 characters." }],
    ["same_password", { next: "Choose a password different from the current one." }],
    ["over_request_rate_limit", null], // unexpected: the shared error screen
    [undefined, null],
  ])("%s", (code, expected) => {
    expect(passwordErrorFor(code)).toEqual(expected);
  });
});

describe("addressError", () => {
  it.each([
    [{}, null],
    [{ name: "" }, ADDRESS_INCOMPLETE],
    [{ street: "  " }, ADDRESS_INCOMPLETE],
    [{ city: "" }, ADDRESS_INCOMPLETE],
    [{ postcode: "" }, ADDRESS_INCOMPLETE],
    [{ postcode: "4050262" }, POSTCODE_FORMAT],
  ])("%j", (change, expected) => {
    expect(addressError({ ...HOME, ...change })).toBe(expected);
  });
});

describe("checkAddresses", () => {
  const EMPTY = { name: "", street: "", postcode: "", city: "" };
  it.each([
    ["billing same: only delivery is checked", { delivery: HOME, billingSame: true, billing: EMPTY }, {}],
    ["billing different and complete", { delivery: HOME, billingSame: false, billing: WORK }, {}],
    ["billing different but empty", { delivery: HOME, billingSame: false, billing: EMPTY }, { billing: ADDRESS_INCOMPLETE }],
    ["delivery incomplete", { delivery: { ...HOME, city: "" }, billingSame: true, billing: EMPTY }, { delivery: ADDRESS_INCOMPLETE }],
    [
      "both wrong",
      { delivery: { ...HOME, postcode: "12" }, billingSame: false, billing: { ...WORK, name: "" } },
      { delivery: POSTCODE_FORMAT, billing: ADDRESS_INCOMPLETE },
    ],
  ])("%s", (_name, input, expected) => {
    expect(checkAddresses(input)).toEqual(expected);
  });
});

describe("startingAddress (checkout)", () => {
  it.each([
    ["saved and last order → saved first", HOME, LAST, null, HOME],
    ["saved only → saved", HOME, null, null, HOME],
    ["last order only → last order", null, LAST, null, LAST],
    ["neither → empty form", null, null, null, null],
    ["saved and account name → saved", HOME, null, "Ana Silva", HOME],
    ["last order and account name → last order", null, LAST, "Ana Silva", LAST],
    ["account name only → name filled in, rest empty (bug 27)", null, null, "Ana Silva", { name: "Ana Silva", street: "", postcode: "", city: "" }],
    ["account name with spaces → trimmed (bug 27)", null, null, "  Ana Silva ", { name: "Ana Silva", street: "", postcode: "", city: "" }],
    ["account name blank → empty form", null, null, "  ", null],
  ])("%s", (_name, saved, last, accountName, expected) => {
    expect(startingAddress(saved, last, accountName)).toEqual(expected);
  });
});
