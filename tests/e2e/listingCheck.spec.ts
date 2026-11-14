// Story 5 · Listing check screen ("Is it really this one?") — critical flow, run on phone and desktop.
// Uses the illustrative data in supabase/seed.sql.
import { expect, test, type Page } from "@playwright/test";

const V1990 = "20000000-0000-0000-0000-000000000002";
const V2012 = "20000000-0000-0000-0000-000000000003";
const GREEN_32 = "40000000-0000-0000-0000-000000000005";
const NO_MATRIX_30 = "40000000-0000-0000-0000-000000000002";
const RED_29 = "40000000-0000-0000-0000-000000000008"; // claimed 2012 Remaster, actually 1990 Reissue
const checklist = (page: Page) => page.getByRole("list", { name: "Checklist" }).getByRole("listitem");
const result = (page: Page) => page.getByRole("region", { name: "Result" });

test("tapping a listing opens its check screen; browser Back returns to the list", async ({ page }) => {
  await page.goto(`/versions/${V2012}/listings?priorities=price,sound`);
  await page.getByRole("link", { name: /^Open €36/ }).click();
  await expect(page).toHaveURL(/\/listings\/40000000-0000-0000-0000-000000000006\?version=.*priorities=price,sound/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Is it really this one?");
  await expect(page.getByRole("link", { name: /^Back to the/ })).toHaveCount(0); // bug 16: no back button on the screen
  await page.goBack();
  await expect(page).toHaveURL(`/versions/${V2012}/listings?priorities=price,sound`);
});

test("green: summary, three ✓, photos, condition in plain words, Buy with protection without warning", async ({ page }) => {
  await page.goto(`/listings/${GREEN_32}?version=${V2012}`);
  await expect(result(page)).toContainText("Match");
  await expect(result(page)).toContainText("All three checks match this version");
  await expect(checklist(page)).toHaveText([/Cover and label match the version$/, /Country and year match$/, /Matrix photo matches$/]);
  for (const kind of ["cover", "record", "matrix"]) await expect(page.getByRole("img", { name: `${kind} photo` })).toBeVisible();
  await expect(page.getByText("NM means near mint, with no marks, almost like new")).toBeVisible(); // finding #59
  await expect(page.getByRole("link", { name: /^Buy with protection/ })).toHaveAttribute("href", `/checkout/${GREEN_32}?version=${V2012}`);
  await expect(page.getByRole("group", { name: "Before you buy" })).toHaveCount(0);
  await expect(page.getByText("Check results and photos are illustrative data")).toBeVisible();
});

test("yellow without matrix photo: says so in the checklist and the photos, and warns before buying", async ({ page }) => {
  await page.goto(`/listings/${NO_MATRIX_30}?version=${V1990}`);
  await expect(result(page)).toContainText("Check");
  await expect(result(page)).toContainText("One check is uncertain");
  await expect(checklist(page).nth(2)).toContainText("Matrix photo: no photo to check");
  await expect(page.getByText("No matrix photo", { exact: true }).last()).toBeVisible();
  await page.getByRole("button", { name: /^Buy with protection/ }).click();
  await expect(page.getByRole("group", { name: "Before you buy" })).toContainText(
    "There's no matrix photo. If it turns out to be another pressing, you get your money back.",
  );
});

test("red under its claimed version: shows the failed checks and where it moved, no Buy", async ({ page }) => {
  await page.goto(`/versions/${V2012}/listings`);
  await page.getByRole("link", { name: /^Open €29/ }).click();
  await expect(result(page)).toContainText("No match");
  await expect(result(page)).toContainText("It's a different pressing · moved to 1990 Reissue");
  await expect(checklist(page).nth(1)).toContainText("Country and year don't match");
  await expect(page.getByText("Not for sale here")).toBeVisible();
  await expect(page.getByRole("button", { name: /^Buy/ })).toHaveCount(0);
});

test("red: 'moved to 1990 Reissue' on the check screen opens the listings of that version (finding #10)", async ({ page }) => {
  await page.goto(`/versions/${V2012}/listings?priorities=price,sound`);
  await page.getByRole("link", { name: /^Open €29/ }).click();
  await page.getByRole("link", { name: "moved to 1990 Reissue" }).click();
  await expect(page).toHaveURL(`/versions/${V1990}/listings?priorities=price,sound`);
  await expect(page.getByRole("list", { name: "Verified listings" })).toBeVisible();
});

test("red: 'Moved to 1990 Reissue' on the list opens the listings of that version, keeping the priorities (finding #10)", async ({ page }) => {
  await page.goto(`/versions/${V2012}/listings?priorities=price,sound`);
  // Since story 33 the card says "Moved to …" alone; "It's a different pressing" is in its Pressing check line.
  await page.getByRole("link", { name: "Moved to 1990 Reissue" }).click();
  await expect(page).toHaveURL(`/versions/${V1990}/listings?priorities=price,sound`);
  await expect(page.getByRole("link", { name: /^Open €29/ })).toBeVisible(); // there it is yellow ("Moved here")
});

test("same listing under its actual version: yellow, every check pending, warning before buying", async ({ page }) => {
  await page.goto(`/listings/${RED_29}?version=${V1990}`);
  await expect(result(page)).toContainText("Check");
  await expect(result(page)).toContainText("Moved here · check pending");
  await expect(checklist(page)).toHaveText([/Cover and label: check pending$/, /Country and year: check pending$/, /Matrix photo: check pending$/]);
  await page.getByRole("button", { name: /^Buy with protection/ }).click();
  await expect(page.getByRole("group", { name: "Before you buy" })).toContainText("hasn't been checked against this one yet");
});

test("an unknown listing shows the not-found page", async ({ page }) => {
  await page.goto(`/listings/not-a-listing`);
  await expect(page.getByText("This page could not be found.")).toBeVisible();
});
