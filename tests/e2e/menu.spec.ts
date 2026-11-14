// Menu — critical flow, run on phone and desktop (playwright.config.ts).
// Story 15 (phone drawer) and story 19 (desktop cells with chevrons). Desktop: cells in the top row. Phone: ☰ opens a side drawer. Uses a real test account for "Your account".
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

const PASSWORD = "vinyl-test-123";
let email = "";
let userId = "";

test.beforeAll(async ({}, info) => {
  email = `spindle-menu-${info.project.name}-${Date.now()}@spindle.test`;
  const { data, error } = await admin().auth.admin.createUser({ email, password: PASSWORD, email_confirm: true, user_metadata: { name: "Rui Costa" } });
  if (error) throw error;
  userId = data.user.id;
  await admin().from("profiles").insert({ user_id: userId, name: "Rui Costa" });
});
test.afterAll(async () => {
  await admin().from("profiles").delete().eq("user_id", userId);
  await admin().auth.admin.deleteUser(userId);
});

const phoneOnly = (info: { project: { name: string } }) => test.skip(info.project.name !== "phone", "phone only");
const desktopOnly = (info: { project: { name: string } }) => test.skip(info.project.name !== "desktop", "desktop only");
const row = (page: Page) => page.getByRole("navigation", { name: "Main" });
const drawer = (page: Page) => page.getByRole("dialog", { name: "Menu" });
const openMenu = async (page: Page) => {
  // Wait for the page to be interactive: a click before React takes over does nothing.
  const button = page.getByRole("button", { name: "Open menu" });
  await expect(async () => {
    await button.click();
    await expect(drawer(page)).toBeVisible({ timeout: 1000 });
  }).toPass();
};

