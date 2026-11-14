// Story 34 · Listen to the album — critical flow, run on phone and desktop (playwright.config.ts).
// iTunes is the local stub (tests/e2e/itunesStub.mjs): Ziggy Stardust matches every track except "It Ain't Easy";
// for Kind of Blue iTunes does not answer. MusicBrainz is its stub too, so Ziggy's tracks come from our database.
import { expect, test } from "@playwright/test";
import { screenshot } from "./screenshot";

const ZIGGY = "/albums/10000000-0000-0000-0000-000000000001";
const KIND_OF_BLUE = "/albums/10000000-0000-0000-0000-000000000008";
const NOTE = "Previews are from the album on iTunes, not from a specific pressing.";

test("Ziggy Stardust: play Starman, then Five Years stops Starman; unmatched track has no button", async ({ page }) => {
  await page.goto(ZIGGY);
  await expect(page.getByText(NOTE)).toBeVisible();

  const tracks = page.getByRole("list").filter({ has: page.getByText("Five Years", { exact: true }) });
  await expect(tracks.getByRole("button", { name: /^Play preview of / })).toHaveCount(10);
  const easy = tracks.getByRole("listitem").filter({ hasText: "It Ain't Easy" });
  await expect(easy.getByRole("button")).toHaveCount(0);

  // Nothing plays by itself.
  await expect(tracks.getByRole("button", { name: /^Pause preview of / })).toHaveCount(0);

  const starman = tracks.getByRole("button", { name: "Play preview of Starman" });
  await expect(starman).toHaveText("▶ Preview");
  expect((await starman.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await starman.click();

  const pauseStarman = tracks.getByRole("button", { name: "Pause preview of Starman" });
  await expect(pauseStarman).toHaveText(/^❚❚ 0:\d\d$/);
  // The time played moves on while it plays.
  await expect(pauseStarman).not.toHaveText("❚❚ 0:00", { timeout: 5000 });
  await expect(pauseStarman).toHaveClass(/bg-navy/);
  await screenshot(page, 34, "album-preview-playing");

  await tracks.getByRole("button", { name: "Play preview of Five Years" }).click();
  await expect(tracks.getByRole("button", { name: "Pause preview of Five Years" })).toBeVisible();
  await expect(tracks.getByRole("button", { name: "Play preview of Starman" })).toHaveText("▶ Preview");
  await expect(tracks.getByRole("button", { name: /^Pause preview of / })).toHaveCount(1);

  // Tapping the playing pill pauses it.
  await tracks.getByRole("button", { name: "Pause preview of Five Years" }).click();
  await expect(tracks.getByRole("button", { name: /^Pause preview of / })).toHaveCount(0);
});

test("iTunes does not answer: no play buttons and no line, the rest of the album page stays", async ({ page }) => {
  await page.goto(KIND_OF_BLUE);
  await expect(page.getByRole("heading", { level: 1, name: "Kind of Blue" })).toBeVisible();
  const tracks = page.getByRole("list").filter({ has: page.getByText("So What", { exact: true }) });
  await expect(tracks.getByRole("listitem")).toHaveCount(5);
  await expect(page.getByText("17 August 1959")).toBeVisible();

  await expect(page.getByRole("button", { name: /preview of/ })).toHaveCount(0);
  await expect(page.getByText(NOTE)).toHaveCount(0);
  await screenshot(page, 34, "album-preview-itunes-down");
});
