// Story 3 · Get one recommendation — critical flow, run on phone and desktop (playwright.config.ts).
// Uses the illustrative data in supabase/seed.sql.
import { expect, test, type Page } from "@playwright/test";

const ZIGGY_ID = "10000000-0000-0000-0000-000000000001";
const LETS_DANCE_ID = "10000000-0000-0000-0000-000000000003"; // its recommended version has no tracks in the seed
const url = (priorities: string) => `/albums/${ZIGGY_ID}/recommendation?priorities=${priorities}`;
const reasons = (page: Page) => page.getByRole("list", { name: "Why this one" }).getByRole("listitem");
const matches = (page: Page) => page.getByRole("list", { name: "Matches" }).getByRole("listitem");

test("priorities → See recommendation → 1. Price, 2. Sound recommends the 2012 Remaster", async ({ page, isMobile }) => {
  await page.goto(`/albums/${ZIGGY_ID}/priorities`);
  await page.getByRole("button", { name: /^Price/ }).click();
  await page.getByRole("button", { name: /^Sound/ }).click();
  await page.getByRole("button", { name: "See recommendation" }).click();
  await expect(page).toHaveURL(url("price,sound"));

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("2012 Remaster");
  await expect(page.getByText("2012 · EU · Parlophone · LP, 180 g")).toBeVisible();
  // Phone: the count with the lowest price and the "Matches" tags stay. Desktop (design option A): the listings beside
  // say it, so the left column drops both (DECISIONS 2026-11-10, replaces two story 3 lines on desktop).
  if (isMobile) {
    await expect(page.getByText("2 for sale · from €32")).toBeVisible();
    await expect(matches(page)).toHaveText(["Matches: price", "Matches: sound"]);
  } else {
    await expect(page.getByText("2 for sale · from €32")).toBeHidden();
    await expect(matches(page)).toHaveCount(0);
  }
  await expect(page.getByText("Cheapest option: 1990 Reissue, €24")).toBeVisible();
  await expect(page.getByText("Based on 305 collector ratings · Illustrative data")).toBeVisible();
  await expect(page.getByText(/The ideal pressing/)).toHaveCount(0);
});

test("1. Price only → 1990 Reissue, no alternative", async ({ page }) => {
  await page.goto(url("price"));
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("1990 Reissue");
  await expect(page.getByText(/Cheapest option/)).toHaveCount(0);
});

test("1. Sound, 2. Price → first reason about sound, second about price, with prices from the data", async ({ page }) => {
  await page.goto(url("sound,price"));
  await expect(reasons(page)).toHaveCount(2);
  await expect(reasons(page).nth(0)).toContainText("A careful remaster");
  await expect(reasons(page).nth(1)).toHaveText("Costs €32, vs typically €150–€220 for a first pressing.");
});

test("1. Original, 2. Sound → ideal but unavailable note for the 1972 UK original", async ({ page, isMobile }) => {
  await page.goto(url("original,sound"));
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("2012 Remaster"); // never a version with no listings
  await expect(
    page.getByText("The ideal pressing for your priorities is the 1972 UK original, but nobody is selling it right now."),
  ).toBeVisible();
  if (isMobile) await expect(matches(page)).toHaveText(["Matches: sound"]); // original scores 3: no tag
  else await expect(matches(page)).toHaveCount(0); // desktop: no tags at all
});

test("glossary terms show their plain explanation when tapped", async ({ page }) => {
  await page.goto(url("sound,price"));
  for (const [term, explanation] of [
    ["Remaster", "A new version of the sound, cleaned up from the original recordings."],
    ["first pressing", "The very first batch of a record, made when the album came out."],
  ]) {
    const button = page.getByRole("button", { name: term, exact: true }).first();
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("note").filter({ hasText: explanation }).first()).toBeVisible();
  }
});

test("track list is collapsed until tapped; extra tracks show Bonus", async ({ page }) => {
  await page.goto(url("price"));
  const firstTrack = page.getByText("Five Years");
  await expect(firstTrack).toBeHidden();
  await page.getByText(/^Track list/).click();
  await expect(firstTrack).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: "Velvet Goldmine" })).toContainText("Bonus");
  await expect(page.getByRole("listitem").filter({ hasText: "Starman" })).not.toContainText("Bonus");
});

test("Change → priorities screen with the ranking filled in", async ({ page }) => {
  await page.goto(url("sound,price"));
  await expect(page.getByText("Based on: Sound, Price")).toBeVisible();
  await page.getByRole("link", { name: "Change" }).click();
  await expect(page).toHaveURL(`/albums/${ZIGGY_ID}/priorities?priorities=sound,price`);
  await expect(page.getByRole("button", { name: /^Sound/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: /^Price/ })).toHaveAttribute("aria-pressed", "true");
});

test("See verified listings: a button on phone only (listings sit beside on desktop, story 5)", async ({ page, isMobile }) => {
  await page.goto(url("price,sound"));
  const button = page.getByRole("link", { name: "See verified listings" });
  if (isMobile) await expect(button).toBeVisible();
  else await expect(button).toBeHidden();
});

// Design option A (recommendation screen). The back button goes on both sizes ("Change" stays); the rest is desktop only.
test("no back button; the Illustrative data label stays", async ({ page }) => {
  await page.goto(url("price,sound"));
  await expect(page.getByRole("link", { name: "Back to priorities" })).toHaveCount(0);
  await expect(page.getByText("Illustrative data", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Change" })).toBeVisible();
});

test("a version without tracks shows no 'Track list'", async ({ page }) => {
  await page.goto(`/albums/${LETS_DANCE_ID}/recommendation?priorities=price`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("1983 US original");
  await expect(page.getByText(/^Track list/)).toHaveCount(0);
});

test("fair price bar and Compare pressings: under the listings on desktop; Compare in the left column on phone", async ({ page, isMobile }) => {
  await page.goto(url("price,sound"));
  const beside = page.getByRole("complementary", { name: "Verified listings for this version" });
  if (isMobile) {
    await expect(page.getByRole("img", { name: /against the typical range/ })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Compare pressings" })).toBeVisible();
    return;
  }
  await expect(beside.getByRole("img", { name: "The lowest price, €32, against the typical range €28 to €36" })).toBeVisible();
  await expect(beside.getByText("Typical price for this pressing: €28–€36")).toBeVisible(); // the sentence stays
  await expect(beside.getByRole("link", { name: "Compare pressings" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Compare pressings" })).toHaveCount(1); // not twice
});
