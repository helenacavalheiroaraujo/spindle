// Story 2 · Save to account (phase 2) — critical flow, run on phone and desktop (playwright.config.ts).
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

const ZIGGY_ID = "10000000-0000-0000-0000-000000000001";
const HUNKY_DORY_ID = "10000000-0000-0000-0000-000000000002";
const PASSWORD = "vinyl-test-123";
let email = "";
let userId = "";

const option = (page: Page, name: string) => page.getByRole("button", { name: new RegExp(`^${name}`) });
const seeRecommendation = (page: Page) => page.getByRole("button", { name: "See recommendation" });
const heading = (page: Page) => page.getByRole("heading", { name: "What matters most to you?" });

async function savedRanking(): Promise<string[] | null> {
  const { data } = await admin().from("user_preferences").select("ranking").eq("user_id", userId).maybeSingle();
  return data?.ranking ?? null;
}

async function logIn(page: Page) {
  await page.goto("/login");
  await signIn(page, email, PASSWORD);
  await expect(page).toHaveURL("/");
}

test.beforeAll(async ({}, info) => {
  email = `spindle-prefs-${info.project.name}-${Date.now()}@spindle.test`;
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

test("a signed-in buyer's ranking is saved, reused on the next album, and replaced by 'Change'", async ({ page }) => {
  await logIn(page);

  // No saved ranking yet → the screen is shown; "See recommendation" saves the ranking.
  await page.goto(`/albums/${ZIGGY_ID}/priorities`);
  await expect(heading(page)).toBeVisible();
  await option(page, "Price").click();
  await option(page, "Sound").click();
  await seeRecommendation(page).click();
  await page.waitForURL(`**/albums/${ZIGGY_ID}/recommendation?priorities=price,sound`);
  expect(await savedRanking()).toEqual(["price", "sound"]);

  // Next album → the screen is skipped; the recommendation shows the saved ranking and "Change".
  await page.goto(`/albums/${HUNKY_DORY_ID}/priorities`);
  await page.waitForURL(`**/albums/${HUNKY_DORY_ID}/recommendation?priorities=price,sound`);
  await page.goto(`/albums/${ZIGGY_ID}/priorities`);
  await page.waitForURL(`**/albums/${ZIGGY_ID}/recommendation?priorities=price,sound`);
  await expect(page.getByText("Based on: Price, Sound")).toBeVisible();
  await screenshot(page, 2, "saved-ranking-skips-screen");

  // "Change" → the screen with the ranking filled in; the new ranking replaces the saved one (finding #11).
  await page.getByRole("link", { name: "Change" }).click();
  await expect(heading(page)).toBeVisible();
  await expect(option(page, "Price")).toHaveAttribute("aria-pressed", "true");
  await option(page, "Price").click();
  await option(page, "Sound").click();
  await option(page, "Condition").click();
  await seeRecommendation(page).click();
  await page.waitForURL(`**/albums/${ZIGGY_ID}/recommendation?priorities=condition`);
  expect(await savedRanking()).toEqual(["condition"]);

  await page.goto(`/albums/${HUNKY_DORY_ID}/priorities`);
  await page.waitForURL(`**/albums/${HUNKY_DORY_ID}/recommendation?priorities=condition`);
});

test("signed out, the screen is always shown and nothing is saved", async ({ page }) => {
  await page.goto(`/albums/${ZIGGY_ID}/priorities`);
  await expect(heading(page)).toBeVisible();
  await option(page, "Original").click();
  await seeRecommendation(page).click();
  await page.waitForURL(`**/albums/${ZIGGY_ID}/recommendation?priorities=original`);
  await page.goto(`/albums/${HUNKY_DORY_ID}/priorities`);
  await expect(heading(page)).toBeVisible();
  expect(await savedRanking()).not.toEqual(["original"]);
});
