// Story 9 · Log in and log out — critical flow, run on phone and desktop (playwright.config.ts).
// Creates a real test account in Supabase (already confirmed) and removes it afterwards.
import { expect, test, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { screenshot } from "./screenshot";
import { windowReady } from "./session";

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
  // The header link opens the log-in window (story 27, tested in loginWindow.spec.ts); /login is the home page with the
  // same window on top (story 29).
  await expect(corner(page, info).getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login");
  await page.goto("/login");
  const box = page.getByRole("dialog");
  await windowReady(page);
  await expect(box.getByRole("heading", { name: "Log in" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Pick a crate. We'll pick the pressing." })).toBeAttached(); // the home page under it
  await screenshot(page, 9, "login");

  // Wrong password → message that does not say which one was wrong; no reset link.
  await box.getByLabel("Email").fill(email);
  await box.getByLabel("Password").fill("wrong-password");
  await box.getByRole("button", { name: "Log in" }).click();
  await expect(box.getByText("That email and password don't match. Check them and try again.")).toBeVisible();
  await expect(page.getByText(/reset|forgot/i)).toHaveCount(0);
  await expect(box.getByLabel("Email")).toHaveValue(email); // what was typed is kept
  await screenshot(page, 9, "login-wrong-password");

  await box.getByLabel("Password").fill(PASSWORD);
  await box.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL("/");
  // The account pill (story 32): initials, first name on desktop, ▾; it opens the account menu.
  const badge = page.getByRole("button", { name: "Your account, signed in as Rui Costa" });
  await expect(badge).toContainText("RC");

  await badge.click();
  await page.getByRole("link", { name: "Account details" }).click();
  await expect(page).toHaveURL("/account/details");
  await expect(page.getByRole("main").getByText(email)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Rui Costa" })).toBeVisible();
  await screenshot(page, 9, "account");

  await page.getByRole("main").getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL("/");
  await expect(corner(page, info).getByRole("link", { name: "Log in" })).toBeVisible();

  // Signed out: Your account shows only the header, with the log-in window on top (story 29).
  await page.goto("/account");
  await expect(page).toHaveURL("/account");
  await expect(page.getByRole("dialog").getByRole("heading", { name: "Log in" })).toBeVisible();
  await expect(page.getByText(email)).toHaveCount(0);
});

test("after logging in, the user returns to where they were", async ({ page }) => {
  await page.goto("/login?next=%2Faccount"); // a link from before story 29 still lands on the right page
  const box = page.getByRole("dialog");
  await windowReady(page);
  await box.getByLabel("Email").fill(email);
  await box.getByLabel("Password").fill(PASSWORD);
  await box.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL("/account");
});

test("the return address survives switching between log-in and sign-up", async ({ page }) => {
  await page.goto("/login?next=%2Faccount");
  const box = page.getByRole("dialog");
  await windowReady(page);
  await box.getByRole("button", { name: "Create one" }).click();
  await expect(box.getByRole("heading", { name: "Create an account" })).toBeVisible();
  await box.getByRole("button", { name: "Log in" }).click();
  await expect(box.getByRole("heading", { name: "Log in" })).toBeVisible();
  await box.getByLabel("Email").fill(email);
  await box.getByLabel("Password").fill(PASSWORD);
  await box.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL("/account");
});

test("a link to another site after log-in goes to the home page", async ({ page }) => {
  await page.goto("/login?next=https%3A%2F%2Fevil.example");
  const box = page.getByRole("dialog");
  await windowReady(page);
  await box.getByLabel("Email").fill(email);
  await box.getByLabel("Password").fill(PASSWORD);
  await box.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL("/");
});
