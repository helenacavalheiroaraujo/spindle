// Story 1 · Search for an album — critical flow, run on phone and desktop (playwright.config.ts).
// Uses the illustrative data in supabase/seed.sql.
import { expect, test } from "@playwright/test";

const ZIGGY = "The Rise and Fall of Ziggy Stardust and the Spiders from Mars";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

const box = (page: import("@playwright/test").Page) => page.getByRole("searchbox", { name: "Album or artist" });
const rows = (page: import("@playwright/test").Page) => page.getByRole("listitem");

test("fewer than 3 characters shows no results", async ({ page }) => {
  await box(page).fill("zi");
  await page.waitForTimeout(600);
  await expect(rows(page)).toHaveCount(0);
  await expect(page.getByText("No albums found")).toHaveCount(0);
});

test("'ziggy' finds Ziggy Stardust with cover, title, artist, year and versions", async ({ page }) => {
  await box(page).fill("ziggy");
  const row = rows(page).filter({ hasText: ZIGGY });
  await expect(row).toHaveCount(1);
  await expect(row).toContainText("David Bowie, 1972");
  await expect(row).toContainText("3 versions");
  await expect(row.locator("img")).toHaveAttribute("src", "/covers/ziggy-stardust.svg");
  await expect(row).not.toContainText("No listings");
});

test("'bowie' and 'BOWIE' list Bowie's albums, newest first", async ({ page }) => {
  const expected = ["Blackstar", "Let's Dance", ZIGGY, "Hunky Dory"];
  for (const typed of ["bowie", "BOWIE"]) {
    await box(page).fill(typed);
    await expect(rows(page)).toHaveCount(4);
    for (const [i, title] of expected.entries()) await expect(rows(page).nth(i)).toContainText(title);
  }
});

test("'bjork' finds Björk", async ({ page }) => {
  await box(page).fill("bjork");
  await expect(rows(page).filter({ hasText: "Homogenic" })).toContainText("Björk");
});

test("an album without active listings shows 'No listings', even with a sold copy", async ({ page }) => {
  await box(page).fill("bowie");
  // Blackstar has only a sold copy (seed); Let's Dance has active listings since story 12.
  await expect(rows(page).filter({ hasText: "Blackstar" })).toContainText("No listings");
  await expect(rows(page).filter({ hasText: "Let's Dance" })).not.toContainText("No listings");
});

test("an album with listings but no recommendation data shows 'Not in the demo' and does not open (#50)", async ({ page }) => {
  await box(page).fill("hunky");
  const row = rows(page).filter({ hasText: "Hunky Dory" });
  await expect(row).toContainText("Not in the demo");
  await expect(row.getByRole("link")).toHaveCount(0);
  await expect(row.getByRole("button")).toHaveCount(0);
});

test("a typo suggests the full album title", async ({ page }) => {
  await box(page).fill("zigy");
  await expect(page.getByText("Did you mean…?")).toBeVisible();
  await expect(rows(page)).toHaveCount(1);
  await expect(rows(page).first()).toContainText(ZIGGY);
});

test("3 letters with no match, or nothing close, shows only 'No albums found'", async ({ page }) => {
  for (const typed of ["zgy", "xyzzy"]) {
    await box(page).fill(typed);
    await expect(page.getByText("No albums found")).toBeVisible();
    await expect(rows(page)).toHaveCount(0);
  }
});

test("tapping an album with active listings opens the priorities screen", async ({ page }) => {
  await box(page).fill("ziggy");
  await rows(page).filter({ hasText: ZIGGY }).getByRole("link").click();
  await expect(page).toHaveURL(/\/albums\/10000000-0000-0000-0000-000000000001\/priorities$/);
});

test("tapping an album with no listings shows the message directly", async ({ page }) => {
  await box(page).fill("blackstar");
  await rows(page).filter({ hasText: "Blackstar" }).getByRole("button").click();
  await expect(page.getByText("Nobody is selling this album right now")).toBeVisible();
  await expect(page).toHaveURL("/");
});

test("if the search fails, an error screen with 'Try again' recovers and keeps what was typed", async ({ page }) => {
  // Cut only the search requests (Next.js server actions are POSTs with a "next-action" header).
  let fail = true;
  await page.route("**/*", (route) => {
    const r = route.request();
    if (fail && r.method() === "POST" && r.headers()["next-action"]) return route.abort();
    return route.continue();
  });

  await box(page).fill("ziggy");
  // Next.js adds its own empty "alert" (route announcer), so look for ours by its text.
  const alert = page.getByRole("alert").filter({ hasText: "We couldn't load the albums" });
  await expect(alert).toBeVisible();

  fail = false;
  await alert.getByRole("button", { name: "Try again" }).click();
  await expect(rows(page).filter({ hasText: ZIGGY })).toHaveCount(1);
  await expect(box(page)).toHaveValue("ziggy");
  await expect(alert).toHaveCount(0);
});
