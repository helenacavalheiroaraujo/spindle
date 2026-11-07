// Decision tables from SPEC story 9 · Acceptance criteria and Edge cases.
import { describe, expect, it } from "vitest";
import { checkSignUp, signUpErrorFor, EMAIL_IN_USE } from "@/lib/rules/signUp";

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
    ["user_already_exists", { email: EMAIL_IN_USE }], // email already used → no second account
    ["email_exists", { email: EMAIL_IN_USE }],
    ["email_address_invalid", { email: "Enter a valid email address." }],
    ["validation_failed", { email: "Enter a valid email address." }],
    ["weak_password", { password: "Use at least 8 characters." }],
    ["over_request_rate_limit", null], // unexpected → shared error screen
    [undefined, null],
  ] as const)("%s → %o", (code, result) => {
    expect(signUpErrorFor(code)).toEqual(result);
  });

  it("uses the exact text from the acceptance criterion", () => {
    expect(EMAIL_IN_USE).toBe("This email already has an account");
  });
});
