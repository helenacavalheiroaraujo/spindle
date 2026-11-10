// Desktop footer (story 14). Runs on phone (375 px) and desktop (1280 px), see playwright.config.ts.
// The footer shows only on desktop (1280 px and wider), has no links, and sits after the content.
import { expect, test } from "@playwright/test";
import { screenshot } from "./screenshot";

const phoneOnly = (info: { project: { name: string } }) => test.skip(info.project.name !== "phone", "phone only");
const desktopOnly = (info: { project: { name: string } }) => test.skip(info.project.name !== "desktop", "desktop only");
const footer = (page: import("@playwright/test").Page) => page.getByRole("contentinfo");

test("desktop: the footer shows the Spindle name, a line and the illustrative-data note, with no links", async ({ page }, info) => {
  desktopOnly(info);
  await page.goto("/");
  await expect(page.getByText("This week at the shop")).toBeVisible(); // wait for the page to finish loading
  await expect(footer(page)).toBeVisible();
  await expect(footer(page).getByText("SPINDLE")).toBeVisible();
  await expect(footer(page).getByText("We help you pick the right pressing of a vinyl record and buy a verified copy safely.")).toBeVisible();
  await expect(footer(page).getByText("All catalogue data is illustrative")).toBeVisible();
  await expect(footer(page).getByRole("link")).toHaveCount(0); // no links (DECISIONS 2026-11-10)
  await screenshot(page, 14, "footer");
});

test("desktop: the footer comes after the main content, not over it", async ({ page }, info) => {
  desktopOnly(info);
  await page.goto("/");
  await expect(page.getByText("This week at the shop")).toBeVisible();
  const content = await page.getByText("This week at the shop").boundingBox();
  const box = await footer(page).boundingBox();
  expect(box!.y).toBeGreaterThan(content!.y + content!.height);
});

test("desktop: on a short page the footer sits at the bottom of the window", async ({ page }, info) => {
  desktopOnly(info);
  await page.goto("/login");
  await expect(footer(page)).toBeVisible();
  const box = await footer(page).boundingBox();
  const viewport = page.viewportSize()!;
  expect(box!.y + box!.height).toBeCloseTo(viewport.height, 0); // flush with the bottom, not floating in the middle
});

test("phone: the footer is not shown", async ({ page }, info) => {
  phoneOnly(info);
  await page.goto("/");
  await expect(page.getByText("This week at the shop")).toBeVisible();
  await expect(footer(page)).toBeHidden();
  await screenshot(page, 14, "footer");
});
