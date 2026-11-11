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
  const documentHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  expect(box!.y + box!.height).toBeGreaterThanOrEqual(viewport.height - 1); // at least the bottom of the window
  expect(box!.y + box!.height).toBeCloseTo(documentHeight, 0); // and nothing sits below it: no gap, not floating in the middle
});

test("phone: the footer is not shown", async ({ page }, info) => {
  phoneOnly(info);
  await page.goto("/");
  await expect(page.getByText("This week at the shop")).toBeVisible();
  await expect(footer(page)).toBeHidden();
  await screenshot(page, 14, "footer");
});

// Bug 25: the footer text starts at the same left edge as the header text (desktop).
test("desktop: the footer text and the header text share the same left edge (bug 25)", async ({ page }, info) => {
  desktopOnly(info);
  await page.goto("/");
  const headerName = page.locator("header").getByRole("link", { name: "SPINDLE", exact: true }).first();
  const footerName = footer(page).getByText("SPINDLE", { exact: true });
  const [h, f] = await Promise.all([headerName.boundingBox(), footerName.boundingBox()]);
  expect(Math.abs(h!.x - f!.x)).toBeLessThan(2);
});
