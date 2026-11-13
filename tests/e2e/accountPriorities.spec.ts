// Story 23 · Buying priorities on the account page — critical flow, run on phone and desktop (playwright.config.ts).
// Creates a real test account in Supabase (already confirmed) and removes it, its profile and its saved ranking afterwards.
import { expect, test, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { screenshot } from "./screenshot";
import { signIn } from "./session";

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

// The two tests share one account in order: the first runs before any ranking is saved.
test.describe.configure({ mode: "serial" });

const section = (page: Page) => page.getByRole("region", { name: "Buying priorities" });

async function logIn(page: Page) {
  await page.goto("/login");
  await signIn(page, email, PASSWORD);
  await expect(page).toHaveURL("/");
}

test.beforeAll(async ({}, info) => {
  email = `spindle-acc-prefs-${info.project.name}-${Date.now()}@spindle.test`;
  const { data, error } = await admin().auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { name: "Marta Lopes" },
  });
  if (error) throw error;
  userId = data.user.id;
  await admin().from("profiles").insert({ user_id: userId, name: "Marta Lopes" });
});

test.afterAll(async () => {
  await admin().from("user_preferences").delete().eq("user_id", userId);
  await admin().from("profiles").delete().eq("user_id", userId);
  await admin().auth.admin.deleteUser(userId);
});

test("no saved ranking → the account page has no buying priorities section", async ({ page }) => {
  await logIn(page);
  await page.goto("/account");
  await expect(page.getByRole("heading", { name: "Your account" })).toBeVisible();
  await expect(section(page)).toHaveCount(0);
  await screenshot(page, 23, "account-no-priorities");
});

test("a saved ranking is listed on the account page in saved order, numbered from 1", async ({ page }) => {
  await admin().from("user_preferences").upsert({ user_id: userId, ranking: ["condition", "sound", "price"] });
  await logIn(page);
  await page.goto("/account");

  const items = section(page).locator("li");
  await expect(section(page).getByRole("heading", { name: "Buying priorities" })).toBeVisible();
  await expect(items).toHaveCount(3);
  await expect(items.nth(0)).toContainText("Condition");
  await expect(items.nth(1)).toContainText("Sound");
  await expect(items.nth(2)).toContainText("Price");
  // Story 26: the only button is "Change" (DECISIONS 2026-11-11).
  await expect(section(page).getByRole("button")).toHaveText(["Change"]);
  await screenshot(page, 23, "account-priorities");
});
