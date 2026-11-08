// Decision tables from SPEC story 9 · Acceptance criteria and Use cases (log in, return to where the user was).
import { describe, expect, it } from "vitest";
import { checkLogin, loginErrorFor, returnPath, withReturn, WRONG_LOGIN } from "@/lib/rules/login";

describe("checkLogin", () => {
  it.each([
    // input, expected errors
    [{ email: "ana@example.com", password: "vinyl-test-123" }, {}],
    [{ email: "   ", password: "vinyl-test-123" }, { email: "Enter your email." }],
    [{ email: "ana@example.com", password: "" }, { password: "Enter your password." }],
    [{ email: "ana@example.com", password: "1234" }, {}], // no length rule at log-in: Supabase Auth decides
    [{ email: "", password: "" }, { email: "Enter your email.", password: "Enter your password." }],
  ] as const)("%o → %o", (input, errors) => {
    expect(checkLogin(input)).toEqual(errors);
  });
});

describe("loginErrorFor", () => {
  it.each([
    // Supabase Auth error code, message shown
    ["invalid_credentials", { form: WRONG_LOGIN }], // wrong password or unknown email: same message
    ["user_not_found", { form: WRONG_LOGIN }],
    ["email_address_invalid", { email: "Enter a valid email address." }],
    ["validation_failed", { email: "Enter a valid email address." }],
    ["over_request_rate_limit", null], // unexpected → shared error screen
    [undefined, null],
  ] as const)("%s → %o", (code, result) => {
    expect(loginErrorFor(code)).toEqual(result);
  });

  it("uses the exact text from the acceptance criterion", () => {
    expect(WRONG_LOGIN).toBe("That email and password don't match. Check them and try again.");
  });
});

describe("returnPath", () => {
  it.each([
    // ?next= value, where the user goes
    ["/listings/abc/checkout", "/listings/abc/checkout"], // back to where they were
    ["/sell", "/sell"],
    [null, "/"],
    [undefined, "/"],
    ["", "/"],
    ["https://evil.example", "/"], // another site → home
    ["//evil.example", "/"],
    ["/\\evil.example", "/"],
  ] as const)("%s → %s", (next, path) => {
    expect(returnPath(next)).toBe(path);
  });
});

describe("withReturn", () => {
  it.each([
    ["/login", "/", "/login"],
    ["/signup", "/versions/v1?x=1", "/signup?next=%2Fversions%2Fv1%3Fx%3D1"],
    ["/login", "https://evil.example", "/login"],
  ] as const)("%s + %s → %s", (page, next, href) => {
    expect(withReturn(page, next)).toBe(href);
  });
});
