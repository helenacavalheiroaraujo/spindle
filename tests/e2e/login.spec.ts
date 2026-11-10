// Story 9 · Log in and log out — critical flow, run on phone and desktop (playwright.config.ts).
// Creates a real test account in Supabase (already confirmed) and removes it afterwards.
import { expect, test, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { screenshot } from "./screenshot";

function env(name: string) {
  if (process.env[name]) return process.env[name]!;
  // Last line wins, as in Next.js.
  const line = readFileSync(".env.local", "utf8").split("\n").findLast((l) => l.startsWith(`${name}=`));
  return line?.slice(name.length + 1).trim() ?? "";
}
const admin = () =>
  createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SECRET_KEY"), { auth: { persistSession: false } });

const PASSWORD = "vinyl-test-123";
let email = "";
let userId = "";

test.beforeAll(async ({}, info) => {
  email = `spindle-login-${info.project.name}-${Date.now()}@spindle.test`;
  const { data, error } = await admin().auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { name: "Rui Costa" },
  });
  if (error) throw error;
  userId = data.user.id;
  await admin().from("profiles").insert({ user_id: userId, name: "Rui Costa" });
});

test.afterAll(async () => {
  await admin().from("profiles").delete().eq("user_id", userId);
  await admin().auth.admin.deleteUser(userId);
});

// Where "Log in" sits: the top-right badge on a phone, the menu in the top row on desktop (story 19).
const corner = (page: Page, info: { project: { name: string } }) =>
  info.project.name === "phone" ? page.locator("body > .pointer-events-none") : page.getByRole("navigation", { name: "Main" });

test("a registered user logs in from the header and logs out", async ({ page }, info) => {
  await page.goto("/");
  await screenshot(page, 9, "home-signed-out");
  await corner(page, info).getByRole("link", { name: "Log in" }).click();
  await expect(page).toHaveURL("/login");
  await expect(corner(page, info).getByRole("link", { name: "Log in" })).toHaveCount(0); // not shown on the log-in page itself
  await screenshot(page, 9, "login");

  // Wrong password → message that does not say which one was wrong; no reset link.
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.getByText("That email and password don't match. Check them and try again.")).toBeVisible();
  await expect(page.getByText(/reset|forgot/i)).toHaveCount(0);
  await expect(page.getByLabel("Email")).toHaveValue(email); // what was typed is kept
  await screenshot(page, 9, "login-wrong-password");

  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL("/");
  const badge = page.getByRole("link", { name: "Your account, signed in as Rui Costa" });
  await expect(badge).toHaveText("RC");

  await badge.click();
  await expect(page).toHaveURL("/account");
  await expect(page.getByText(email)).toBeVisible();
  await expect(page.getByText("Rui Costa")).toBeVisible();
  await screenshot(page, 9, "account");

  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL("/");
  await expect(corner(page, info).getByRole("link", { name: "Log in" })).toBeVisible();

  // Signed out: Your account sends the user to log in.
  await page.goto("/account");
  await expect(page).toHaveURL("/login?next=%2Faccount");
});

test("after logging in, the user returns to where they were", async ({ page }) => {
  await page.goto("/login?next=%2Faccount");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL("/account");
});

test("the return address survives switching between log-in and sign-up", async ({ page }) => {
  await page.goto("/login?next=%2Faccount");
  await page.getByRole("link", { name: "Create one" }).click();
  await expect(page).toHaveURL("/signup?next=%2Faccount");
  await page.locator("p").getByRole("link", { name: "Log in" }).click();
  await expect(page).toHaveURL("/login?next=%2Faccount");
});

test("a link to another site after log-in goes to the home page", async ({ page }) => {
  await page.goto("/login?next=https%3A%2F%2Fevil.example");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL("/");
});
