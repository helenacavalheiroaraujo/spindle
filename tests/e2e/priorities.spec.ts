// Story 2 · Say what matters to me — critical flow, run on phone and desktop (playwright.config.ts).
// Uses the illustrative data in supabase/seed.sql.
import { expect, test, type Page } from "@playwright/test";
import { typeSearch } from "./searchBox";

const ZIGGY_ID = "10000000-0000-0000-0000-000000000001";
const PRIORITIES_URL = `/albums/${ZIGGY_ID}/priorities`;

const option = (page: Page, name: string) => page.getByRole("button", { name: new RegExp(`^${name}`) });
const seeRecommendation = (page: Page) => page.getByRole("button", { name: "See recommendation" });

async function expectRanks(page: Page, ranks: Record<string, number | null>) {
  for (const [name, rank] of Object.entries(ranks)) {
    const button = option(page, name);
    if (rank === null) {
      await expect(button).toHaveAttribute("aria-pressed", "false");
      await expect(button).not.toContainText(/rank/);
    } else {
      await expect(button).toHaveAttribute("aria-pressed", "true");
      await expect(button.locator("span[aria-hidden]").first()).toHaveText(String(rank)); // visible number
      await expect(button).toHaveAccessibleName(new RegExp(`rank ${rank}$`));
    }
  }
}

test("search → tap an album → priorities screen with the album and four options", async ({ page }) => {
  await page.goto("/");
  await typeSearch(page, "ziggy");
  await page.getByRole("listitem").filter({ hasText: "Ziggy Stardust" }).getByRole("link").click();
  await expect(page).toHaveURL(PRIORITIES_URL);
  await expect(page.getByRole("heading", { name: "What matters most to you?" })).toBeVisible();
  await expect(page.getByText("David Bowie · 3 versions to choose from")).toBeVisible();
  for (const [name, line] of [
    ["Sound", "I want the best-sounding one"],
    ["Price", "I don't want to overpay"],
    ["Original", "I want the first pressing"],
    ["Condition", "I want a near-mint copy"],
  ]) {
    await expect(option(page, name)).toContainText(line);
  }
});

test("'See recommendation' is disabled until an option is picked, and again when all are unpicked", async ({ page }) => {
  await page.goto(PRIORITIES_URL);
  await expect(seeRecommendation(page)).toBeDisabled();
  await option(page, "Price").click();
  await expect(seeRecommendation(page)).toBeEnabled();
  await option(page, "Price").click();
  await expect(seeRecommendation(page)).toBeDisabled();
});

test("ranks follow tap order, all four can be picked, and unpicking closes the gap", async ({ page }) => {
  await page.goto(PRIORITIES_URL);
  for (const name of ["Price", "Sound", "Condition", "Original"]) await option(page, name).click();
  await expectRanks(page, { Price: 1, Sound: 2, Condition: 3, Original: 4 });

  await option(page, "Sound").click();
  await expectRanks(page, { Price: 1, Sound: null, Condition: 2, Original: 3 });
});

test("the recommendation receives the options in rank order", async ({ page }) => {
  await page.goto(PRIORITIES_URL);
  await option(page, "Condition").click();
  await option(page, "Price").click();
  await seeRecommendation(page).click();
  // Story 3 is not built yet: only the address is checked.
  await page.waitForURL(`**/albums/${ZIGGY_ID}/recommendation?*`);
  expect(new URL(page.url()).searchParams.get("priorities")).toBe("condition,price");
});

test("'Change' (address with a ranking) opens the screen with that ranking filled in", async ({ page }) => {
  await page.goto(`${PRIORITIES_URL}?priorities=sound,price`);
  await expectRanks(page, { Sound: 1, Price: 2, Original: null, Condition: null });
  await expect(seeRecommendation(page)).toBeEnabled();
});

test("an unknown album shows the not-found page", async ({ page }) => {
  // The loading mask streams first, so the status stays 200; check what the buyer sees.
  for (const id of ["not-an-album", "10000000-0000-0000-0000-999999999999"]) {
    await page.goto(`/albums/${id}/priorities`);
    await expect(page.getByText("This page could not be found.")).toBeVisible();
  }
});
