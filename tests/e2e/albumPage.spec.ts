// Story 28 · One album page for every album — critical flow, run on phone and desktop (playwright.config.ts).
// Uses the illustrative data in supabase/seed.sql. MusicBrainz is the local stub (answers only for Kind of Blue),
// so Ziggy Stardust gets no tracks from it and shows the fallback list from our database.
// The saved-ranking state is covered in savedPriorities.spec.ts (it needs a signed-in account).
import { expect, test } from "@playwright/test";
import { screenshot } from "./screenshot";

const ZIGGY = "/albums/10000000-0000-0000-0000-000000000001";
const KIND_OF_BLUE = "/albums/10000000-0000-0000-0000-000000000008";
const HUNKY_DORY = "/albums/10000000-0000-0000-0000-000000000002";

test("signed out, an album on sale shows 'Help me choose a version', visible without scrolling, leading to the priorities", async ({ page }) => {
  await page.goto(ZIGGY);
  await expect(page.getByRole("heading", { level: 1, name: /Ziggy Stardust/ })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Several versions are on sale" })).toBeVisible();
  const button = page.getByRole("link", { name: "Help me choose a version" });
  // Fully inside the first screen (375 × 812 on phone, 1280 × 800 on desktop).
  const box = (await button.boundingBox())!;
  expect(box.y + box.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  expect(box.height).toBeGreaterThanOrEqual(44);
  await expect(page.getByText("Based on:")).toHaveCount(0);
  await screenshot(page, 28, "album-page-choose");

  await button.click();
  await expect(page).toHaveURL(`${ZIGGY}/priorities`);
  await expect(page.getByRole("heading", { name: "What matters most to you?" })).toBeVisible();
});

test("MusicBrainz has no tracks: the track list comes from the earliest version, without Bonus tracks", async ({ page }) => {
  await page.goto(ZIGGY);
  const tracks = page.getByRole("list").filter({ has: page.getByText("Five Years", { exact: true }) });
  await expect(tracks.getByRole("listitem")).toHaveCount(11);
  await expect(tracks.getByRole("listitem").nth(10)).toContainText("Rock 'n' Roll Suicide");
  await expect(page.getByText("Velvet Goldmine")).toHaveCount(0);
});

test("an album with no listings keeps the story 21 message and has no action button", async ({ page }) => {
  await page.goto(KIND_OF_BLUE);
  await expect(page.getByRole("heading", { level: 2, name: "Nobody is selling this album right now" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Help me choose a version" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "See your recommendation" })).toHaveCount(0);
  await screenshot(page, 28, "album-page-no-listings");
});

test("an album not in the demo has no page", async ({ page }) => {
  await page.goto(HUNKY_DORY);
  await expect(page.getByText("This page could not be found.")).toBeVisible();
});
