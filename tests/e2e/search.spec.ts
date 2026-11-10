// Story 1 · Search for an album, shown on the results page of story 17 (/search?q=…).
// Critical flow, run on phone and desktop (playwright.config.ts). Uses the illustrative data in supabase/seed.sql.
import { expect, test } from "@playwright/test";
import { typeSearch } from "./searchBox";
import { screenshot } from "./screenshot";

const ZIGGY = "The Rise and Fall of Ziggy Stardust and the Spiders from Mars";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

const box = (page: import("@playwright/test").Page) => page.getByRole("searchbox", { name: "Album or artist" });
const rows = (page: import("@playwright/test").Page) =>
  page.getByRole("list", { name: "Search results" }).getByRole("listitem");

test("fewer than 3 characters: no search, a hint, and the typed text stays", async ({ page }) => {
  await typeSearch(page, "zi");
  await expect(page).toHaveURL("/search?q=zi");
  await expect(page.getByText("Type at least 3 characters to search.")).toBeVisible();
  await expect(rows(page)).toHaveCount(0);
  await expect(page.getByText(/No albums found/)).toHaveCount(0);
  await expect(box(page)).toHaveValue("zi");
});

test("a search opens a page of its own with only the results, never the home content", async ({ page }) => {
  await typeSearch(page, "bowie");
  await expect(page).toHaveURL("/search?q=bowie");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Results for “bowie”");
  await expect(page.getByText("4 albums · newest first")).toBeVisible();
  await expect(page.getByText("Illustrative data")).toBeVisible();
  await expect(page.getByText("This week at the shop")).toHaveCount(0);
  await expect(page.getByRole("link", { name: /^Rock, / })).toHaveCount(0); // no crates
  await screenshot(page, 17, "results");
});

test("the home page lists no results under the search box", async ({ page }) => {
  await expect(page.getByRole("list", { name: "Search results" })).toHaveCount(0);
  await page.goto("/?q=bowie"); // an old address: the home page ignores it
  await expect(page.getByRole("list", { name: "Search results" })).toHaveCount(0);
});

test("the results page has no 'Back to home' link (bug 16)", async ({ page }) => {
  await typeSearch(page, "bowie");
  await expect(page.getByRole("link", { name: "Back to home" })).toHaveCount(0);
});

test("opening the address directly, or reloading, gives the same results with the text in the box", async ({ page }) => {
  await page.goto("/search?q=bowie");
  await expect(rows(page)).toHaveCount(4);
  await expect(box(page)).toHaveValue("bowie");
  await page.reload();
  await expect(rows(page)).toHaveCount(4);
});

test("editing the text and searching again shows the new results", async ({ page }) => {
  await typeSearch(page, "bowie");
  await expect(rows(page)).toHaveCount(4);
  await typeSearch(page, "bjork");
  await expect(page).toHaveURL("/search?q=bjork");
  await expect(rows(page)).toHaveCount(1);
  await expect(rows(page).first()).toContainText("Homogenic");
});

test("'ziggy' finds Ziggy Stardust with cover, title, artist, year and versions", async ({ page }) => {
  await typeSearch(page, "ziggy");
  const row = rows(page).filter({ hasText: ZIGGY });
  await expect(row).toHaveCount(1);
  await expect(row).toContainText("David Bowie, 1972");
  await expect(row).toContainText("3 versions");
  await expect(row.locator("img")).toHaveAttribute("src", "https://coverartarchive.org/release-group/6c9ae3dd-32ad-472c-96be-69d0a3536261/front-500");
  await expect(row).not.toContainText("No listings");
  await expect(page.getByText("1 album ·")).toBeVisible();
});

test("'bowie' and 'BOWIE' list Bowie's albums, newest first", async ({ page }) => {
  const expected = ["Blackstar", "Let's Dance", ZIGGY, "Hunky Dory"];
  for (const typed of ["bowie", "BOWIE"]) {
    await typeSearch(page, typed);
    await expect(rows(page)).toHaveCount(4);
    for (const [i, title] of expected.entries()) await expect(rows(page).nth(i)).toContainText(title);
  }
});

test("'bjork' finds Björk", async ({ page }) => {
  await typeSearch(page, "bjork");
  await expect(rows(page).filter({ hasText: "Homogenic" })).toContainText("Björk");
});

test("an album without active listings shows 'No listings', even with a sold copy", async ({ page }) => {
  await typeSearch(page, "bowie");
  // Blackstar has only a sold copy (seed); Let's Dance has active listings since story 12.
  await expect(rows(page).filter({ hasText: "Blackstar" })).toContainText("No listings");
  await expect(rows(page).filter({ hasText: "Let's Dance" })).not.toContainText("No listings");
});

test("an album with listings but no recommendation data shows 'Not in the demo' and does not open (#50)", async ({ page }) => {
  await typeSearch(page, "hunky");
  const row = rows(page).filter({ hasText: "Hunky Dory" });
  await expect(row).toContainText("Not in the demo");
  await expect(row.getByRole("link")).toHaveCount(0);
  await expect(row.getByRole("button")).toHaveCount(0);
});

test("a typo suggests the full album title", async ({ page }) => {
  await typeSearch(page, "zigy");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("No albums found for “zigy”");
  await expect(page.getByText("Did you mean…?")).toBeVisible();
  await expect(rows(page)).toHaveCount(1);
  await expect(rows(page).first()).toContainText(ZIGGY);
  await screenshot(page, 17, "typo");
});

test("3 letters with no match, or nothing close, shows only 'No albums found'", async ({ page }) => {
  for (const typed of ["zgy", "xyzzy"]) {
    await typeSearch(page, typed);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(`No albums found for “${typed}”`);
    await expect(page.getByText("Did you mean")).toHaveCount(0);
    await expect(rows(page)).toHaveCount(0);
  }
});

test("tapping an album with active listings opens the priorities screen", async ({ page }) => {
  await typeSearch(page, "ziggy");
  await rows(page).filter({ hasText: ZIGGY }).getByRole("link").click();
  await expect(page).toHaveURL(/\/albums\/10000000-0000-0000-0000-000000000001\/priorities$/);
});

test("tapping an album with no listings shows the message directly", async ({ page }) => {
  await typeSearch(page, "blackstar");
  await rows(page).filter({ hasText: "Blackstar" }).getByRole("button").click();
  await expect(page.getByText("Nobody is selling this album right now")).toBeVisible();
  expect(new URL(page.url()).pathname).toBe("/search"); // stays on the results page
});
