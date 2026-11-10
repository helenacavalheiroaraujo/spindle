// Bug 11 · "Selling from" on every sell form — critical flow, run on phone and desktop (playwright.config.ts).
// A seller with two shops in different cities lists two records, choosing the place each time.
// Creates a test seller (already with a city and a shop name) and a temporary version under Hunky Dory,
// and removes them, their listings and their photos afterwards, so the demo data never changes.
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
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");
const photo = (name: string) => ({ name: `${name}.png`, mimeType: "image/png", buffer: PNG });

const PASSWORD = "vinyl-test-123";
let email = "";
let userId = "";
let profileId = "";
let versionId = "";

test.beforeAll(async ({}, info) => {
  email = `spindle-place-${info.project.name}-${Date.now()}@spindle.test`;
  const user = await admin().auth.admin.createUser({ email, password: PASSWORD, email_confirm: true, user_metadata: { name: "Ana Reis" } });
  if (user.error) throw user.error;
  userId = user.data.user.id;
  const profile = await admin()
    .from("profiles")
    .insert({ user_id: userId, name: "Ana Reis", city: "Porto", shop_name: "Discos do Bairro" })
    .select("id")
    .single();
  if (profile.error) throw profile.error;
  profileId = profile.data.id;
  const version = await admin()
    .from("versions")
    .insert({
      album_id: HUNKY_DORY,
      name: `Place test pressing ${info.project.name}`,
      release_year: 2020,
      country: "EU",
      label: "Test",
      format: "LP",
      sound_score: 3,
      original_score: 3,
      typical_price_min: 20,
      typical_price_max: 40,
    })
    .select("id")
    .single();
  if (version.error) throw version.error;
  versionId = version.data.id;
});

test.afterAll(async () => {
  const { data: listings } = await admin().from("listings").select("id").eq("seller_id", profileId);
  for (const l of listings ?? []) {
    await admin().from("check_results").delete().eq("listing_id", l.id);
    await admin().from("listings").delete().eq("id", l.id);
  }
  const { data: files } = await admin().storage.from("listing-photos").list(profileId);
  if (files?.length) await admin().storage.from("listing-photos").remove(files.map((f) => `${profileId}/${f.name}`));
  await admin().from("versions").delete().eq("id", versionId);
  await admin().from("profiles").delete().eq("id", profileId);
  await admin().auth.admin.deleteUser(userId);
});

const listButton = (page: Page) => page.getByRole("button", { name: "List for sale" });

async function openForm(page: Page) {
  await page.goto(`/login?next=${encodeURIComponent(`/sell/versions/${versionId}`)}`);
  await signIn(page, email, PASSWORD);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sell a record");
}

async function fillAndList(page: Page, price: string) {
  await page.getByText("Very good").click();
  await page.getByLabel("Front cover photo").setInputFiles(photo("cover"));
  await page.getByLabel("Record photo").setInputFiles(photo("record"));
  await expect(page.getByText("Record ✓")).toBeVisible();
  await page.getByLabel("Price").fill(price);
  await expect(listButton(page)).toBeEnabled();
  await listButton(page).click();
  await expect(page).toHaveURL(`/versions/${versionId}/listings`);
}

async function choosePlace(page: Page, city: string, shop: string) {
  await page.getByRole("button", { name: "Change" }).first().click();
  await page.getByLabel("City").fill(city);
  await page.getByLabel(/Shop name/).fill(shop);
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText(shop ? `${city} · ${shop}` : city)).toBeVisible();
}

test("two shops: the sell form always shows 'Selling from', pre-filled and changeable for each listing", async ({ page }) => {
  // First listing: the saved place is shown (even though the seller has sold before); choose the other shop.
  await openForm(page);
  await expect(page.getByText("Selling from")).toBeVisible();
  await expect(page.getByText("Porto · Discos do Bairro")).toBeVisible();
  await screenshot(page, "bug-11", "sell-form-selling-from");
  await choosePlace(page, "Lisbon", "Discos da Baixa");
  await screenshot(page, "bug-11", "sell-form-place-changed");
  await fillAndList(page, "31");
  const first = page.getByRole("listitem").filter({ hasText: "€31" });
  await expect(first).toContainText("Discos da Baixa");
  await expect(first).toContainText("Lisbon");

  // Second listing: pre-filled with the place of the last one; choose the first shop again.
  await openForm(page);
  await expect(page.getByText("Lisbon · Discos da Baixa")).toBeVisible();
  await expect(page.getByText("Still needed: condition, front cover photo, record photo, price")).toBeVisible(); // the city is not missing
  await choosePlace(page, "Porto", "Discos do Bairro");
  await fillAndList(page, "32");
  const second = page.getByRole("listitem").filter({ hasText: "€32" });
  await expect(second).toContainText("Discos do Bairro");
  await expect(second).toContainText("Porto");
  // The first listing keeps its own place.
  await expect(page.getByRole("listitem").filter({ hasText: "€31" })).toContainText("Lisbon");
  await screenshot(page, "bug-11", "two-listings-two-places");

  const { data } = await admin()
    .from("listings")
    .select("price, seller_city, seller_shop_name")
    .eq("seller_id", profileId)
    .order("price");
  expect(data).toEqual([
    { price: 31, seller_city: "Lisbon", seller_shop_name: "Discos da Baixa" },
    { price: 32, seller_city: "Porto", seller_shop_name: "Discos do Bairro" },
  ]);
  // The seller's profile (the first place) is not changed by choosing another place for a listing.
  const profile = await admin().from("profiles").select("city, shop_name").eq("id", profileId).single();
  expect(profile.data).toEqual({ city: "Porto", shop_name: "Discos do Bairro" });
});

test("the place is required: clearing the city disables 'List for sale'", async ({ page }) => {
  await openForm(page);
  await page.getByRole("button", { name: "Change" }).first().click();
  await page.getByLabel("City").fill("");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Add your city")).toBeVisible();
  await expect(page.getByText(/Still needed: city/)).toBeVisible();
  await expect(listButton(page)).toBeDisabled();
});
