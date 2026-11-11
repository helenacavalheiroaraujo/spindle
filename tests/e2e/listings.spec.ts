// Story 5 · See verified listings — critical flow, run on phone and desktop (playwright.config.ts).
// Uses the illustrative data in supabase/seed.sql.
import { expect, test, type Page } from "@playwright/test";

const ZIGGY_ID = "10000000-0000-0000-0000-000000000001";
const V1972 = "20000000-0000-0000-0000-000000000001";
const V1990 = "20000000-0000-0000-0000-000000000002";
const V2012 = "20000000-0000-0000-0000-000000000003";
const rows = (page: Page) => page.getByRole("list", { name: "Verified listings" }).getByRole("listitem");

test("recommended version's listings: own screen on phone, beside the recommendation on desktop", async ({ page, isMobile }) => {
  await page.goto(`/albums/${ZIGGY_ID}/recommendation?priorities=price,sound`);
  if (isMobile) {
    await page.getByRole("link", { name: "See verified listings" }).click();
    await expect(page).toHaveURL(`/versions/${V2012}/listings?priorities=price,sound`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("2 for sale · 1 moved");
    await expect(page.getByRole("link", { name: "Back to the recommendation" })).toHaveCount(0); // no back link (DECISIONS 2026-11-11)
    await page.goBack();
    await expect(page).toHaveURL(`/albums/${ZIGGY_ID}/recommendation?priorities=price,sound`);
  } else {
    await expect(page).toHaveURL(`/albums/${ZIGGY_ID}/recommendation?priorities=price,sound`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("2012 Remaster");
    const beside = page.getByRole("complementary", { name: "Verified listings for this version" });
    await expect(beside.getByRole("heading", { level: 2 })).toHaveText("2 for sale · 1 moved");
    await expect(rows(page)).toHaveCount(3);
    await expect(rows(page).nth(0)).toContainText("€32");
    // A listing opened from beside the recommendation goes back to the recommendation.
    await page.getByRole("link", { name: /^Open €36/ }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Is it really this one?");
    await page.goBack(); // bug 16: no back button on the check screen; browser Back is used
    await expect(page).toHaveURL(`/albums/${ZIGGY_ID}/recommendation?priorities=price,sound`);
  }
});

test("desktop: if the listings beside fail, only that area shows the error; Try again recovers", async ({ page, isMobile }) => {
  test.skip(isMobile, "on phone the listings open on their own screen");
  // Cut only the listings request (Next.js server actions are POSTs with a "next-action" header).
  let fail = true;
  await page.route("**/*", (route) => {
    const r = route.request();
    if (fail && r.method() === "POST" && r.headers()["next-action"]) return route.abort();
    return route.continue();
  });
  await page.goto(`/albums/${ZIGGY_ID}/recommendation?priorities=price,sound`);
  const beside = page.getByRole("complementary", { name: "Verified listings for this version" });
  const alert = beside.getByRole("alert").filter({ hasText: "We couldn't load the listings" });
  await expect(alert).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("2012 Remaster");

  fail = false;
  await alert.getByRole("button", { name: "Try again" }).click();
  await expect(rows(page)).toHaveCount(3);
  await expect(alert).toHaveCount(0);
});

test("green and yellow cheapest first, red last although cheapest; every light shows its word", async ({ page }) => {
  await page.goto(`/versions/${V2012}/listings`);
  await expect(rows(page)).toHaveCount(3);
  await expect(rows(page).nth(0)).toContainText("€32");
  await expect(rows(page).nth(0)).toContainText("Match");
  await expect(rows(page).nth(1)).toContainText("€36");
  await expect(rows(page).nth(1)).toContainText("Check");
  await expect(rows(page).nth(2)).toContainText("No match");
  await expect(page.getByText("Check results and typical prices are illustrative data")).toBeVisible();
});

test("red listing: moved to its version, not for sale here, no Buy button", async ({ page }) => {
  await page.goto(`/versions/${V2012}/listings`);
  const red = rows(page).nth(2);
  await expect(red).toContainText("It's a different pressing · moved to 1990 Reissue");
  await expect(red).toContainText("Not for sale here");
  await expect(red.getByRole("button", { name: /^Buy/ })).toHaveCount(0);
});

test("the condition is shown in plain words", async ({ page }) => {
  await page.goto(`/versions/${V2012}/listings`);
  await expect(rows(page).nth(1)).toContainText("Very good (VG+): light signs of wear");
});

test("sellers: a shop shows its name and a Shop tag; others show Private seller; no personal names (story 9 · #64)", async ({ page }) => {
  await page.goto(`/versions/${V1990}/listings`);
  const shop = rows(page).filter({ hasText: "€30" });
  await expect(shop).toContainText(/Discos do Rui\s*Shop, Lisboa/); // the tag follows the name (UX #15)
  await expect(shop.getByText("Shop", { exact: true })).toBeVisible();
  await expect(rows(page).filter({ hasText: "€24" })).toContainText("Private seller, Porto");
  await expect(page.getByText(/Ana Sousa|Rui Ferreira|Marta Lopes|João Pinto/)).toHaveCount(0);
});

test("yellow: Buy first shows what is uncertain; Back closes it; Continue to checkout leads to the checkout", async ({ page }) => {
  await page.goto(`/versions/${V2012}/listings`);
  await rows(page).nth(1).getByRole("button", { name: /^Buy/ }).click();
  const before = page.getByRole("group", { name: "Before you buy" });
  await expect(before).toContainText("The matrix photo isn't sharp. If it turns out to be another pressing, you get your money back.");
  await expect(before.getByRole("link", { name: "Continue to checkout" })).toHaveAttribute(
    "href",
    `/checkout/40000000-0000-0000-0000-000000000006?version=${V2012}`,
  );
  await before.getByRole("button", { name: "Back" }).click();
  await expect(before).toHaveCount(0);
});

test("green: Buy goes straight to the checkout, with no warning (finding #57)", async ({ page }) => {
  await page.goto(`/versions/${V2012}/listings`);
  await expect(rows(page).nth(0).getByRole("link", { name: /^Buy/ })).toHaveAttribute(
    "href",
    `/checkout/40000000-0000-0000-0000-000000000005?version=${V2012}`,
  );
  await expect(page.getByRole("group", { name: "Before you buy" })).toHaveCount(0);
});

test("1990 Reissue: listings moved here are yellow with 'Moved here · check pending'", async ({ page }) => {
  await page.goto(`/versions/${V1990}/listings`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("4 for sale");
  const prices = await rows(page).locator("span.text-lg").allTextContents();
  expect(prices).toEqual(["€24", "€29", "€30", "€185"]);
  const moved = rows(page).filter({ hasText: "Moved here · check pending" });
  await expect(moved).toHaveCount(2);
  await expect(moved.first()).toContainText("Check");
  await moved.first().getByRole("button", { name: /^Buy/ }).click();
  await expect(page.getByRole("group", { name: "Before you buy" })).toContainText(
    "This copy was listed as another pressing and hasn't been checked against this one yet.",
  );
});

test("missing matrix photo → yellow, never green, and the warning says so", async ({ page }) => {
  await page.goto(`/versions/${V1990}/listings`);
  const noPhoto = rows(page).filter({ hasText: "€30" });
  await expect(noPhoto).toContainText("Check");
  await noPhoto.getByRole("button", { name: /^Buy/ }).click();
  await expect(page.getByRole("group", { name: "Before you buy" })).toContainText("There's no matrix photo.");
});

test("all listings red: no Buy button anywhere and a message", async ({ page }) => {
  await page.goto(`/versions/${V1972}/listings`);
  await expect(page.getByText("No listing matches this version yet")).toBeVisible();
  await expect(page.getByRole("button", { name: /^Buy/ })).toHaveCount(0);
});

test("an unknown version shows the not-found page", async ({ page }) => {
  // With a loading screen the status is sent before the page knows; check what the buyer sees.
  await page.goto(`/versions/not-a-version/listings`);
  await expect(page.getByText("This page could not be found.")).toBeVisible();
});
