// Decision tables from SPEC story 9 · Acceptance criteria and Edge cases.
import { describe, expect, it } from "vitest";
import { checkSignUp, signUpErrorFor, isAccountNotCreated, ACCOUNT_NOT_CREATED } from "@/lib/rules/signUp";

const OK = { name: "Ana Silva", email: "ana@example.com", password: "12345678" };

describe("checkSignUp", () => {
  it.each([
    // input, expected errors
    [OK, {}], // name, email and password → can be sent
    [{ ...OK, password: "1234567" }, { password: "Use at least 8 characters." }], // 7 characters refused
    [{ ...OK, password: "" }, { password: "Use at least 8 characters." }],
    [{ ...OK, password: "        " }, {}], // 8 spaces: length is what counts (Supabase Auth decides strength)
    [{ ...OK, name: "   " }, { name: "Enter your name." }],
    [{ ...OK, email: "" }, { email: "Enter your email." }],
    [{ name: "", email: "", password: "" }, { name: "Enter your name.", email: "Enter your email.", password: "Use at least 8 characters." }],
  ] as const)("%o → %o", (input, errors) => {
    expect(checkSignUp(input)).toEqual(errors);
  });
});

describe("signUpErrorFor", () => {
  it.each([
    // Supabase Auth error code, message shown
    ["user_already_exists", null], // never a field message: see isAccountNotCreated (bug 15)
    ["email_exists", null],
    ["email_address_invalid", { email: "Enter a valid email address." }],
    ["validation_failed", { email: "Enter a valid email address." }],
    ["weak_password", { password: "Use at least 8 characters." }],
    ["over_request_rate_limit", null], // unexpected → shared error screen
    [undefined, null],
  ] as const)("%s → %o", (code, result) => {
    expect(signUpErrorFor(code)).toEqual(result);
  });

  it("never says that an email already has an account (bug 15)", () => {
    for (const code of ["user_already_exists", "email_exists"])
      expect(JSON.stringify(signUpErrorFor(code))).not.toMatch(/already/i);
  });
});

describe("isAccountNotCreated (bug 15)", () => {
  it.each([
    ["user_already_exists", true], // registered email → same screen as a new email
    ["email_exists", true],
    ["no_session", false], // confirmation is off; if it is turned on this screen must be redone (DECISIONS · bug 15)
    ["weak_password", false],
    ["email_address_invalid", false],
    ["over_request_rate_limit", false],
    [undefined, false],
  ] as const)("%s → %s", (code, shown) => {
    expect(isAccountNotCreated(code)).toBe(shown);
  });

  it("uses one generic text", () => {
    expect(ACCOUNT_NOT_CREATED).toBe("We couldn't create an account with these details.");
  });
});
