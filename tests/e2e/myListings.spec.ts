// Story 8 · My listings — critical flow, run on phone and desktop (playwright.config.ts).
// Creates a test seller, a temporary version (typical €20–€30) under Hunky Dory and the seller's listings,
// and removes them all afterwards, so the demo data never changes.
import { expect, test, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { screenshot } from "./screenshot";
import { signIn } from "./session";

function env(name: string) {
  if (process.env[name]) return process.env[name]!;
  const line = readFileSync(".env.local", "utf8").split("\n").findLast((l) => l.startsWith(`${name}=`));
  return line?.slice(name.length + 1).trim() ?? "";
}
const admin = () =>
  createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SECRET_KEY"), { auth: { persistSession: false } });

const HUNKY_DORY = "10000000-0000-0000-0000-000000000002";
const PASSWORD = "vinyl-test-123";
let email = "";
let userId = "";
let profileId = "";
let versionId = "";
const ids: Record<"edit" | "remove" | "lost" | "sold" | "gone" | "photo", string> = { edit: "", remove: "", lost: "", sold: "", gone: "", photo: "" };

// A real 1×1 PNG, so the browser can read and reduce it like a camera photo.
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");
const photo = (name: string) => ({ name: `${name}.png`, mimeType: "image/png", buffer: PNG });

async function addListing(price: number, status: "on_sale" | "sold" | "removed" = "on_sale"): Promise<string> {
  const { data, error } = await admin().rpc("create_listing", {
    p_seller_id: profileId,
    p_version_id: versionId,
    p_condition_code: "VG+",
    p_price: price,
    p_cover_photo_url: "/photos/cover.svg",
    p_record_photo_url: "/photos/record.svg",
    p_matrix_photo_url: null,
    p_city: null,
    p_shop_name: null,
  });
  if (error) throw error;
  if (status !== "on_sale") await admin().from("listings").update({ status }).eq("id", data);
  return data as string;
}

test.beforeAll(async ({}, info) => {
  email = `spindle-mylistings-${info.project.name}-${Date.now()}@spindle.test`;
  const user = await admin().auth.admin.createUser({ email, password: PASSWORD, email_confirm: true, user_metadata: { name: "Ana Reis" } });
  if (user.error) throw user.error;
  userId = user.data.user.id;
  const profile = await admin().from("profiles").insert({ user_id: userId, name: "Ana Reis", city: "Porto" }).select("id").single();
  if (profile.error) throw profile.error;
  profileId = profile.data.id;
  const version = await admin()
    .from("versions")
    .insert({
      album_id: HUNKY_DORY,
      name: `Test pressing ${info.project.name}`,
      release_year: 2020,
      country: "EU",
      label: "Test",
      format: "LP",
      sound_score: 3,
      original_score: 3,
      typical_price_min: 20,
      typical_price_max: 30,
    })
    .select("id")
    .single();
  if (version.error) throw version.error;
  versionId = version.data.id;
  // Created oldest first; the page shows newest first.
  ids.sold = await addListing(22, "sold");
  ids.gone = await addListing(23, "removed");
  ids.lost = await addListing(29);
  ids.remove = await addListing(27);
  ids.edit = await addListing(25);
});

test.afterAll(async () => {
  const { data: files } = await admin().storage.from("listing-photos").list(profileId);
  if (files?.length) await admin().storage.from("listing-photos").remove(files.map((f) => `${profileId}/${f.name}`));
  for (const id of Object.values(ids).filter(Boolean)) {
    await admin().from("check_results").delete().eq("listing_id", id);
    await admin().from("listings").delete().eq("id", id);
  }
  await admin().from("versions").delete().eq("id", versionId);
  await admin().from("profiles").delete().eq("id", profileId);
  await admin().auth.admin.deleteUser(userId);
});

async function openMyListings(page: Page) {
  await page.goto(`/login?next=${encodeURIComponent("/account")}`);
  await signIn(page, email, PASSWORD);
  // My listings is the For sale tab of Your account (story 31).
  await page.getByRole("navigation", { name: "Your account" }).getByRole("link", { name: /^For sale/ }).click();
  await expect(page).toHaveURL("/account/for-sale");
}
const onSale = (page: Page) => page.getByRole("list", { name: "On sale" }).getByRole("listitem");
const row = (page: Page, price: string) => onSale(page).filter({ hasText: price });
const sheet = (page: Page) => page.getByRole("region", { name: "Listing details" });
const status = async (id: string) => (await admin().from("listings").select("status, price").eq("id", id).single()).data!;

test("My listings from Your account: on sale and sold tabs with status; removed listings are not shown", async ({ page }) => {
  await openMyListings(page);
  await expect(page.getByRole("tab", { name: "On sale (3)" })).toHaveAttribute("aria-selected", "true");
  await expect(onSale(page)).toHaveText([/€25/, /€27/, /€29/]); // newest first; the removed €23 is not shown
  await expect(row(page, "€25")).toContainText("Check");
  await expect(row(page, "€25")).toContainText(`Test pressing`);
  await screenshot(page, 8, "my-listings");

  await page.getByRole("tab", { name: "Sold (1)" }).click();
  const sold = page.getByRole("list", { name: "Sold" }).getByRole("listitem");
  await expect(sold).toHaveText([/€22/]);
  await expect(sold.getByRole("button")).toHaveCount(0); // sold listings can be seen, not edited or removed
});

test("edit the price: the label follows; only the price changes; the price rule applies", async ({ page }) => {
  await openMyListings(page);
  await row(page, "€25").getByRole("button").click();
  await expect(sheet(page)).toContainText("The version can't be changed.");
  await expect(sheet(page)).toContainText("Typical for this pressing: €20–€30");
  await expect(sheet(page).getByText("Typical", { exact: true })).toBeVisible();
  const save = sheet(page).getByRole("button", { name: "Save changes" });
  await expect(save).toBeDisabled(); // nothing changed yet

  const price = sheet(page).getByLabel("Price");
  await price.fill("1001");
  await expect(sheet(page).getByRole("alert")).toHaveText("The maximum price is €1000");
  await expect(save).toBeDisabled();
  await price.fill("0");
  await expect(sheet(page).getByRole("alert")).toHaveText("Enter a price above €0, with up to 2 decimals");
  await expect(save).toBeDisabled();

  await price.fill("35");
  await expect(sheet(page).getByText("Above typical", { exact: true })).toBeVisible();
  await expect(sheet(page)).toContainText("No commission: you receive €35");
  await screenshot(page, 8, "my-listings-edit");
  await save.click();
  await expect(sheet(page).getByText("Changes saved")).toBeVisible();
  await expect(row(page, "€35")).toBeVisible();
  const after = await admin().from("listings").select("price, status, condition_code, cover_photo_url, claimed_version_id").eq("id", ids.edit).single();
  expect(after.data).toEqual({
    price: 35,
    status: "on_sale",
    condition_code: "VG+",
    cover_photo_url: "/photos/cover.svg",
    claimed_version_id: versionId,
  });
});

test("the listing sheet has no fake drag bar and closes with Close, Escape and (on a phone) a tap outside", async ({ page }) => {
  await openMyListings(page);
  const open = () => onSale(page).first().getByRole("button").click();
  await open();
  await expect(sheet(page)).toBeVisible();
  // The old bar was an empty decorative span before the title row; the sheet now starts with the title row.
  await expect(sheet(page).locator("> span")).toHaveCount(0);
  if (process.env.SCREENSHOTS === "1") {
    await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
    await page.screenshot({ path: `docs/screenshots/bug-14/sheet-open-${page.viewportSize()?.width}.png` });
  }

  await sheet(page).getByRole("button", { name: "Close" }).click();
  await expect(sheet(page)).toHaveCount(0);

  await open();
  await page.keyboard.press("Escape");
  await expect(sheet(page)).toHaveCount(0);

  if ((page.viewportSize()?.width ?? 0) < 1024) {
    await open();
    await page.mouse.click(180, 60); // on the dimmed page above the sheet
    await expect(sheet(page)).toHaveCount(0);
  }
});

test("remove asks first; then 'Listing removed' with Undo puts it back on sale as before", async ({ page }) => {
  await openMyListings(page);
  await row(page, "€27").getByRole("button").click();
  await sheet(page).getByRole("button", { name: "Remove listing" }).click();
  const dialog = page.getByRole("alertdialog", { name: "Remove this listing?" });
  await expect(dialog).toContainText("Buyers will no longer see it.");
  await screenshot(page, 8, "my-listings-confirm");
  await dialog.getByRole("button", { name: "Keep it" }).click();
  await expect(dialog).toHaveCount(0);
  expect((await status(ids.remove)).status).toBe("on_sale");

  await sheet(page).getByRole("button", { name: "Remove listing" }).click();
  await dialog.getByRole("button", { name: "Remove" }).click();
  const toast = page.getByRole("status").filter({ hasText: "Listing removed" });
  await expect(toast).toBeVisible();
  await expect(row(page, "€27")).toHaveCount(0);
  await expect(page.getByRole("tab", { name: "On sale (2)" })).toBeVisible();
  expect((await status(ids.remove)).status).toBe("removed");
  await screenshot(page, 8, "my-listings-removed");

  // A removed listing no longer appears to buyers.
  const buyer = await page.context().newPage();
  await buyer.goto(`/versions/${versionId}/listings`);
  await expect(buyer.getByRole("list", { name: "Verified listings" })).not.toContainText("€27");
  await buyer.close();

  await toast.getByRole("button", { name: "Undo" }).click();
  await expect(row(page, "€27")).toBeVisible();
  await expect(row(page, "€27")).toContainText("Check");
  expect(await status(ids.remove)).toEqual({ status: "on_sale", price: 27 });
});

test("the Undo toast stays 5 seconds, then the removal is final", async ({ page }) => {
  await openMyListings(page);
  await row(page, "€27").getByRole("button").click();
  await sheet(page).getByRole("button", { name: "Remove listing" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Remove" }).click();
  const toast = page.getByRole("status").filter({ hasText: "Listing removed" });
  await expect(toast).toBeVisible();
  await page.waitForTimeout(4000);
  await expect(toast).toBeVisible(); // still there after 4 seconds
  await expect(toast).toHaveCount(0, { timeout: 3000 }); // gone by 7 seconds
  expect((await status(ids.remove)).status).toBe("removed");
});

test("bought while the seller edits or removes it: 'This record was just sold'", async ({ page }) => {
  await openMyListings(page);
  await row(page, "€29").getByRole("button").click();
  await admin().from("listings").update({ status: "sold" }).eq("id", ids.lost); // a buyer pays meanwhile
  await sheet(page).getByLabel("Price").fill("31");
  await sheet(page).getByRole("button", { name: "Save changes" }).click();
  await expect(sheet(page).getByRole("alert")).toHaveText("This record was just sold");
  expect(await status(ids.lost)).toEqual({ status: "sold", price: 29 });

  await admin().from("listings").update({ status: "on_sale" }).eq("id", ids.lost);
  await page.reload();
  await row(page, "€29").getByRole("button").click();
  await admin().from("listings").update({ status: "sold" }).eq("id", ids.lost);
  await sheet(page).getByRole("button", { name: "Remove listing" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Remove" }).click();
  await expect(sheet(page).getByRole("alert")).toHaveText("This record was just sold");
  expect((await status(ids.lost)).status).toBe("sold");
});

// Bug 10: the condition and the photos can be changed too; the version cannot; the photo rules still apply.
test("edit the condition and a photo: saved on the same listing; version and other photos stay", async ({ page }) => {
  ids.photo = await addListing(26);
  await openMyListings(page);
  await row(page, "€26").getByRole("button").click();
  await expect(sheet(page)).toContainText("The version can't be changed.");
  const save = sheet(page).getByRole("button", { name: "Save changes" });
  await expect(save).toBeDisabled(); // nothing changed yet
  await expect(sheet(page).getByText("Change", { exact: true })).toHaveCount(2); // the saved cover and record photos are shown

  await sheet(page).getByText("Near mint").click();
  await expect(save).toBeEnabled();
  await sheet(page).getByLabel("Front cover photo").setInputFiles(photo("new-cover"));
  await expect(sheet(page).getByText("Front cover ✓", { exact: true })).toBeVisible(); // the new one, not yet saved
  await sheet(page).getByLabel("Price").fill("1001"); // the price rule still applies
  await expect(save).toBeDisabled();
  await sheet(page).getByLabel("Price").fill("26");
  await expect(save).toBeEnabled();
  await screenshot(page, "bug-10", "my-listings-edit");
  await save.click();
  await expect(sheet(page).getByText("Changes saved")).toBeVisible();
  await expect(row(page, "€26")).toContainText("Near mint (NM)");

  const after = await admin()
    .from("listings")
    .select("price, status, condition_code, cover_photo_url, record_photo_url, claimed_version_id, actual_version_id")
    .eq("id", ids.photo)
    .single();
  expect(after.data).toMatchObject({
    price: 26,
    status: "on_sale",
    condition_code: "NM",
    record_photo_url: "/photos/record.svg", // not touched
    claimed_version_id: versionId,
    actual_version_id: versionId,
  });
  expect(after.data!.cover_photo_url).toContain("/listing-photos/"); // the new photo, in Storage
});

