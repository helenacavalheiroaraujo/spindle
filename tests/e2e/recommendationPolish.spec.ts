// Story 25 · Recommendation page polish — run on phone and desktop (playwright.config.ts).
// Uses the illustrative data in supabase/seed.sql.
import { expect, test, type Page } from "@playwright/test";

const ZIGGY_ID = "10000000-0000-0000-0000-000000000001";
const url = `/albums/${ZIGGY_ID}/recommendation?priorities=price,sound`;
// Desktop and phone each render some blocks; only the copy that is on screen counts.
const shown = (page: Page, text: string | RegExp) => page.getByText(text).and(page.locator(":visible"));

test("desktop: the track list sits under the cover, and the reasons are three cards side by side", async ({ page, isMobile }) => {
  test.skip(isMobile, "Desktop layout only (story 25, option A4).");
  await page.goto(url);
  const cover = page.locator('img[width="400"]');
  const tracks = page.locator("details:visible").filter({ hasText: /^Track list/ });
  const reasons = page.getByRole("list", { name: "Why this one" }).getByRole("listitem");
  const getThisOne = shown(page, "Get this one");

  await expect(tracks).toHaveCount(1);
  await expect(reasons.first()).toBeVisible();
  const [c, t, first, last, head] = await Promise.all([
    cover.boundingBox(),
    tracks.boundingBox(),
    reasons.first().boundingBox(),
    reasons.last().boundingBox(),
    getThisOne.boundingBox(),
  ]);

  // The track list is in the left column, below the cover.
  expect(t!.y).toBeGreaterThan(c!.y + c!.height - 1);
  expect(t!.x + t!.width).toBeLessThanOrEqual(first!.x);

  // Every reason is a card on one row, left to right.
  const all = await reasons.all();
  expect(all.length).toBeGreaterThanOrEqual(2);
  const boxes = await Promise.all(all.map((l) => l.boundingBox()));
  for (const b of boxes) expect(Math.abs(b!.y - boxes[0]!.y)).toBeLessThan(2);
  for (let i = 1; i < boxes.length; i++) expect(boxes[i]!.x).toBeGreaterThan(boxes[i - 1]!.x);
  expect(last!.x).toBeGreaterThan(first!.x);

  // "Get this one" starts level with the top of the cover.
  expect(Math.abs(head!.y - c!.y)).toBeLessThan(4);
});

test("the typical price is shown as a sentence labelled illustrative, with no price slider", async ({ page, isMobile }) => {
  await page.goto(url);
  await expect(page.getByRole("slider")).toHaveCount(0);
  await expect(page.locator('input[type="range"]')).toHaveCount(0);
  await expect(shown(page, "Illustrative data").first()).toBeVisible();
  if (!isMobile) {
    await expect(shown(page, /^Typical price for this pressing:/)).toBeVisible();
  }
});

test("reissue and first pressing are plain text; the ratings line has no second label", async ({ page }) => {
  await page.goto(url);
  await expect(page.getByRole("button", { name: /reissue/i })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /first pressing/i })).toHaveCount(0);
  await expect(page.getByText(/Based on \d+ collector ratings$/)).toBeVisible();
});
