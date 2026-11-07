// Story 9 · Sign up — critical flow, run on phone and desktop (playwright.config.ts).
// Creates a real test account in Supabase and removes it (and its profile) afterwards.
import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

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
  await page.goto("/signup");
  await page.getByLabel("Name").fill("Ana Silva");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("vinyl-test-123");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL("/");
  await expect(page.getByRole("img", { name: "Signed in as Ana Silva" })).toHaveText("AS");

  const { data } = await admin().from("profiles").select("user_id, name").eq("name", "Ana Silva");
  const users = await admin().auth.admin.listUsers();
  const user = users.data.users.find((u) => u.email === email)!;
  created.push(user.id);
  expect(data?.some((p) => p.user_id === user.id)).toBe(true); // profile created by the app (DECISIONS · story 9)

  // Same email again → clear message, no second account.
  await page.context().clearCookies();
  await page.goto("/signup");
  await page.getByLabel("Name").fill("Ana Silva");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("vinyl-test-123");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText("This email already has an account")).toBeVisible();
});

test("passwords shorter than 8 characters are refused", async ({ page }) => {
  await page.goto("/signup");
  await page.getByLabel("Name").fill("Ana Silva");
  await page.getByLabel("Email").fill("short-password@example.com");
  await page.getByLabel("Password").fill("1234567");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText("Use at least 8 characters.")).toBeVisible();
  await expect(page).toHaveURL("/signup");
  await expect(page.getByLabel("Name")).toHaveValue("Ana Silva"); // what was typed is kept
});
