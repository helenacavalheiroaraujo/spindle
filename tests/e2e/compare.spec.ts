// Story 4 · Compare versions — critical flow, run on phone and desktop (playwright.config.ts).
// Uses the illustrative data in supabase/seed.sql: only the 2012 Remaster and the 1990 Reissue have active
// listings (the 1972 original's only listing is red), so both screen sizes show 2 versions here; the
// 2 / 3 rule is covered by tests/unit/compare.test.ts.
import { expect, test, type Page } from "@playwright/test";
import { screenshot } from "./screenshot";

const ZIGGY_ID = "10000000-0000-0000-0000-000000000001";
const BLACKSTAR_ID = "10000000-0000-0000-0000-000000000004";
const V1990 = "20000000-0000-0000-0000-000000000002";
const recommendation = (priorities: string) => `/albums/${ZIGGY_ID}/recommendation?priorities=${priorities}`;
const compare = (priorities: string) => `/albums/${ZIGGY_ID}/compare?priorities=${priorities}`;
const table = (page: Page) => page.getByRole("table", { name: /Compare pressings of/ });
const rowLabels = (page: Page) => table(page).getByRole("rowheader").allInnerTexts();

test("recommendation → Compare pressings → recommended version first, then the next best", async ({ page, isMobile }) => {
  await page.goto(recommendation("price,sound"));
  await page.getByRole("link", { name: "Compare pressings" }).click();
  await expect(page).toHaveURL(compare("price,sound"));
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Compare pressings");

  const heads = table(page).getByRole("columnheader");
  await expect(heads).toHaveCount(2);
  await expect(heads.nth(0)).toContainText("★ Recommended");
  await expect(heads.nth(0)).toContainText("2012");
  await expect(heads.nth(1)).toContainText("Next best");
  await expect(heads.nth(1)).toContainText("1990");
  // Finding #25: a shorter link text on a phone, so it stays on one line.
  await expect(heads.nth(1).getByRole("link", { name: isMobile ? /See version/ : /See this version/ })).toBeVisible();
  await screenshot(page, 4, "compare");
});

test("rows: the buyer's priorities first in rank order and marked, the rest in fixed order; values from the data", async ({ page }) => {
  await page.goto(compare("price,sound"));
  const labels = (await rowLabels(page)).map((t) => t.replace(/\s+/g, " ").trim());
  expect(labels).toEqual([
    "Typical price Your #1",
    "Sound Your #2",
    "First pressing",
    "Best condition on sale",
    "For sale",
  ]);
  const cells = (row: string) => table(page).getByRole("row", { name: new RegExp(`^${row}`) }).getByRole("cell");
  await expect(cells("Typical price")).toHaveText(["€28–€36", "€20–€28"]);
  await expect(cells("Sound")).toHaveText(["Very clean", "A bit flat"]);
  await expect(cells("First pressing")).toHaveText(["No", "No"]);
  await expect(cells("Best condition on sale")).toHaveText(["Near mint", "Very good"]);
  await expect(cells("For sale")).toHaveText(["2", "4"]);
  // No 1–5 scores are shown.
  await expect(table(page).getByText(/\b[1-5] ?\/ ?5\b/)).toHaveCount(0);
});

test("a different ranking changes the order of the rows and of the columns", async ({ page }) => {
  await page.goto(compare("condition,original"));
  const labels = (await rowLabels(page)).map((t) => t.replace(/\s+/g, " ").trim());
  expect(labels).toEqual([
    "Best condition on sale Your #1",
    "First pressing Your #2",
    "Typical price",
    "Sound",
    "For sale",
  ]);
  const heads = table(page).getByRole("columnheader");
  await expect(heads.nth(0)).toContainText("2012"); // Near mint wins
});

test("tapping a version opens its page with its priorities and listings; browser Back returns to compare", async ({ page, isMobile }) => {
  await page.goto(compare("price,sound"));
  await table(page).getByRole("link", { name: /1990/ }).click();
  await expect(page).toHaveURL(`/versions/${V1990}?priorities=price,sound`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("1990 Reissue");
  const fit = page.getByRole("list", { name: "Fit with your priorities" }).getByRole("listitem");
  await expect(fit).toHaveText(["Matches: price", "Not a match: sound"]);
  await expect(page.getByRole("list", { name: "How it fits your priorities" }).getByRole("listitem")).toHaveCount(2);

  if (isMobile) {
    await expect(page.getByRole("link", { name: "See verified listings" })).toBeVisible();
  } else {
    await expect(page.getByRole("complementary", { name: "Verified listings for this version" })).toBeVisible();
    await expect(page.getByRole("link", { name: "See verified listings" })).toBeHidden();
  }
  await screenshot(page, 4, "version");

  await expect(page.getByRole("link", { name: "Back to compare" })).toHaveCount(0); // no back link (DECISIONS 2026-11-11)
  await page.goBack();
  await expect(page).toHaveURL(compare("price,sound"));
});

test("nothing to compare: Compare pressings is not shown, and the compare address goes back to the recommendation", async ({ page }) => {
  // Blackstar has no active listings and no test touches it. "Exactly one version on sale" is only in
  // tests/unit/compare.test.ts: the albums that have one are changed by the sell and checkout tests while this runs.
  const blackstar = (path: string) => `/albums/${BLACKSTAR_ID}/${path}?priorities=price`;
  await page.goto(blackstar("recommendation"));
  await expect(page.getByText("Nobody is selling this album right now.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Compare pressings" })).toHaveCount(0);
  await page.goto(blackstar("compare"));
  await expect(page).toHaveURL(blackstar("recommendation"));
  await expect(page.getByText("Nobody is selling this album right now.")).toBeVisible();
});

test("compare address without a ranking goes to the priorities screen", async ({ page }) => {
  await page.goto(`/albums/${ZIGGY_ID}/compare`);
  await expect(page).toHaveURL(`/albums/${ZIGGY_ID}/priorities`);
});
