// Story 33 · "Pressing check" on every listing — run on phone and desktop (playwright.config.ts).
// Uses the illustrative data in supabase/seed.sql.
import { expect, test, type Locator, type Page } from "@playwright/test";
import { screenshot } from "./screenshot";

const ZIGGY_ID = "10000000-0000-0000-0000-000000000001";
const V1990 = "20000000-0000-0000-0000-000000000002";
const V2012 = "20000000-0000-0000-0000-000000000003";
const rows = (page: Page) => page.getByRole("list", { name: "Verified listings" }).getByRole("listitem");

// Tint and border of each light (app/globals.css: --color-tint-* and --color-light-*).
const CARD = {
  green: { bg: "rgb(227, 238, 229)", border: "rgb(63, 122, 75)" },
  yellow: { bg: "rgb(246, 233, 207)", border: "rgb(200, 146, 58)" },
  red: { bg: "rgb(245, 226, 223)", border: "rgb(168, 64, 58)" },
};

async function expectCard(row: Locator, light: keyof typeof CARD, word: string, meaning: string) {
  await expect(row).toContainText(`Pressing check · ${word}`); // the word is always written, never colour alone
  await expect(row).toContainText(meaning);
  await expect(row).toContainText("See the checks");
  await expect(row).toHaveCSS("background-color", CARD[light].bg);
  await expect(row).toHaveCSS("border-top-color", CARD[light].border);
  await expect(row).toHaveCSS("border-top-width", "1px");
}

test("listings screen: green, amber and red cards, each with its Pressing check line; no legend", async ({ page }) => {
  await page.goto(`/versions/${V2012}/listings`);
  await expect(rows(page)).toHaveCount(3);
  await expectCard(rows(page).nth(0), "green", "Match", "All three checks match this version");
  await expectCard(rows(page).nth(1), "yellow", "Check", "At least one check is uncertain");
  await expectCard(rows(page).nth(2), "red", "No match", "It's a different pressing");
  await expect(page.getByText("What do these mean?")).toHaveCount(0);
  await expect(page.getByRole("list", { name: "Traffic light" })).toHaveCount(0);
  await screenshot(page, 33, "listings");
});

test("Moved here · check pending listings are amber with the Check meaning", async ({ page }) => {
  await page.goto(`/versions/${V1990}/listings`);
  const moved = rows(page).filter({ hasText: "Moved here · check pending" });
  await expect(moved).toHaveCount(2);
  await expectCard(moved.first(), "yellow", "Check", "At least one check is uncertain");
});

test("desktop: the listings beside the recommendation are tinted cards with the line; no legend", async ({ page, isMobile }) => {
  test.skip(isMobile, "on phone the listings open on their own screen");
  await page.goto(`/albums/${ZIGGY_ID}/recommendation?priorities=price,sound`);
  const beside = page.getByRole("complementary", { name: "Verified listings for this version" });
  await expect(rows(page)).toHaveCount(3);
  await expectCard(rows(page).nth(0), "green", "Match", "All three checks match this version");
  await expect(beside.getByText("What do these mean?")).toHaveCount(0);
  await expect(beside.getByRole("list", { name: "Traffic light" })).toHaveCount(0);
  await screenshot(page, 33, "recommendation-beside");
});
