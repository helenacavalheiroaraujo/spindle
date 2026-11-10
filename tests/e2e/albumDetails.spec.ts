// Album with no listings: details from MusicBrainz and Wikipedia — run on phone and desktop (playwright.config.ts).
// These tests call the live services (MusicBrainz, Wikipedia): they need an internet connection.
import { expect, test } from "@playwright/test";
import { screenshot } from "./screenshot";

const KIND_OF_BLUE = "/albums/10000000-0000-0000-0000-000000000008";

test("Kind of Blue (no listings): still says nobody is selling it, and shows release date, label, musician and tracks", async ({ page }) => {
  await page.goto(KIND_OF_BLUE);
  await expect(page.getByRole("heading", { level: 1, name: "Kind of Blue" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Nobody is selling this album right now" })).toBeVisible();

  await expect(page.getByText("17 August 1959")).toBeVisible();
  await expect(page.getByText("Columbia", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "About Miles Davis" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Read more on Wikipedia" })).toHaveAttribute("href", /wikipedia\.org/);

  const tracks = page.getByRole("list").filter({ has: page.getByText("So What", { exact: true }) });
  await expect(tracks.getByRole("listitem")).toHaveCount(5);
  await expect(tracks.getByRole("listitem").nth(0)).toContainText("So What");
  await expect(tracks.getByRole("listitem").nth(4)).toContainText("Flamenco Sketches");

  await expect(page.getByText("Source: MusicBrainz · Wikipedia")).toBeVisible();
  await expect(page.getByText("Illustrative data")).toHaveCount(0);

  await screenshot(page, "bug-17", "album-details");
});
