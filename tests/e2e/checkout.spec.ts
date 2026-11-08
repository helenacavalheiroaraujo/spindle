// Story 7 · Buy with protection — critical flow, run on phone and desktop (playwright.config.ts).
// Creates a real test account in Supabase (already confirmed) and removes it afterwards.
// Uses the illustrative data in supabase/seed.sql.
import { expect, test, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { screenshot } from "./screenshot";

function env(name: string) {
  if (process.env[name]) return process.env[name]!;
  const line = readFileSync(".env.local", "utf8").split("\n").findLast((l) => l.startsWith(`${name}=`));
  return line?.slice(name.length + 1).trim() ?? "";
}
const admin = () =>
  createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SECRET_KEY"), { auth: { persistSession: false } });

const V1990 = "20000000-0000-0000-0000-000000000002";
const V2012 = "20000000-0000-0000-0000-000000000003";
const GREEN_32 = "40000000-0000-0000-0000-000000000005";
const YELLOW_36 = "40000000-0000-0000-0000-000000000006";
const RED_29 = "40000000-0000-0000-0000-000000000008"; // claimed 2012 Remaster, actually 1990 Reissue
const rows = (page: Page) => page.getByRole("list", { name: "Verified listings" }).getByRole("listitem");

const PASSWORD = "vinyl-test-123";
let email = "";
let userId = "";

test.beforeAll(async ({}, info) => {
  email = `spindle-checkout-${info.project.name}-${Date.now()}@spindle.test`;
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

async function logIn(page: Page) {
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
}

test("signed out: Buy on a green listing asks to log in, then lands on its checkout", async ({ page }) => {
  await page.goto(`/versions/${V2012}/listings`);
  await rows(page).nth(0).getByRole("link", { name: /^Buy/ }).click();
  await expect(page).toHaveURL(`/login?next=${encodeURIComponent(`/checkout/${GREEN_32}?version=${V2012}`)}`);
  await logIn(page);
  await expect(page).toHaveURL(`/checkout/${GREEN_32}?version=${V2012}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Buy with protection");
  await expect(page.getByRole("region", { name: "The record" })).toContainText("Spiders from Mars, 2012 Remaster");
  await screenshot(page, 7, "checkout");
});

test("signed out: Continue to checkout after the yellow warning asks to log in, then lands on its checkout", async ({ page }) => {
  await page.goto(`/versions/${V2012}/listings`);
  await rows(page).nth(1).getByRole("button", { name: /^Buy/ }).click();
  await page.getByRole("group", { name: "Before you buy" }).getByRole("link", { name: "Continue to checkout" }).click();
  await expect(page).toHaveURL(/\/login\?next=/);
  await logIn(page);
  await expect(page).toHaveURL(`/checkout/${YELLOW_36}?version=${V2012}`);
});

test("signed in: a red listing never reaches the checkout; the same listing under its actual version does", async ({ page }) => {
  await page.goto("/login");
  await logIn(page);
  await expect(page).toHaveURL("/");
  await page.goto(`/checkout/${RED_29}?version=${V2012}`);
  await expect(page.getByText("This page could not be found.")).toBeVisible();
  await page.goto(`/checkout/${RED_29}?version=${V1990}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Buy with protection");
  await expect(page.getByRole("region", { name: "The record" })).toContainText("Spiders from Mars, 1990 Reissue");
});