test("desktop: the menu is in the top row above the search; cells Artists, All genres, Log in, Sell for free; no link twice; Artists and All genres are 'Soon'", async ({ page }, info) => {
  desktopOnly(info);
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Open menu" })).toBeHidden();
  await expect(row(page).getByRole("link")).toHaveText(["Log in", "Sell for free", ""]); // Home is the logo; the last link is the cart icon (story 20), which has no text
  await expect(row(page).getByText("Artists")).toBeVisible();
  await expect(row(page).getByText("All genres and formats")).toBeVisible();
  await expect(row(page).getByText("Soon", { exact: true })).toHaveCount(2);
  await expect(row(page).getByRole("link", { name: /Artists|All genres/ })).toHaveCount(0); // not tappable
  await expect(page.getByRole("link", { name: "Sell for free", exact: true })).toHaveCount(1); // not repeated anywhere
  await expect(page.getByRole("link", { name: "Log in", exact: true })).toHaveCount(1);
  const search = await page.getByRole("searchbox", { name: "Album or artist" }).boundingBox();
  const nav = await row(page).boundingBox();
  expect(nav!.y + nav!.height).toBeLessThan(search!.y); // above the search box
  await expect(page.getByText("This week at the shop")).toBeVisible(); // wait for the page to finish loading
  await screenshot(page, 19, "menu");
  await page.goto("/search?q=bowie");
  await expect(row(page).getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login?next=%2Fsearch%3Fq%3Dbowie"); // back to this page after logging in
  await page.goto("/sell");
  await expect(page).toHaveURL(/\/login\?next=%2Fsell/);
  await expect(row(page).getByRole("link", { name: "Log in" })).toHaveCount(0); // not shown on the log-in page
  await expect(row(page).getByRole("link", { name: "Sell for free" })).toBeVisible();
});

test("desktop: the search is in a cream strip under the menu row on every page, and the header is the same height everywhere (story 22)", async ({ page }, info) => {
  desktopOnly(info);
  const header = async (path: string) => {
    await page.goto(path);
    return {
      height: Math.round((await page.locator("header").first().boundingBox())!.height),
      search: await page.locator("header").first().getByRole("search").boundingBox(),
      nav: await row(page).boundingBox(),
    };
  };
  const home = await header("/");
  expect(home.search!.y).toBeGreaterThan(home.nav!.y + home.nav!.height - 2); // under the menu row
  const other = await header("/search?q=bowie");
  expect(other.search!.y).toBeGreaterThan(other.nav!.y + other.nav!.height - 2); // under the menu row, not beside it
  expect(other.height).toBe(home.height); // one strip on every page
  expect((await header("/login")).height).toBe(home.height);
  await page.goto("/search?q=bowie");
  await screenshot(page, 22, "header-search-strip");
});

test("desktop: the chevron opens a box by hover, click and Enter; Esc and a click outside close it", async ({ page }, info) => {
  desktopOnly(info);
  await page.goto("/");
  await expect(page.getByText("This week at the shop")).toBeVisible();
  const artists = page.getByRole("button", { name: "More about Artists" });
  const sell = page.getByRole("button", { name: "More about Sell for free" });
  const box = (text: string) => page.getByText(text, { exact: true });
  const chevronWidth = (await artists.boundingBox())!.width;
  expect(chevronWidth).toBeGreaterThanOrEqual(40);
  await artists.hover(); // hover opens it, and it says Coming soon
  await expect(box("Coming soon")).toBeVisible();
  await expect(artists).toHaveAttribute("aria-expanded", "true");
  await screenshot(page, 19, "menu-box");
  await page.keyboard.press("Escape");
  await expect(box("Coming soon")).toBeHidden();
  await page.mouse.move(10, 400); // away from the cell
  await sell.click(); // click opens it
  await expect(box("Nothing here yet")).toBeVisible();
  await page.mouse.move(10, 400);
  await expect(box("Nothing here yet")).toBeVisible(); // a click keeps it open
  await page.mouse.click(10, 400); // outside
  await expect(box("Nothing here yet")).toBeHidden();
  await sell.focus(); // the keyboard: Enter opens, Esc closes and the focus stays on the chevron
  await page.keyboard.press("Enter");
  await expect(box("Nothing here yet")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(box("Nothing here yet")).toBeHidden();
  await expect(sell).toBeFocused();
});

test("phone: ☰ opens the drawer; items, current page and 'Coming soon'; a link closes it", async ({ page }, info) => {
  phoneOnly(info);
  await page.goto("/");
  await expect(row(page)).toBeHidden();
  await expect(drawer(page)).toHaveCount(0);
  await openMenu(page);
  await expect(drawer(page).getByRole("link")).toHaveText(["Home", "Sell for free", "Log in", "Cart"]); // story 20: the Cart cell
  await expect(drawer(page).getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
  await expect(drawer(page).getByText("Coming soon")).toHaveCount(2);
  await expect(drawer(page).getByRole("link", { name: /Artists|All genres/ })).toHaveCount(0);
  const tap = await drawer(page).getByRole("link", { name: "Sell for free" }).boundingBox();
  expect(tap!.height).toBeGreaterThanOrEqual(44); // large enough to tap
  await screenshot(page, 15, "menu-open");
  await drawer(page).getByRole("link", { name: "Sell for free" }).click();
  await expect(drawer(page)).toHaveCount(0);
  // Signed out: the log-in window opens on the page (story 27).
  await expect(page.getByRole("dialog").getByRole("heading", { name: "Log in to sell" })).toBeVisible();
});

test("phone: the chevron of a row opens the same message under the row, and a second tap closes it", async ({ page }, info) => {
  phoneOnly(info);
  await page.goto("/");
  await openMenu(page);
  const chevron = drawer(page).getByRole("button", { name: "More about Sell for free" });
  expect((await chevron.boundingBox())!.width).toBeGreaterThanOrEqual(48);
  await chevron.click();
  await expect(drawer(page).getByText("Nothing here yet")).toBeVisible();
  await screenshot(page, 19, "menu-open-box");
  await chevron.click();
  await expect(drawer(page).getByText("Nothing here yet")).toBeHidden();
  await drawer(page).getByRole("button", { name: "More about Artists" }).click();
  await expect(drawer(page).getByText("Coming soon", { exact: true }).last()).toBeVisible();
});

test("phone: Esc, the close button and tapping the dark area close the drawer", async ({ page }, info) => {
  phoneOnly(info);
  await page.goto("/");
  await openMenu(page);
  await expect(page.getByRole("button", { name: "Close menu" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(drawer(page)).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
  await openMenu(page);
  await page.getByRole("button", { name: "Close menu" }).click();
  await expect(drawer(page)).toHaveCount(0);
  await openMenu(page);
  await page.mouse.click(360, 400); // the dark area to the right of the drawer
  await expect(drawer(page)).toHaveCount(0);
});

// WebKit (the phone run) does not Tab through links, so the keyboard is tested in Chromium at phone width.
test("keyboard: the focus starts on Close, stays inside the open drawer, and returns to ☰ when it closes", async ({ page }, info) => {
  desktopOnly(info);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await openMenu(page);
  await expect(page.getByRole("button", { name: "Close menu" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(drawer(page).getByRole("link", { name: "Home" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Shift+Tab"); // from the first control back to the last link: the focus does not leave
  await expect(drawer(page).getByRole("button", { name: "More about All genres and formats" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Close menu" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(drawer(page)).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
});

test("signed in: 'Your account' replaces 'Log in', on the same pages, and opens Your account", async ({ page }, info) => {
  await page.goto(`/login?next=${encodeURIComponent("/search?q=bowie")}`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL("/search?q=bowie");
  const items = info.project.name === "phone" ? drawer(page) : row(page);
  if (info.project.name === "phone") await openMenu(page);
  const phone = info.project.name === "phone";
  await expect(items.getByRole("link")).toHaveText(phone ? ["Home", "Sell for free", "Your account", "Cart"] : ["RC", "Sell for free", ""]); // desktop: the initials, and the cart icon (no text)
  await expect(items.getByRole("link", { name: "Log in" })).toHaveCount(0);
  await items.getByRole("link", { name: /Your account/ }).click();
  await expect(page).toHaveURL("/account");
  if (phone) {
    await openMenu(page);
    await expect(items.getByRole("link", { name: "Your account" })).toHaveAttribute("aria-current", "page");
  }
});
