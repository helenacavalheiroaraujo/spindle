// Navy header on desktop (story 22, option B). Runs on phone (375 px) and desktop (1280 px), see playwright.config.ts.
// Desktop: a navy top row with cream logo and menu; the search in a cream strip under it, on every page but the sell pages.
// Phone: unchanged (no navy).
import { expect, test, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { signIn } from "./session";
import { screenshot } from "./screenshot";

function env(name: string) {
  if (process.env[name]) return process.env[name]!;
  const line = readFileSync(".env.local", "utf8").split("\n").findLast((l) => l.startsWith(`${name}=`));
  return line?.slice(name.length + 1).trim() ?? "";
}
const admin = () =>
  createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SECRET_KEY"), { auth: { persistSession: false } });

// The sell pages need a log-in (story 8), so the sell test uses its own account.
const PASSWORD = "vinyl-test-123";
let email = "";
let userId = "";

test.beforeAll(async ({}, info) => {
  email = `spindle-navy-${info.project.name}-${Date.now()}@spindle.test`;
  const { data, error } = await admin().auth.admin.createUser({ email, password: PASSWORD, email_confirm: true, user_metadata: { name: "Ana Lima" } });
  if (error) throw error;
  userId = data.user.id;
  await admin().from("profiles").insert({ user_id: userId, name: "Ana Lima" });
});
test.afterAll(async () => {
  await admin().from("profiles").delete().eq("user_id", userId);
  await admin().auth.admin.deleteUser(userId);
});

const phoneOnly = (info: { project: { name: string } }) => test.skip(info.project.name !== "phone", "phone only");
const desktopOnly = (info: { project: { name: string } }) => test.skip(info.project.name !== "desktop", "desktop only");
const topRow = (page: Page) => page.getByRole("navigation", { name: "Main" }).locator("xpath=..");
const NAVY = "rgb(29, 36, 51)";
const CREAM = "rgb(244, 239, 230)";

test("desktop: the top row is navy with cream text; the search is in a cream strip under it", async ({ page }, info) => {
  desktopOnly(info);
  await page.goto("/");
  await expect(page.getByText("This week at the shop")).toBeVisible();
  const row = topRow(page);
  await expect(row).toHaveCSS("background-color", NAVY);
  await expect(row).toHaveCSS("color", CREAM);
  await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Log in" })).toHaveCSS("color", CREAM);
  const navBox = await page.getByRole("navigation", { name: "Main" }).boundingBox();
  const search = await page.getByRole("searchbox", { name: "Album or artist" }).boundingBox();
  expect(navBox!.y + navBox!.height).toBeLessThan(search!.y); // search below the navy row
  await screenshot(page, 22, "header");
});

test("desktop: the search is under the navy row on another page too, and it still searches", async ({ page }, info) => {
  desktopOnly(info);
  await page.goto("/cart");
  await expect(page.getByRole("searchbox", { name: "Album or artist" })).toBeVisible();
  await expect(topRow(page)).toHaveCSS("background-color", NAVY);
  await page.getByRole("searchbox", { name: "Album or artist" }).fill("Ziggy");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page).toHaveURL(/\/search\?q=Ziggy/);
});

test("desktop: the sell pages have no search strip", async ({ page }, info) => {
  desktopOnly(info);
  await page.goto("/login?next=%2Fsell");
  await signIn(page, email, PASSWORD);
  await expect(page).toHaveURL(/\/sell$/);
  await expect(page.getByRole("heading", { name: "Which record are you selling?" })).toBeVisible();
  await expect(page.getByTestId("header-search-strip")).toHaveCount(0); // the sell page has its own search (story 8), not the strip
});

test("phone: the header is not navy", async ({ page }, info) => {
  phoneOnly(info);
  await page.goto("/");
  await expect(page.getByText("This week at the shop")).toBeVisible();
  await expect(page.getByRole("link", { name: "SPINDLE" })).not.toHaveCSS("color", CREAM);
  await expect(page.locator("header").first()).not.toHaveCSS("background-color", NAVY);
  await screenshot(page, 22, "header");
});
