// Screenshots for the submission PDF of stories 1, 2, 3, 5 and 6 (docs/screenshots/story-N/). They had been taken on 9 Nov with
// the old design and no test produced them, so they no longer matched the app. Each one is saved only when SCREENSHOTS=1
// (npm run screenshots); in a normal run the tests only check that the screen opens. Phone and desktop (playwright.config.ts).
import { expect, test, type Page } from "@playwright/test";
import { screenshot } from "./screenshot";

const ZIGGY_ID = "10000000-0000-0000-0000-000000000001";
const V1972 = "20000000-0000-0000-0000-000000000001";
const V1990 = "20000000-0000-0000-0000-000000000002";
const V2012 = "20000000-0000-0000-0000-000000000003";
const V_HUNKY_2015 = "20000000-0000-0000-0000-000000000005";
const GREEN_32 = "40000000-0000-0000-0000-000000000005";
const NO_MATRIX_30 = "40000000-0000-0000-0000-000000000002";
const RED_29 = "40000000-0000-0000-0000-000000000008"; // claimed 2012 Remaster, actually 1990 Reissue
const recommendation = (priorities: string) => `/albums/${ZIGGY_ID}/recommendation?priorities=${priorities}`;
// On desktop the listings load beside the recommendation: wait until they have, so the picture does not show the mask.
const listingsLoaded = (page: Page) => expect(page.getByRole("status").filter({ hasText: "Checking listings…" })).toHaveCount(0);

test("story 1 · fewer than 3 characters, and no match", async ({ page }) => {
  await page.goto("/search?q=zi");
  await expect(page.getByText("Type at least 3 characters to search.").first()).toBeVisible();
  await screenshot(page, 1, "search-too-short");
  await page.goto("/search?q=xqzvbn");
  await expect(page.getByText(/No albums found/).first()).toBeVisible();
  await screenshot(page, 1, "search-no-albums-found");
});

test("story 2 · priorities screen, empty and ranked", async ({ page }) => {
  await page.goto(`/albums/${ZIGGY_ID}/priorities`);
  await expect(page.getByRole("button", { name: "See recommendation" })).toBeDisabled();
  await screenshot(page, 2, "priorities-empty");
  await page.getByRole("button", { name: /^Price/ }).click();
  await page.getByRole("button", { name: /^Sound/ }).click();
  await expect(page.getByRole("button", { name: "See recommendation" })).toBeEnabled();
  await page.mouse.move(0, 0); // no hover on the last option
  await screenshot(page, 2, "priorities-ranked");
});

test("story 3 · the recommendation in four cases", async ({ page }) => {
  await page.goto(recommendation("price,sound"));
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  await listingsLoaded(page);
  await screenshot(page, 3, "recommendation-price-sound");
  await page.goto(recommendation("price"));
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  await listingsLoaded(page);
  await screenshot(page, 3, "recommendation-price-only");
  await page.goto(recommendation("original,sound"));
  await expect(page.getByText(/The ideal pressing for your priorities is the 1972 UK original/)).toBeVisible();
  await listingsLoaded(page);
  await screenshot(page, 3, "recommendation-ideal-unavailable");
  await page.goto(recommendation("price,sound"));
  await page.getByRole("button", { name: "Remaster", exact: true }).first().click();
  await page.getByText(/^Track list/).and(page.locator(":visible")).click();
  await expect(page.getByText("Five Years").and(page.locator(":visible"))).toBeVisible();
  await listingsLoaded(page);
  await screenshot(page, 3, "recommendation-glossary-tracks");
});

test("story 5 · the listings and the check screens", async ({ page }) => {
  await page.goto(`/versions/${V2012}/listings`);
  await expect(page.getByRole("list", { name: "Verified listings" }).getByRole("listitem")).toHaveCount(3);
  await screenshot(page, 5, "listings");
  await page.getByRole("list", { name: "Verified listings" }).getByRole("listitem").nth(1).getByRole("button", { name: /^Buy/ }).click();
  await expect(page.getByRole("group", { name: "Before you buy" })).toBeVisible();
  await screenshot(page, 5, "listings-yellow-warning");
  await page.goto(`/listings/${GREEN_32}?version=${V2012}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Is it really this one?");
  await screenshot(page, 5, "listing-check-green");
  await page.goto(`/listings/${NO_MATRIX_30}?version=${V1990}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Is it really this one?");
  await screenshot(page, 5, "listing-check-yellow-no-matrix");
  await page.goto(`/listings/${RED_29}?version=${V2012}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Is it really this one?");
  await screenshot(page, 5, "listing-check-red");
  await page.goto(`/listings/${RED_29}?version=${V1990}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Is it really this one?");
  await screenshot(page, 5, "listing-check-moved-here");
});

test("story 6 · price labels, a red listing and a version without a range", async ({ page }) => {
  await page.goto(`/versions/${V2012}/listings`);
  await expect(page.getByText("Typical price for this pressing: €28–€36")).toBeVisible();
  await screenshot(page, 6, "fair-price-labels");
  await page.goto(`/versions/${V1972}/listings`);
  await expect(page.getByText("Typical price for this pressing: €150–€220")).toBeVisible();
  await screenshot(page, 6, "fair-price-red-actual-range");
  await page.goto(`/versions/${V_HUNKY_2015}/listings`);
  await expect(page.getByText(/Typical price for this pressing/)).toHaveCount(0);
  await screenshot(page, 6, "fair-price-no-range");
});
