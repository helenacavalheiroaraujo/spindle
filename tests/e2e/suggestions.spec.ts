// Story 16 · Search suggestions — critical flow, run on phone and desktop (playwright.config.ts).
// Uses the illustrative data in supabase/seed.sql.
import { expect, test, type Page } from "@playwright/test";
import { typeOnly } from "./searchBox";
import { screenshot } from "./screenshot";

const ZIGGY = "The Rise and Fall of Ziggy Stardust and the Spiders from Mars";
const box = (page: Page) => page.getByRole("searchbox", { name: "Album or artist" });
const list = (page: Page) => page.getByRole("list", { name: "Suggestions" });
const rows = (page: Page) => list(page).getByRole("listitem");

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("fewer than 3 characters: the box says to type at least 3, with no albums (bug 26)", async ({ page }) => {
  await typeOnly(page, "bo");
  await expect(page.getByText("Type at least 3 characters to search.")).toBeVisible();
  await expect(list(page)).toHaveCount(0);
  await expect(page.getByText("No albums found")).toHaveCount(0);
  await box(page).press("ArrowDown"); // nothing to highlight; Enter still opens the results page as before
  await expect(page.locator("[aria-current=true]")).toHaveCount(0);
  await typeOnly(page, "bow");
  await expect(page.getByText("Type at least 3 characters to search.")).toHaveCount(0);
  await expect(rows(page).first()).toBeVisible();
});

test("search text cleared: no box", async ({ page }) => {
  await typeOnly(page, "b");
  await expect(page.getByText("Type at least 3 characters to search.")).toBeVisible();
  await typeOnly(page, "");
  await expect(page.getByText("Type at least 3 characters to search.")).toHaveCount(0);
});

test("'bowie': up to 4 albums newest first, with cover, artist, year and tag, and the 'See all' line", async ({ page }) => {
  await typeOnly(page, "bowie");
  await expect(rows(page)).toHaveCount(4);
  await expect(rows(page).nth(0)).toContainText("Blackstar");
  await expect(rows(page).nth(0)).toContainText("David Bowie, 2016");
  await expect(rows(page).nth(0)).toContainText("No listings");
  await expect(rows(page).nth(1)).toContainText("Let's Dance");
  await expect(rows(page).nth(2)).toContainText(ZIGGY);
  await expect(rows(page).nth(2)).toContainText("3 versions");
  await expect(rows(page).nth(3)).toContainText("Hunky Dory");
  await expect(rows(page).nth(3)).toContainText("Not in the demo");
  await expect(rows(page).nth(0).locator("img")).toHaveCount(1);
  await screenshot(page, 16, "suggestions");
  await page.getByRole("link", { name: "See all results for “bowie”" }).click();
  await expect(page).toHaveURL("/search?q=bowie");
});

test("upper case and accents give the same suggestions: 'BOWIE' and 'bjork'", async ({ page }) => {
  await typeOnly(page, "BOWIE");
  await expect(rows(page)).toHaveCount(4);
  await typeOnly(page, "bjork");
  await expect(rows(page)).toHaveCount(1);
  await expect(rows(page).first()).toContainText("Homogenic");
  await expect(rows(page).first()).toContainText("Björk");
});

test("a typo gives 'Did you mean…?'; no match gives 'No albums found'", async ({ page }) => {
  await typeOnly(page, "zigy");
  await expect(page.getByText("Did you mean…?")).toBeVisible();
  await expect(rows(page)).toHaveCount(1);
  await expect(rows(page).first()).toContainText(ZIGGY);
  await typeOnly(page, "qqqqqq");
  await expect(page.getByText("No albums found")).toBeVisible();
  await expect(rows(page)).toHaveCount(0);
});

