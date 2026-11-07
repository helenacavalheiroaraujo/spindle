// Story 6 · Fair price — runs on phone and desktop (playwright.config.ts).
// Uses the illustrative data in supabase/seed.sql: 2012 Remaster €28–€36, 1990 Reissue €20–€28,
// 1972 UK original €150–€220, Hunky Dory 2015 Remaster with one listing (€30) and no range.
import { expect, test, type Page } from "@playwright/test";

const ZIGGY_ID = "10000000-0000-0000-0000-000000000001";
const V1972 = "20000000-0000-0000-0000-000000000001";
const V1990 = "20000000-0000-0000-0000-000000000002";
const V2012 = "20000000-0000-0000-0000-000000000003";
const V_HUNKY_2015 = "20000000-0000-0000-0000-000000000005";
const rows = (page: Page) => page.getByRole("list", { name: "Verified listings" }).getByRole("listitem");

test("every listing (green, yellow and red) shows its label; the range is shown below the list", async ({ page }) => {
  await page.goto(`/versions/${V2012}/listings`);
  await expect(rows(page)).toHaveCount(3);
  await expect(rows(page).nth(0)).toContainText("€32Typical"); // green, inside the range
  await expect(rows(page).nth(1)).toContainText("€36Typical"); // yellow, on the top limit
  await expect(rows(page).nth(2)).toContainText("€29Above typical"); // red: compared with its actual 1990 Reissue (€20–€28)
  await expect(page.getByText("Typical price for this pressing: €28–€36")).toBeVisible();
});

test("a red listing is compared with the range of its actual version, not the claimed one", async ({ page }) => {
  // €185 claimed as a 1972 UK original (€150–€220 would say "Typical"); it is a 1990 Reissue.
  await page.goto(`/versions/${V1972}/listings`);
  await expect(rows(page)).toHaveCount(1);
  await expect(rows(page).nth(0)).toContainText("€185Above typical");
  await expect(page.getByText("Typical price for this pressing: €150–€220")).toBeVisible();
});

test("1990 Reissue: typical and above typical, including the listing moved here", async ({ page }) => {
  await page.goto(`/versions/${V1990}/listings`);
  await expect(rows(page).filter({ hasText: "€24" })).toContainText("€24Typical");
  await expect(rows(page).filter({ hasText: "€30" })).toContainText("€30Above typical");
  await expect(rows(page).filter({ hasText: "Moved here" }).first()).toContainText("Above typical");
});

test("a version without a range shows no label and no range line", async ({ page }) => {
  await page.goto(`/versions/${V_HUNKY_2015}/listings`);
  await expect(rows(page)).toHaveCount(1);
  await expect(rows(page).nth(0)).toContainText("€30");
  await expect(page.getByText(/typical/i).filter({ hasNotText: "illustrative" })).toHaveCount(0);
  await expect(page.getByText("Typical price for this pressing")).toHaveCount(0);
});

test("desktop: the labels and the range also show beside the recommendation", async ({ page, isMobile }) => {
  test.skip(isMobile, "on phone the listings open on their own screen (covered above)");
  await page.goto(`/albums/${ZIGGY_ID}/recommendation?priorities=price,sound`);
  const beside = page.getByRole("complementary", { name: "Verified listings for this version" });
  await expect(rows(page).nth(0)).toContainText("€32Typical");
  await expect(beside.getByText("Typical price for this pressing: €28–€36")).toBeVisible();
});
