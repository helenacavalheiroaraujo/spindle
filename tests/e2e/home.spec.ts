// Story 12 · Home page — critical flow, run on phone and desktop (playwright.config.ts).
// Uses the illustrative data in supabase/seed.sql (genres and the four albums added for this story).
import { expect, test } from "@playwright/test";
import { typeSearch } from "./searchBox";
import { screenshot } from "./screenshot";

const ZIGGY = "The Rise and Fall of Ziggy Stardust and the Spiders from Mars";

test("home page: title, search, one crate per genre with real counts, and two 'This week' cards", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Pick a crate. We'll pick the pressing.");
  await expect(page.getByText("No jargon, no homework.")).toBeVisible();
  await expect(page.getByRole("searchbox", { name: "Album or artist" })).toBeVisible();

  const crates = page.getByRole("region", { name: "Pick a crate" }).getByRole("link");
  await expect(crates).toHaveCount(6); // the six genres of the design, each with its real number of albums
  for (const name of ["Rock, 4 records", "Jazz, 1 record", "Soul and funk, 1 record", "Fado, 1 record", "Electronic, 2 records", "Hip-hop, 1 record"]) {
    await expect(page.getByRole("link", { name })).toBeVisible();
  }

  const week = page.getByRole("region", { name: "This week at the shop" });
  await expect(week.getByText("This weekend")).toBeVisible();
  await expect(week.getByText(ZIGGY)).toBeVisible(); // the album that opens with the most active listings
  await expect(week).toContainText("Sell for free.");
  await expect(week).toContainText("0% commission.");
  await screenshot(page, 12, "home");
});

test("a crate opens the genre screen: only that genre's albums, newest first, rows as in search", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Rock, 4 records" }).click();
  await expect(page).toHaveURL("/genres/rock");
  await expect(page.getByText("4 records")).toBeVisible();
  const rows = page.getByRole("listitem");
  await expect(rows).toHaveCount(4);
  await expect(rows.nth(0)).toContainText("Blackstar"); // 2016
  await expect(rows.nth(1)).toContainText("The Dark Side of the Moon"); // 1973
  await expect(rows.nth(2)).toContainText(ZIGGY); // 1972
  await expect(rows.nth(3)).toContainText("Hunky Dory"); // 1971
  await expect(rows.nth(0)).toContainText("No listings");
  await expect(rows.nth(3)).toContainText("Not in the demo");
  await expect(page.getByText("Homogenic")).toHaveCount(0);
  await screenshot(page, 12, "genre-rock");

  // Genre taps: no listings → its own page with the message (bug 17); opens → priorities; not in the demo → does nothing.
  await rows.nth(0).getByRole("link").click();
  await expect(page).toHaveURL(/\/albums\/[0-9a-f-]+$/);
  await expect(page.getByRole("heading", { level: 2, name: "Nobody is selling this album right now" })).toBeVisible();
  await screenshot(page, 17, "album-no-listings");
  await page.goBack();
  await expect(page).toHaveURL("/genres/rock");
  await rows.nth(2).getByRole("link").click();
  await expect(page).toHaveURL(/\/albums\/10000000-0000-0000-0000-000000000001\/priorities$/);
});

test("Rock, Soul and funk and Electronic open at least one album on sale", async ({ page }) => {
  for (const [slug, album] of [["soul-and-funk", "Let's Dance"], ["electronic", "Megalithic Symphony"]]) {
    await page.goto(`/genres/${slug}`);
    await page.getByRole("listitem").filter({ hasText: album }).getByRole("link").click();
    await expect(page.getByRole("heading", { name: "What matters most to you?" })).toBeVisible();
  }
});

test("showcase genres (Jazz, Fado, Hip-hop) open their album with 'No listings'; an unknown genre is not found", async ({ page }) => {
  for (const [slug, album] of [["jazz", "Kind of Blue"], ["fado", "Com que voz"], ["hip-hop", "Illmatic"]]) {
    await page.goto(`/genres/${slug}`);
    const row = page.getByRole("listitem").filter({ hasText: album });
    await expect(row).toContainText("No listings");
    await row.getByRole("link").click();
    await expect(page.getByRole("heading", { level: 2, name: "Nobody is selling this album right now" })).toBeVisible();
  }
  await page.goto("/genres/polka");
  await expect(page.getByText("This page could not be found.")).toBeVisible();
});

test("'This weekend' opens the featured album; 'For sellers' opens selling", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "See which to buy" }).click();
  await expect(page).toHaveURL(/\/albums\/10000000-0000-0000-0000-000000000001\/priorities$/);
  await page.goto("/");
  await page.getByRole("link", { name: "Sell a record" }).click();
  await expect(page).toHaveURL(/\/login\?next=%2Fsell$|\/sell$/);
});

test("the search opens the results page from the home page at both sizes, and from the header of another page on desktop", async ({ page }) => {
  await page.goto("/");
  await typeSearch(page, "ziggy");
  await expect(page).toHaveURL("/search?q=ziggy");
  await expect(page.getByRole("listitem").filter({ hasText: ZIGGY })).toHaveCount(1);
  if ((page.viewportSize()?.width ?? 0) >= 1024) {
    await page.goto("/genres/rock");
    await typeSearch(page, "bowie");
    await expect(page).toHaveURL("/search?q=bowie");
    await expect(page.getByRole("listitem").filter({ hasText: "Blackstar" })).toHaveCount(1);
  } else {
    await page.goto("/genres/rock");
    await expect(page.getByRole("searchbox")).toHaveCount(0); // phone: no search in the header
  }
});

test("if the shop sections fail to load, an error screen with 'Try again' recovers and the search stays", async ({ page }) => {
  let fail = true;
  await page.route("**/*", (route) => {
    const r = route.request();
    if (fail && r.method() === "POST" && r.headers()["next-action"]) return route.abort();
    return route.continue();
  });
  await page.goto("/");
  const alert = page.getByRole("alert").filter({ hasText: "We couldn't load the shop" });
  await expect(alert).toBeVisible();
  await expect(page.getByRole("searchbox", { name: "Album or artist" })).toBeVisible();
  fail = false;
  await alert.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByRole("link", { name: "Rock, 4 records" })).toBeVisible();
  await expect(alert).toHaveCount(0);
});