test("tap a suggestion with listings: the priorities screen; with no listings: its own page (bug 28)", async ({ page }) => {
  await typeOnly(page, "bowie");
  await expect(rows(page)).toHaveCount(4);
  await page.getByRole("link", { name: /Blackstar/ }).click();
  await expect(page).toHaveURL(/\/albums\/[^/]+$/);
  await expect(page.getByRole("heading", { level: 2, name: "Nobody is selling this album right now" })).toBeVisible();
  await page.goto("/");
  await typeOnly(page, "bowie");
  await page.getByRole("link", { name: /Ziggy Stardust/ }).first().click();
  await expect(page).toHaveURL(/\/albums\/.*\/priorities/);
});

test("a no-listings suggestion says why when hovered or highlighted with the keys (bug 28)", async ({ page, isMobile }) => {
  await typeOnly(page, "blackstar");
  const row = rows(page).filter({ hasText: "Blackstar" });
  const tag = (text: string) => row.getByText(text, { exact: true });
  await expect(tag("No listings")).toBeVisible();
  await expect(tag("Nobody is selling this album right now")).toBeHidden();
  if (!isMobile) {
    await row.hover();
    await expect(tag("Nobody is selling this album right now")).toBeVisible();
    await page.mouse.move(0, 0);
    await expect(tag("No listings")).toBeVisible();
  }
  await box(page).press("ArrowDown");
  await expect(tag("Nobody is selling this album right now")).toBeVisible();
  await expect(tag("No listings")).toHaveCount(0);
  await box(page).press("Enter");
  await expect(page).toHaveURL(/\/albums\/[^/]+$/);
});

test("keys: ↓ highlights, Enter opens the highlighted row, Enter with none highlighted opens the results page", async ({ page }) => {
  await typeOnly(page, "ziggy");
  await expect(rows(page)).toHaveCount(1);
  await box(page).press("ArrowDown");
  await expect(rows(page).first().locator("[aria-current]")).toHaveCount(1);
  await box(page).press("Enter");
  await expect(page).toHaveURL(/\/albums\/.*\/priorities/);

  await page.goto("/");
  await typeOnly(page, "ziggy");
  await expect(rows(page)).toHaveCount(1);
  await box(page).press("Enter");
  await expect(page).toHaveURL("/search?q=ziggy");
});

test("Esc closes the box; tapping outside closes it; typing opens it again", async ({ page }) => {
  await typeOnly(page, "bowie");
  await expect(rows(page)).toHaveCount(4);
  await box(page).press("Escape");
  await expect(list(page)).toHaveCount(0);
  await typeOnly(page, "bowi");
  await expect(rows(page)).toHaveCount(4);
  await page.locator("body").click({ position: { x: 4, y: 700 } }); // the page, away from the box
  await expect(list(page)).toHaveCount(0);
});

test("the box shows the result of the last text typed", async ({ page }) => {
  await typeOnly(page, "bowie");
  await typeOnly(page, "bjork");
  await expect(rows(page)).toHaveCount(1);
  await page.waitForTimeout(800);
  await expect(rows(page)).toHaveCount(1);
  await expect(rows(page).first()).toContainText("Homogenic");
});

test("a failed load shows the error screen with 'Try again', and keeps the typed text", async ({ page }) => {
  let fail = true;
  await page.route("**/*", async (route) => {
    const post = route.request().method() === "POST" && route.request().headers()["next-action"];
    if (fail && post) return route.abort();
    return route.continue();
  });
  await typeOnly(page, "bowie");
  const alert = page.getByRole("alert").filter({ hasText: "We couldn't load the albums" });
  await expect(alert).toBeVisible();
  await expect(box(page)).toHaveValue("bowie");
  fail = false;
  await alert.getByRole("button", { name: "Try again" }).click();
  await expect(rows(page)).toHaveCount(4);
});

test("on the results page the search box also says to type at least 3 (header on desktop, page box on phone · bug 26)", async ({ page }) => {
  await page.goto("/search?q=bowie");
  await typeOnly(page, "zi");
  await expect(page.getByText("Type at least 3 characters to search.")).toBeVisible();
  await expect(list(page)).toHaveCount(0);
});
