// Story 8 · Sell a record for free — critical flow, run on phone and desktop (playwright.config.ts).
// Creates a real test account in Supabase (already confirmed, no city yet) and removes it, its listings
// and their photos afterwards. Publishes on Homogenic 1997 UK original, which no other test uses,
// so the demo data (Ziggy Stardust) never changes. Uses the illustrative data in supabase/seed.sql.
import { expect, test, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { signIn } from "./session";
import { screenshot } from "./screenshot";
import { typeSearch } from "./searchBox";

function env(name: string) {
  if (process.env[name]) return process.env[name]!;
  const line = readFileSync(".env.local", "utf8").split("\n").findLast((l) => l.startsWith(`${name}=`));
  return line?.slice(name.length + 1).trim() ?? "";
}
const admin = () =>
  createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SECRET_KEY"), { auth: { persistSession: false } });

const V2012 = "20000000-0000-0000-0000-000000000003"; // Ziggy Stardust 2012 Remaster, typical €28–€36
const V_HOMOGENIC_1997 = "20000000-0000-0000-0000-000000000009"; // no listings, no typical range
const HOMOGENIC = "10000000-0000-0000-0000-000000000005";

// A real 1×1 PNG, so the browser can read and reduce it like a camera photo.
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");
const photo = (name: string) => ({ name: `${name}.png`, mimeType: "image/png", buffer: PNG });

const PASSWORD = "vinyl-test-123";
let email = "";
let userId = "";
let profileId = "";

test.beforeAll(async ({}, info) => {
  email = `spindle-sell-${info.project.name}-${Date.now()}@spindle.test`;
  const { data, error } = await admin().auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { name: "Ana Reis" },
  });
  if (error) throw error;
  userId = data.user.id;
  const profile = await admin().from("profiles").insert({ user_id: userId, name: "Ana Reis" }).select("id").single();
  if (profile.error) throw profile.error;
  profileId = profile.data.id;
});

test.afterAll(async () => {
  const { data: listings } = await admin()
    .from("listings")
    .select("id, cover_photo_url, record_photo_url, matrix_photo_url")
    .eq("seller_id", profileId);
  for (const l of listings ?? []) {
    await admin().from("check_results").delete().eq("listing_id", l.id);
    await admin().from("listings").delete().eq("id", l.id);
  }
  const { data: files } = await admin().storage.from("listing-photos").list(profileId);
  if (files?.length) await admin().storage.from("listing-photos").remove(files.map((f) => `${profileId}/${f.name}`));
  await admin().from("profiles").delete().eq("id", profileId);
  await admin().auth.admin.deleteUser(userId);
});

const logIn = (page: Page) => signIn(page, email, PASSWORD);
const visible = (page: Page, text: string | RegExp) => page.getByText(text).and(page.locator(":visible"));
const listButton = (page: Page) => page.getByRole("button", { name: "List for sale" });

test("signed out: Sell in the menu asks to log in, then returns to the sell search", async ({ page }, info) => {
  await page.goto("/");
  if (info.project.name === "phone") {
    await page.getByRole("button", { name: "Open menu" }).click(); // story 15: on a phone "Sell" is in the menu
    await page.getByRole("dialog", { name: "Menu" }).getByRole("link", { name: "Sell for free" }).click();
  } else {
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Sell for free" }).click();
  }
  await expect(page).toHaveURL(`/login?next=${encodeURIComponent("/sell")}`);
  await logIn(page);
  await expect(page).toHaveURL("/sell");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Which record are you selling?");
  await expect(page.getByRole("link", { name: "Back to home" })).toHaveCount(0); // bug 16 (was finding #28)
});

