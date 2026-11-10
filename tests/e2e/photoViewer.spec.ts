// Bug 13 · Photo viewer on the listing check screen (design option A) — run on phone and desktop.
// Uses the illustrative data in supabase/seed.sql.
import { expect, test, type Page } from "@playwright/test";
import { screenshot } from "./screenshot";

const V2012 = "20000000-0000-0000-0000-000000000003";
const V1990 = "20000000-0000-0000-0000-000000000002";
const GREEN_32 = "40000000-0000-0000-0000-000000000005"; // cover, record and matrix photos
const NO_MATRIX_30 = "40000000-0000-0000-0000-000000000002"; // no matrix photo
const viewer = (page: Page) => page.getByRole("dialog", { name: "Photo viewer" });

test("tapping a photo opens it full screen; Close and Escape close it", async ({ page }) => {
  await page.goto(`/listings/${GREEN_32}?version=${V2012}`);
  await expect(viewer(page)).toBeHidden();
  await screenshot(page, "bug-13", "photos-small");
  await page.getByRole("button", { name: "Enlarge record photo" }).click();
  await expect(viewer(page)).toBeVisible();
  await expect(viewer(page).getByText("Record · 2 of 3")).toBeVisible();
  await expect(viewer(page).getByText("Swipe for the next photo · double-tap to zoom")).toBeVisible();
  await screenshot(page, "bug-13", "viewer-open");
  await viewer(page).getByRole("button", { name: "Close" }).click();
  await expect(viewer(page)).toBeHidden();
  await page.getByRole("button", { name: "Enlarge cover photo" }).click();
  await expect(viewer(page).getByText("Cover · 1 of 3")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(viewer(page)).toBeHidden();
});

test("the arrows move between cover, record and matrix and stop at the ends", async ({ page }) => {
  await page.goto(`/listings/${GREEN_32}?version=${V2012}`);
  await page.getByRole("button", { name: "Enlarge cover photo" }).click();
  await expect(viewer(page).getByRole("button", { name: "Previous photo" })).toBeDisabled();
  await viewer(page).getByRole("button", { name: "Next photo" }).click();
  await expect(viewer(page).getByText("Record · 2 of 3")).toBeVisible();
  await viewer(page).getByRole("button", { name: "Next photo" }).click();
  await expect(viewer(page).getByText("Matrix · 3 of 3")).toBeVisible();
  await expect(viewer(page).getByRole("button", { name: "Next photo" })).toBeDisabled();
  await viewer(page).getByRole("button", { name: "Previous photo" }).click();
  await expect(viewer(page).getByText("Record · 2 of 3")).toBeVisible();
});

test("swiping left shows the next photo, swiping right the previous one", async ({ page }) => {
  await page.goto(`/listings/${GREEN_32}?version=${V2012}`);
  await page.getByRole("button", { name: "Enlarge cover photo" }).click();
  const img = viewer(page).getByRole("img");
  const box = (await img.boundingBox())!;
  const y = box.y + box.height / 2;
  const drag = async (from: number, to: number) => {
    await page.mouse.move(from, y);
    await page.mouse.down();
    await page.mouse.move(to, y, { steps: 5 });
    await page.mouse.up();
  };
  const mid = box.x + box.width / 2;
  await drag(mid + 80, mid - 80);
  await expect(viewer(page).getByText("Record · 2 of 3")).toBeVisible();
  await drag(mid - 80, mid + 80);
  await expect(viewer(page).getByText("Cover · 1 of 3")).toBeVisible();
});

test("a double tap zooms in, another zooms out; moving to another photo resets the zoom", async ({ page }) => {
  await page.goto(`/listings/${GREEN_32}?version=${V2012}`);
  await page.getByRole("button", { name: "Enlarge cover photo" }).click();
  const img = viewer(page).getByRole("img");
  const box = (await img.boundingBox())!;
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  const tap = async () => {
    await page.mouse.click(x, y);
  };
  await expect(img).not.toHaveClass(/scale-\[2\.5\]/);
  await tap();
  await tap();
  await expect(img).toHaveClass(/scale-\[2\.5\]/);
  await screenshot(page, "bug-13", "viewer-zoomed");
  await viewer(page).getByRole("button", { name: "Next photo" }).click();
  await expect(viewer(page).getByRole("img")).not.toHaveClass(/scale-\[2\.5\]/);
  await tap();
  await tap();
  await tap();
  await tap();
  await expect(viewer(page).getByRole("img")).not.toHaveClass(/scale-\[2\.5\]/);
});

test("a listing without a matrix photo: only two photos in the viewer, the empty slot is not tappable", async ({ page }) => {
  await page.goto(`/listings/${NO_MATRIX_30}?version=${V1990}`);
  await expect(page.getByRole("button", { name: "Enlarge matrix photo" })).toHaveCount(0);
  await expect(page.getByText("No matrix photo", { exact: true }).last()).toBeVisible();
  await page.getByRole("button", { name: "Enlarge record photo" }).click();
  await expect(viewer(page).getByText("Record · 2 of 2")).toBeVisible();
  await expect(viewer(page).getByRole("button", { name: "Next photo" })).toBeDisabled();
});
