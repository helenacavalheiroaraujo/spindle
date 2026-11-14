// Story 31 · Your account in tabs — critical flow, run on phone and desktop (playwright.config.ts).
// Creates a test account with no orders and no listings (edge cases), then a temporary version under Hunky Dory with
// two listings on sale and one sold, and removes them all afterwards, so the demo data never changes.
import { expect, test, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { screenshot } from "./screenshot";
import { signIn } from "./session";
import { waitUntilHydrated } from "./hydration";

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
const listingIds: string[] = [];

const tabs = (page: Page) => page.getByRole("navigation", { name: "Your account" });
const tab = (page: Page, name: RegExp) => tabs(page).getByRole("link", { name });

async function logInTo(page: Page, next: string) {
  await page.goto(`/login?next=${encodeURIComponent(next)}`);
  await signIn(page, email, PASSWORD);
}

async function addListing(price: number, status: "on_sale" | "sold" = "on_sale") {
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
  listingIds.push(data as string);
}

test.beforeAll(async ({}, info) => {
  email = `spindle-tabs-${info.project.name}-${Date.now()}@spindle.test`;
  const user = await admin().auth.admin.createUser({ email, password: PASSWORD, email_confirm: true, user_metadata: { name: "Rita Lopes" } });
  if (user.error) throw user.error;
  userId = user.data.user.id;
  const profile = await admin().from("profiles").insert({ user_id: userId, name: "Rita Lopes", city: "Porto" }).select("id").single();
  if (profile.error) throw profile.error;
  profileId = profile.data.id;
});

test.afterAll(async () => {
  for (const id of listingIds) {
    await admin().from("check_results").delete().eq("listing_id", id);
    await admin().from("listings").delete().eq("id", id);
  }
  if (versionId) await admin().from("versions").delete().eq("id", versionId);
  await admin().from("user_preferences").delete().eq("user_id", userId);
  await admin().from("profiles").delete().eq("id", profileId);
  await admin().auth.admin.deleteUser(userId);
});

test.describe.configure({ mode: "serial" });

test("Your account opens with the profile header and the Orders tab; no orders → 'No orders yet' and a link to search", async ({ page }) => {
  await logInTo(page, "/account");
  await expect(page).toHaveURL("/account");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Your account: Rita Lopes"); // "Your account: " is for screen readers only
  await expect(page.getByRole("main").getByText(email)).toBeVisible();
  await expect(tabs(page).getByRole("link")).toHaveText(["Orders (0)", "For sale (0)", "Account details"]);
  await expect(tab(page, /^Orders/)).toHaveAttribute("aria-current", "page");
  await expect(tab(page, /^For sale/)).not.toHaveAttribute("aria-current", "page");
  await expect(page.getByText("No orders yet")).toBeVisible();
  await expect(page.getByRole("link", { name: "Search for a record" })).toHaveAttribute("href", "/");
  await screenshot(page, 31, "orders-empty");
});

test("For sale with no listings: 'Nothing for sale yet' and 'Sell a record'", async ({ page }) => {
  await logInTo(page, "/account");
  await tab(page, /^For sale/).click();
  await expect(page).toHaveURL("/account/for-sale");
  await expect(tab(page, /^For sale/)).toHaveAttribute("aria-current", "page");
  await expect(page.getByText("Nothing for sale yet")).toBeVisible();
  await expect(page.getByRole("link", { name: "Sell a record" })).toHaveAttribute("href", "/sell");
});

test("Account details: no saved ranking → no buying priorities; password, addresses and Log out at the bottom; no name or email list", async ({ page }) => {
  await logInTo(page, "/account/details");
  await expect(tab(page, /^Account details/)).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("region", { name: "Buying priorities" })).toHaveCount(0);
  await expect(page.getByRole("form", { name: "Password" })).toBeVisible();
  await expect(page.getByRole("form", { name: "Addresses" })).toBeVisible();
  await expect(page.getByRole("main").getByRole("button", { name: "Log out" })).toBeVisible();
  await expect(page.getByRole("main").getByRole("term")).toHaveCount(0); // name and email are in the header, not here
  await screenshot(page, 31, "details");
});

test("For sale shows the listings with counts; a price is edited as in story 8; reloading keeps the tab", async ({ page }, info) => {
  const version = await admin()
    .from("versions")
    .insert({
      album_id: HUNKY_DORY,
      name: `Tabs pressing ${info.project.name}`,
      release_year: 2021,
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
  await addListing(22, "sold");
  await addListing(27);
  await addListing(25);

  await logInTo(page, "/account/for-sale");
  await expect(tab(page, /^For sale/)).toHaveText("For sale (2)"); // listings on sale only
  await expect(tab(page, /^Orders/)).toHaveText("Orders (0)");
  const onSale = page.getByRole("list", { name: "On sale" }).getByRole("listitem");
  await expect(onSale).toHaveText([/€25/, /€27/]);
  await expect(page.getByRole("link", { name: "Sell a record" })).toBeVisible();
  await screenshot(page, 31, "for-sale");

  const row = onSale.filter({ hasText: "€25" }).getByRole("button");
  await waitUntilHydrated(row);
  await row.click();
  const sheet = page.getByRole("region", { name: "Listing details" });
  await sheet.getByLabel("Price").fill("26");
  await sheet.getByRole("button", { name: "Save changes" }).click();
  await expect(sheet.getByText("Changes saved")).toBeVisible();

  await page.reload();
  await expect(page).toHaveURL("/account/for-sale");
  await expect(tab(page, /^For sale/)).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("list", { name: "On sale" }).getByRole("listitem")).toHaveText([/€26/, /€27/]);
});

test("an old /my-listings link opens the For sale tab", async ({ page }) => {
  await logInTo(page, "/account");
  await page.goto("/my-listings");
  await expect(page).toHaveURL("/account/for-sale");
  await expect(tab(page, /^For sale/)).toHaveAttribute("aria-current", "page");
});

// WebKit (the phone run) does not Tab through links, so the keyboard is tested in Chromium.
test("/account/orders is the Orders tab; tabs work with the keyboard", async ({ page, browserName }) => {
  test.skip(browserName === "webkit", "WebKit does not Tab through links");
  await logInTo(page, "/account/orders");
  await expect(tab(page, /^Orders/)).toHaveAttribute("aria-current", "page");
  await waitUntilHydrated(tab(page, /^Orders/));
  await tab(page, /^Orders/).focus();
  await page.keyboard.press("Tab");
  await expect(tab(page, /^For sale/)).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(tab(page, /^Account details/)).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL("/account/details");
  await expect(tab(page, /^Account details/)).toHaveAttribute("aria-current", "page");
  // The selected tab is underlined (a navy bottom border), not only a different colour.
  const border = await tab(page, /^Account details/).evaluate((el) => getComputedStyle(el).borderBottomWidth);
  expect(border).toBe("3px");
});

test("tap targets of the tabs are at least 44 px tall", async ({ page }) => {
  await logInTo(page, "/account");
  for (const name of [/^Orders/, /^For sale/, /^Account details/]) {
    const box = await tab(page, name).boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }
});