test("find an album and pick one version, even when nobody sells it", async ({ page }) => {
  await page.goto(`/login?next=${encodeURIComponent("/sell")}`);
  await logIn(page);
  await expect(page).toHaveURL("/sell"); // the log-in page has a header search on desktop too: wait for the sell page
  await typeSearch(page, "homo");
  const row = page.getByRole("link", { name: /Homogenic/ });
  await expect(row).toContainText("2 versions");
  await expect(row).not.toContainText("No listings");
  await screenshot(page, 8, "sell-search");
  await row.click();

  await expect(page).toHaveURL(`/sell/albums/${HOMOGENIC}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Which one do you have?");
  await expect(page.getByRole("radio")).toHaveCount(2);
  await expect(page.getByText("1997 · UK · One Little Indian · LP")).toBeVisible();
  const go = page.getByRole("button", { name: "Continue" });
  await expect(go).toBeDisabled();
  await expect(page.getByText("Choose a version to continue")).toBeVisible();
  await page.getByRole("button", { name: "My version isn't here" }).click();
  await expect(page.getByText("This version isn't in our catalogue yet")).toBeVisible();
  await page.getByText("1997 UK original").click();
  await expect(go).toBeEnabled();
  await screenshot(page, 8, "sell-versions");
  await go.click();
  await expect(page).toHaveURL(`/sell/versions/${V_HOMOGENIC_1997}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sell a record");
  // No back link (DECISIONS 2026-11-11): the browser's Back returns to the versions.
  await expect(page.getByRole("link", { name: "Back to versions" })).toHaveCount(0);
  await page.goBack();
  await expect(page).toHaveURL(`/sell/albums/${HOMOGENIC}`);
});

test("first sale: List for sale waits for every required field and the city; the listing appears yellow", async ({ page }, info) => {
  const typed = info.project.name === "phone" ? "33.33" : "34.44"; // phone and desktop run at the same time
  await page.goto(`/login?next=${encodeURIComponent(`/sell/versions/${V_HOMOGENIC_1997}`)}`);
  await logIn(page);
  await expect(page.getByText("Homogenic, 1997 UK original")).toBeVisible();
  await expect(page.getByText(/Typical for this pressing/)).toHaveCount(0); // no range → neither range nor label
  await expect(listButton(page)).toBeDisabled();
  // Finding #27: the hint says everything still needed, and shrinks as the form is filled in.
  await expect(page.getByText("Still needed: city, condition, front cover photo, record photo, price")).toBeVisible();

  await page.getByText("Very good").click();
  await expect(listButton(page)).toBeDisabled();
  await expect(page.getByText("Still needed: city, front cover photo, record photo, price")).toBeVisible();
  await page.getByLabel("Front cover photo").setInputFiles(photo("cover"));
  await page.getByLabel("Record photo").setInputFiles(photo("record"));
  await expect(page.getByText("Front cover ✓")).toBeVisible();
  await expect(page.getByText("Record ✓")).toBeVisible();
  await expect(listButton(page)).toBeDisabled();
  await page.getByLabel("Price").fill(typed);
  await expect(visible(page, `No commission: you receive €${typed}`)).toBeVisible();
  await expect(listButton(page)).toBeDisabled(); // first time: the city is still missing
  await expect(page.getByText("Still needed: city", { exact: true })).toBeVisible();
  await screenshot(page, 8, "sell-form-first-time");

  await page.getByRole("button", { name: "Add" }).click();
  await page.getByLabel("City").fill("Porto");
  await page.getByLabel(/Shop name/).fill("Discos do Bairro");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Porto · Discos do Bairro")).toBeVisible();
  await expect(listButton(page)).toBeEnabled();
  await listButton(page).click();

  await expect(page).toHaveURL(`/versions/${V_HOMOGENIC_1997}/listings`);
  const row = page.getByRole("listitem").filter({ hasText: `€${typed}` });
  await expect(row).toContainText("Check");
  await expect(row).toContainText("Discos do Bairro");
  await expect(row).toContainText("Porto");
  // The seller's own listing: "Your listing" instead of Buy (finding #12), on the list and the check screen.
  await expect(row.getByText("Your listing")).toBeVisible();
  await expect(row.getByRole("link", { name: /^Buy/ })).toHaveCount(0);
  await expect(row.getByRole("button", { name: /^Buy/ })).toHaveCount(0);
  await screenshot(page, 8, "sell-listed");
  await row.getByRole("link", { name: /^Open/ }).click();
  await expect(page.getByText("Your listing")).toBeVisible();
  await expect(page.getByRole("button", { name: /Buy with protection/ })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Buy with protection/ })).toHaveCount(0);

  const { data } = await admin()
    .from("listings")
    .select("claimed_version_id, actual_version_id, condition_code, price, status, check_results (result), profiles (city, shop_name)")
    .eq("seller_id", profileId)
    .single();
  expect(data).toMatchObject({
    claimed_version_id: V_HOMOGENIC_1997,
    actual_version_id: V_HOMOGENIC_1997,
    condition_code: "VG+",
    price: Number(typed),
    status: "on_sale",
    profiles: { city: "Porto", shop_name: "Discos do Bairro" },
  });
  expect(data!.check_results.map((c) => c.result)).toEqual(["uncertain", "uncertain", "uncertain"]);

  // Never the checkout for the seller's own listing, even from its address: back to the listing with a notice (bug 12).
  const own = await admin().from("listings").select("id").eq("seller_id", profileId).single();
  await page.goto(`/checkout/${own.data!.id}?version=${V_HOMOGENIC_1997}`);
  await expect(page).toHaveURL(`/listings/${own.data!.id}?version=${V_HOMOGENIC_1997}&notice=own`);
  await expect(page.getByText("This listing is yours, you can't buy it")).toBeVisible();
});

test("price: typical range and label while typing; invalid prices refused; photos above 5 MB refused", async ({ page }) => {
  await page.goto(`/login?next=${encodeURIComponent(`/sell/versions/${V2012}`)}`);
  await logIn(page);
  await expect(page.getByText(/Spiders from Mars, 2012 Remaster/)).toBeVisible();
  const price = page.getByLabel("Price");

  for (const [typed, label] of [["24", "Below typical"], ["30", "Typical"], ["40", "Above typical"]]) {
    await price.fill(typed);
    await expect(page.getByText("Typical for this pressing: €28–€36")).toBeVisible();
    await expect(page.getByText(label, { exact: true })).toBeVisible();
    await expect(visible(page, `No commission: you receive €${typed}`)).toBeVisible();
  }
  await screenshot(page, 8, "sell-form");

  for (const [typed, message] of [
    ["0", "Enter a price above €0, with up to 2 decimals"],
    ["-5", "Enter a price above €0, with up to 2 decimals"],
    ["thirty", "Enter a price above €0, with up to 2 decimals"],
    ["12.345", "Enter a price above €0, with up to 2 decimals"],
    ["1001", "The maximum price is €1000"],
  ]) {
    await price.fill(typed);
    await expect(page.getByRole("alert").filter({ hasText: /\S/ })).toHaveText(message);
    await expect(listButton(page)).toBeDisabled();
  }

  const big = { name: "big.jpg", mimeType: "image/jpeg", buffer: Buffer.alloc(5 * 1024 * 1024 + 1) };
  await page.getByLabel("Front cover photo").setInputFiles(big);
  await expect(page.getByText("Front cover: This photo is larger than 5 MB. Choose a smaller one.")).toBeVisible();
});

test("a version not in the catalogue shows a message and no form", async ({ page }) => {
  await page.goto(`/login?next=${encodeURIComponent("/sell/versions/20000000-0000-0000-0000-000000000999")}`);
  await logIn(page);
  await expect(page.getByText("This version isn't in our catalogue yet")).toBeVisible();
  await expect(listButton(page)).toHaveCount(0);
});
