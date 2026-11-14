// Story 26 · Change buying priorities on the account page — critical flow, run on phone and desktop (playwright.config.ts).
// Creates a real test account in Supabase (already confirmed) and removes it, its profile and its saved ranking afterwards.
import { expect, test, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { screenshot } from "./screenshot";
import { signIn } from "./session";

function env(name: string) {
  if (process.env[name]) return process.env[name]!;
  const line = readFileSync(".env.local", "utf8").split("\n").findLast((l) => l.startsWith(`${name}=`));
  return line?.slice(name.length + 1).trim() ?? "";
}
const admin = () =>
  createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SECRET_KEY"), { auth: { persistSession: false } });

const ZIGGY_ID = "10000000-0000-0000-0000-000000000001";
const PASSWORD = "vinyl-test-123";
let email = "";
let userId = "";

test.describe.configure({ mode: "serial" });

const section = (page: Page) => page.getByRole("region", { name: "Buying priorities" });
const rows = (page: Page) => section(page).getByRole("list").first().getByRole("listitem");
const savedRanking = async () =>
  (await admin().from("user_preferences").select("ranking").eq("user_id", userId).maybeSingle()).data?.ranking ?? null;
const saveRanking = (ranking: string[]) => admin().from("user_preferences").upsert({ user_id: userId, ranking });

async function openAccount(page: Page) {
  await page.goto("/login");
  await signIn(page, email, PASSWORD);
  await expect(page).toHaveURL("/");
  await page.goto("/account/details"); // buying priorities are on the Account details tab (story 31)
  await expect(section(page)).toBeVisible();
}

test.beforeAll(async ({}, info) => {
  email = `spindle-change-prefs-${info.project.name}-${Date.now()}@spindle.test`;
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

test("Change → move Sound up → Save my order: the new order is shown, saved and used by the next recommendation", async ({ page }) => {
  await saveRanking(["price", "original", "sound"]);
  await openAccount(page);

  await section(page).getByRole("button", { name: "Change" }).click();
  // Top row: no up arrow; bottom row: no down arrow.
  await expect(section(page).getByRole("button", { name: "Move Price up" })).toHaveCount(0);
  await expect(section(page).getByRole("button", { name: "Move Price down" })).toBeVisible();
  await expect(section(page).getByRole("button", { name: "Move Sound down" })).toHaveCount(0);
  await expect(section(page).getByRole("button", { name: "Add Condition" })).toBeVisible();
  await screenshot(page, 26, "change-priorities");

  await section(page).getByRole("button", { name: "Move Sound up" }).click();
  await expect(rows(page).nth(1)).toContainText("Sound");
  await section(page).getByRole("button", { name: "Save my order" }).click();

  await expect(section(page).getByRole("button", { name: "Change" })).toBeVisible();
  await expect(rows(page)).toHaveCount(3);
  await expect(rows(page).nth(0)).toContainText("Price");
  await expect(rows(page).nth(1)).toContainText("Sound");
  await expect(rows(page).nth(2)).toContainText("Original");
  await expect.poll(savedRanking).toEqual(["price", "sound", "original"]);

  await page.goto(`/albums/${ZIGGY_ID}/priorities`);
  await page.waitForURL(`**/albums/${ZIGGY_ID}/recommendation?priorities=price,sound,original`);
});

test("Add a missing option puts it at the end; one Add line per missing option", async ({ page }) => {
  await saveRanking(["original", "price"]);
  await openAccount(page);
  await section(page).getByRole("button", { name: "Change" }).click();

  await expect(section(page).getByRole("button", { name: /^Add / })).toHaveCount(2);
  await section(page).getByRole("button", { name: "Add Condition" }).click();
  await expect(rows(page)).toHaveCount(3);
  await expect(rows(page).nth(2)).toContainText("Condition");
  await expect(section(page).getByRole("button", { name: /^Add / })).toHaveCount(1);
  await section(page).getByRole("button", { name: "Save my order" }).click();

  await expect(section(page).getByRole("button", { name: "Change" })).toBeVisible();
  await expect.poll(savedRanking).toEqual(["original", "price", "condition"]);
});

test("Cancel keeps the saved order as it was", async ({ page }) => {
  await saveRanking(["price", "original", "sound"]);
  await openAccount(page);
  await section(page).getByRole("button", { name: "Change" }).click();
  await section(page).getByRole("button", { name: "Move Price down" }).click();
  await section(page).getByRole("button", { name: "Add Condition" }).click();
  await section(page).getByRole("button", { name: "Cancel" }).click();

  await expect(section(page).getByRole("button", { name: "Change" })).toBeVisible();
  await expect(rows(page)).toHaveCount(3);
  await expect(rows(page).nth(0)).toContainText("Price");
  await expect(rows(page).nth(2)).toContainText("Sound");
  expect(await savedRanking()).toEqual(["price", "original", "sound"]);
});
