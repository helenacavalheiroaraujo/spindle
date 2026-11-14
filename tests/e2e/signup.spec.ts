// Story 9 · Sign up — critical flow, run on phone and desktop (playwright.config.ts).
// Creates a real test account in Supabase and removes it (and its profile) afterwards.
import { expect, test } from "@playwright/test";
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

const created: string[] = [];
test.afterAll(async () => {
  for (const id of created) {
    await admin().from("profiles").delete().eq("user_id", id);
    await admin().auth.admin.deleteUser(id);
  }
});

test("a new user signs up with name, email and password and is signed in", async ({ page }, info) => {
  const email = `spindle-test-${info.project.name}-${Date.now()}@spindle.test`; // Supabase refuses @example.com
  await page.goto("/signup"); // story 29: the home page with the window in its "Create one" state
  const box = page.getByRole("dialog");
  await windowReady(page);
  await expect(box.getByRole("heading", { name: "Create an account" })).toBeVisible();
  await screenshot(page, 9, "signup");
  await box.getByLabel("Name").fill("Ana Silva");
  await box.getByLabel("Email").fill(email);
  await box.getByLabel("Password").fill("vinyl-test-123");
  await box.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL("/");
  await expect(page.getByRole("button", { name: "Your account, signed in as Ana Silva" }).first()).toContainText("AS"); // the account pill (story 32)
  await screenshot(page, 9, "signed-in");

  const { data } = await admin().from("profiles").select("user_id, name").eq("name", "Ana Silva");
  const users = await admin().auth.admin.listUsers();
  const user = users.data.users.find((u) => u.email === email)!;
  created.push(user.id);
  expect(data?.some((p) => p.user_id === user.id)).toBe(true); // profile created by the app (DECISIONS · story 9)

  // Same email again → the generic message, never "already has an account" (bug 15); no second account, not signed in.
  await page.context().clearCookies();
  await page.goto("/signup");
  await windowReady(page);
  await box.getByLabel("Name").fill("Ana Silva");
  await box.getByLabel("Email").fill(email);
  await box.getByLabel("Password").fill("vinyl-test-123");
  await box.getByRole("button", { name: "Create account" }).click();
  await expect(box.getByRole("status")).toContainText("We couldn't create an account with these details.");
  await expect(page.getByText(/already has an account/i)).toHaveCount(0);
  await expect(page.getByRole("button", { name: /signed in as/ })).toHaveCount(0);
  await screenshot(page, 9, "signup-email-in-use");
  await box.getByRole("status").getByRole("button", { name: "Log in" }).click();
  await expect(box.getByLabel("Email")).toHaveValue(email); // what was typed goes along to the log-in form
});

test("passwords shorter than 8 characters are refused", async ({ page }) => {
  await page.goto("/signup");
  const box = page.getByRole("dialog");
  await windowReady(page);
  await box.getByLabel("Name").fill("Ana Silva");
  await box.getByLabel("Email").fill("short-password@example.com");
  await box.getByLabel("Password").fill("1234567");
  await box.getByRole("button", { name: "Create account" }).click();
  await expect(box.getByText("Use at least 8 characters.")).toBeVisible();
  await screenshot(page, 9, "signup-short-password");
  await expect(page).toHaveURL("/signup");
  await expect(box.getByLabel("Name")).toHaveValue("Ana Silva"); // what was typed is kept
});
