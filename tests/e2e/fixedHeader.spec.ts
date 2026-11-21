// Stories 37 and 38 and bug 38. Runs on phone (375 px) and desktop (1280 px), see playwright.config.ts.
// 37: on desktop the header stays on screen while scrolling; on the phone it scrolls away.
// 38: no search and no strip on the cart and account pages (checkouts: checkout.spec.ts and cart.spec.ts).
// Bug 38: the Search button waits for 3 characters, in the header and on the page.
import { expect, test } from "@playwright/test";
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

const PASSWORD = "vinyl-test-123";
let email = "";
let userId = "";

test.beforeAll(async ({}, info) => {
  email = `spindle-fixed-${info.project.name}-${Date.now()}@spindle.test`;
  const { data, error } = await admin().auth.admin.createUser({ email, password: PASSWORD, email_confirm: true, user_metadata: { name: "Ana Lima" } });
  if (error) throw error;
  userId = data.user.id;
  await admin().from("profiles").insert({ user_id: userId, name: "Ana Lima" });
});
test.afterAll(async () => {
  await admin().from("profiles").delete().eq("user_id", userId);
  await admin().auth.admin.deleteUser(userId);
});

const desktopOnly = (info: { project: { name: string } }) => test.skip(info.project.name !== "desktop", "desktop only");
const phoneOnly = (info: { project: { name: string } }) => test.skip(info.project.name !== "phone", "phone only");

async function logIn(page: import("@playwright/test").Page, next: string) {
  await page.goto(`/login?next=${encodeURIComponent(next)}`);
  await signIn(page, email, PASSWORD);
  await expect(page).toHaveURL(next);
}

test("desktop: after scrolling, the navy row and the search strip are still at the top, and the page's first line is not hidden (story 37)", async ({ page }, info) => {
  desktopOnly(info);
  await page.goto("/");
  await expect(page.getByText("This week at the shop")).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 400)); // the home page is about 1200 px high at 1280 px
  await page.waitForFunction(() => window.scrollY > 300);
  const nav = await page.getByRole("navigation", { name: "Main" }).boundingBox();
  const strip = await page.getByTestId("header-search-strip").boundingBox();
  expect(nav!.y).toBeGreaterThanOrEqual(0);
  expect(nav!.y).toBeLessThan(56);
  expect(strip!.y).toBeGreaterThanOrEqual(50);
  expect(strip!.y + strip!.height).toBeLessThanOrEqual(125);
  await screenshot(page, 37, "scrolled", { fullPage: false });
  // The suggestion box opens over the page from the fixed header.
  await page.getByRole("searchbox", { name: "Album or artist" }).fill("bowie");
  await expect(page.getByRole("list", { name: "Suggestions" }).getByRole("listitem").first()).toBeVisible();
  const first = await page.getByRole("list", { name: "Suggestions" }).getByRole("listitem").first().boundingBox();
  const top = await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.closest("[role=listbox], ul, li") !== null, { x: first!.x + 20, y: first!.y + 10 });
  expect(top).toBe(true);
});

test("desktop: a link to a part of the page lands below the header (story 37)", async ({ page }, info) => {
  desktopOnly(info);
  await page.goto("/#week");
  await expect(page.getByRole("heading", { name: "This week at the shop" })).toBeInViewport();
  const heading = await page.getByRole("heading", { name: "This week at the shop" }).boundingBox();
  expect(heading!.y).toBeGreaterThanOrEqual(120); // under the navy row (56 px) and the strip (64 px)
});

test("desktop: the log-in window covers the fixed header (story 37)", async ({ page }, info) => {
  desktopOnly(info);
  await page.goto("/login");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 300));
  const covered = await page.evaluate(() => {
    const el = document.elementFromPoint(640, 20); // where the navy row is
    return Boolean(el?.closest("dialog") || el?.tagName === "DIALOG");
  });
  expect(covered).toBe(true);
});

test("phone: after scrolling, the header is not on screen (story 37, unchanged)", async ({ page }, info) => {
  phoneOnly(info);
  await page.goto("/");
  await expect(page.getByText("This week at the shop")).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 400)); // the home page is about 1200 px high at 1280 px
  await page.waitForFunction(() => window.scrollY > 300);
  const box = await page.locator("header").first().boundingBox();
  expect(box!.y + box!.height).toBeLessThan(0);
  await page.evaluate(() => window.scrollTo(0, 0));
  await screenshot(page, 37, "phone-top");
});

test("desktop: the cart and the three account tabs show no search and no strip; the home page keeps them (story 38)", async ({ page }, info) => {
  desktopOnly(info);
  await logIn(page, "/cart");
  for (const path of ["/cart", "/account/orders", "/account/for-sale", "/account/details"]) {
    await page.goto(path);
    await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();
    await expect(page.getByTestId("header-search-strip")).toHaveCount(0);
    await expect(page.locator("header").getByRole("search")).toHaveCount(0);
  }
  await screenshot(page, 38, "account-no-search");
  for (const path of ["/", "/search?q=bowie", "/genres/jazz"]) {
    await page.goto(path);
    await expect(page.getByTestId("header-search-strip")).toBeVisible();
    await expect(page.locator("header").getByRole("search")).toBeVisible();
  }
});

test("the Search button is disabled until 3 characters; the hint stays in the box; Enter does nothing under 3 (bug 38)", async ({ page }, info) => {
  await page.goto("/");
  const field = page.getByRole("searchbox", { name: "Album or artist" });
  const button = page.getByRole("button", { name: "Search", exact: true });
  await expect(button).toBeDisabled();
  await field.fill("bo");
  await expect(page.getByText("Type at least 3 characters to search.")).toBeVisible();
  await expect(button).toBeDisabled();
  await field.press("Enter");
  await expect(page).toHaveURL(/\/$/);
  await field.fill("bow");
  await expect(button).toBeEnabled();
  await screenshot(page, 38, "search-enabled");
  await button.click();
  await expect(page).toHaveURL(/\/search\?q=bow/);
  // The box on the results page behaves the same.
  await expect(button).toBeEnabled();
  await field.fill("b");
  await expect(button).toBeDisabled();
});
