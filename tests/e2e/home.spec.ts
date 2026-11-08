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

  const crates = page.getByRole("list").filter({ has: page.getByRole("link", { name: /^Rock/ }) }).getByRole("link");
  await expect(crates).toHaveCount(3); // genres with no albums (Jazz, Fado, Hip-hop) are not shown
  await expect(page.getByRole("link", { name: "Rock, 4 records" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Soul and funk, 1 record" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Electronic, 2 records" })).toBeVisible();

  const week = page.getByRole("region", { name: "This week at the shop" });
  await expect(week.getByText("This weekend")).toBeVisible();
  await expect(week.getByText(ZIGGY)).toBeVisible(); // the album that opens with the most active listings
  await expect(week.getByText("0% commission: you keep the full price.")).toBeVisible();
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

  // Same taps as story 1: no listings → message; opens → priorities; not in the demo → does nothing.
  await rows.nth(0).getByRole("button").click();
  await expect(page.getByText("Nobody is selling this album right now")).toBeVisible();
  await rows.nth(2).getByRole("link").click();
  await expect(page).toHaveURL(/\/albums\/10000000-0000-0000-0000-000000000001\/priorities$/);
});

test("every crate opens at least one album on sale", async ({ page }) => {
  for (const [slug, album] of [["soul-and-funk", "Let's Dance"], ["electronic", "Megalithic Symphony"]]) {
    await page.goto(`/genres/${slug}`);
    await page.getByRole("listitem").filter({ hasText: album }).getByRole("link").click();
    await expect(page.getByRole("heading", { name: "What matters most to you?" })).toBeVisible();
  }
});

test("a genre with no albums, or an unknown one, shows the not-found page", async ({ page }) => {
  for (const slug of ["jazz", "polka"]) {
    await page.goto(`/genres/${slug}`);
    await expect(page.getByText("This page could not be found.")).toBeVisible();
  }
});

test("'This weekend' opens the featured album; 'For sellers' opens selling", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "See which to buy" }).click();
  await expect(page).toHaveURL(/\/albums\/10000000-0000-0000-0000-000000000001\/priorities$/);
  await page.goto("/");
  await page.getByRole("link", { name: "Sell a record" }).click();
  await expect(page).toHaveURL(/\/login\?next=%2Fsell$|\/sell$/);
});

test("the search works from the home page at both sizes, and from the header of another page on desktop", async ({ page }) => {
  await page.goto("/");
  await typeSearch(page, "ziggy");
  await expect(page.getByRole("listitem").filter({ hasText: ZIGGY })).toHaveCount(1);
  if ((page.viewportSize()?.width ?? 0) >= 1024) {
    await page.goto("/genres/rock");
    await typeSearch(page, "bowie");
    await expect(page).toHaveURL("/?q=bowie");
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
