// Story 7 · Phase 4, step 3: the buyer confirms receipt ("It arrived, all good") on Your account → "Seller paid".
// Also finding #61: a sold or removed listing opened from a link says "This record is no longer available".
// Creates test accounts, listings and orders in Supabase and removes them afterwards.
import { expect, test, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { screenshot } from "./screenshot";

function env(name: string) {
  if (process.env[name]) return process.env[name]!;
  const line = readFileSync(".env.local", "utf8").split("\n").findLast((l) => l.startsWith(`${name}=`));
  return line?.slice(name.length + 1).trim() ?? "";
}
const admin = () =>
  createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SECRET_KEY"), { auth: { persistSession: false } });

const V_HOMOGENIC_2017 = "20000000-0000-0000-0000-000000000010";
const PASSWORD = "vinyl-test-123";
const isServerAction = (route: { request: () => { method: () => string; headers: () => Record<string, string> } }) =>
  route.request().method() === "POST" && !!route.request().headers()["next-action"];

type Account = { email: string; userId: string; profileId: string };
let buyer: Account;
let other: Account; // has no orders
let listingId = "";
let orderId = "";
const listingIds: string[] = [];

async function addAccount(label: string, project: string): Promise<Account> {
  const email = `spindle-${label}-${project}-${Date.now()}@spindle.test`;
  const { data, error } = await admin().auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { name: "Rui Costa" },
  });
  if (error) throw error;
  const profile = await admin().from("profiles").insert({ user_id: data.user.id, name: "Rui Costa" }).select("id").single();
  if (profile.error) throw profile.error;
  return { email, userId: data.user.id, profileId: profile.data.id };
}

async function addListing(status: "on_sale" | "sold" | "removed" = "sold"): Promise<string> {
  const { data, error } = await admin()
    .from("listings")
    .insert({
      seller_id: "30000000-0000-0000-0000-000000000001",
      claimed_version_id: V_HOMOGENIC_2017,
      actual_version_id: V_HOMOGENIC_2017,
      condition_code: "VG+",
      price: 28,
      status,
      cover_photo_url: "/photos/cover.svg",
      record_photo_url: "/photos/record.svg",
      matrix_photo_url: "/photos/matrix.svg",
    })
    .select("id")
    .single();
  if (error) throw error;
  const checks = await admin()
    .from("check_results")
    .insert(["cover_label", "country_year", "matrix"].map((item) => ({ listing_id: data.id, item, result: "match" })));
  if (checks.error) throw checks.error;
  listingIds.push(data.id);
  return data.id;
}

test.beforeAll(async ({}, info) => {
  buyer = await addAccount("receipt-buyer", info.project.name);
  other = await addAccount("receipt-other", info.project.name);
  listingId = await addListing("sold"); // a listing that was bought: sold, with an order
  const { data, error } = await admin()
    .from("orders")
    .insert({
      buyer_id: buyer.profileId,
      listing_id: listingId,
      record_price: 28,
      shipping: 4.9,
      protection_fee: 2,
      total: 34.9,
      ship_name: "Rui Costa",
      ship_street: "Rua do Almada 120",
      ship_postcode: "4050-031",
      ship_city: "Porto",
    })
    .select("id")
    .single();
  if (error) throw error;
  orderId = data.id;
});

test.afterAll(async () => {
  await admin().from("orders").delete().eq("buyer_id", buyer.profileId);
  for (const id of listingIds) {
    await admin().from("check_results").delete().eq("listing_id", id);
    await admin().from("listings").delete().eq("id", id);
  }
  for (const a of [buyer, other]) {
    await admin().from("profiles").delete().eq("user_id", a.userId);
    await admin().auth.admin.deleteUser(a.userId);
  }
});

async function logInTo(page: Page, account: Account, next: string) {
  await page.goto(`/login?next=${encodeURIComponent(next)}`);
  await page.getByLabel("Email").fill(account.email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
}
const status = async () => (await admin().from("orders").select("status").eq("id", orderId).single()).data?.status;

test("Your account shows the order 'On its way': only Paid is done, with 'It arrived, all good' and no 'Report a problem'", async ({ page }) => {
  await logInTo(page, buyer, "/account");
  const section = page.getByRole("region", { name: "On its way" });
  await expect(section.getByRole("heading", { name: "On its way" })).toBeVisible();
  const card = section.getByRole("listitem").filter({ hasText: "Homogenic, 2017 Reissue" });
  await expect(card).toContainText("€34.90");
  await expect(card).toContainText("Your money is held by Spindle until you confirm the record is as listed.");
  const steps = card.getByRole("list", { name: "Order progress" }).getByRole("listitem");
  await expect(steps).toHaveText(["Paid (done)", "Shipped", "You confirm", "Seller paid"]);
  await expect(card.getByRole("button", { name: "It arrived, all good" })).toBeVisible();
  await expect(page.getByText(/report a problem/i)).toHaveCount(0);
  await expect(page.getByText("Simulated payment · Illustrative data")).toBeVisible();
  await expect(page.getByRole("region", { name: "Delivered" })).toHaveCount(0);
  await screenshot(page, 7, "account-on-its-way");
});

test("an account without orders has no 'On its way' or 'Delivered'; one buyer never sees another's order", async ({ page }) => {
  await logInTo(page, other, "/account");
  await expect(page.getByRole("heading", { name: "Your account" })).toBeVisible();
  await expect(page.getByRole("region", { name: "On its way" })).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Delivered" })).toHaveCount(0);
  await expect(page.getByText("Homogenic, 2017 Reissue")).toHaveCount(0);
});

test("confirming asks 'Are you sure?' first; 'Not yet' changes nothing; 'Yes' makes the order 'Seller paid' and moves it to Delivered", async ({ page }) => {
  await logInTo(page, buyer, "/account");
  const card = page.getByRole("region", { name: "On its way" }).getByRole("listitem").filter({ hasText: "Homogenic, 2017 Reissue" });
  await card.getByRole("button", { name: "It arrived, all good" }).click();
  const ask = card.getByRole("group", { name: "Confirm receipt" });
  await expect(ask).toContainText("Are you sure? The money is released to the seller.");
  await screenshot(page, 7, "account-are-you-sure");
  await ask.getByRole("button", { name: "Not yet" }).click();
  await expect(card.getByRole("button", { name: "It arrived, all good" })).toBeVisible();
  expect(await status()).toBe("paid_waiting_seller");

  await card.getByRole("button", { name: "It arrived, all good" }).click();
  await ask.getByRole("button", { name: "Yes, release the money" }).click();
  const delivered = page.getByRole("region", { name: "Delivered" });
  const done = delivered.getByRole("listitem").filter({ hasText: "Homogenic, 2017 Reissue" });
  await expect(done).toContainText("Delivered. The seller has been paid.");
  await expect(done.getByRole("list", { name: "Order progress" }).getByRole("listitem")).toHaveText([
    "Paid (done)",
    "Shipped (done)",
    "You confirm (done)",
    "Seller paid (done)",
  ]);
  await expect(done.getByRole("button")).toHaveCount(0); // a confirmed order cannot be changed
  await expect(page.getByRole("region", { name: "On its way" })).toHaveCount(0);
  expect(await status()).toBe("seller_paid");
  await screenshot(page, 7, "account-delivered");
  await page.reload();
  await expect(page.getByRole("region", { name: "Delivered" })).toContainText("Homogenic, 2017 Reissue"); // it stays confirmed
});

test("confirming: 'Confirming…' while it saves; if it fails, an error screen with 'Try again' that recovers", async ({ page }) => {
  // A second order, so this test does not depend on the one confirmed above.
  const listing = await addListing("sold");
  const { data, error } = await admin()
    .from("orders")
    .insert({
      buyer_id: buyer.profileId,
      listing_id: listing,
      record_price: 28,
      shipping: 4.9,
      protection_fee: 2,
      total: 34.9,
      ship_name: "Rui Costa",
      ship_street: "Rua do Almada 120",
      ship_postcode: "4050-031",
      ship_city: "Porto",
    })
    .select("id")
    .single();
  if (error) throw error;

  await logInTo(page, buyer, "/account");
  const card = page.getByRole("region", { name: "On its way" }).getByRole("listitem").first();
  // The save is held back so the loading mask shows; then it fails for real: the session has ended, so the
  // server refuses it and the card shows its own error screen (the page stays).
  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => (release = resolve));
  await page.route("**/*", async (route) => {
    if (isServerAction(route)) await gate;
    await route.continue();
  });
  await card.getByRole("button", { name: "It arrived, all good" }).click();
  const saved = await page.context().cookies();
  await page.context().clearCookies();
  await card.getByRole("button", { name: "Yes, release the money" }).click();
  await expect(card.getByRole("status").filter({ hasText: "Confirming…" })).toBeVisible();
  release();
  const alert = page.getByRole("alert").filter({ hasText: "We couldn't confirm your order" });
  await expect(alert).toBeVisible({ timeout: 15000 });
  expect((await admin().from("orders").select("status").eq("id", data.id).single()).data?.status).toBe("paid_waiting_seller");
  await page.context().addCookies(saved); // signed in again
  await alert.getByRole("button", { name: "Try again" }).click();
  await expect(alert).toHaveCount(0);
  // "Try again" brings back the question, as it was; one more tap confirms.
  await expect(card.getByRole("group", { name: "Confirm receipt" })).toBeVisible();
  await card.getByRole("button", { name: "Yes, release the money" }).click();
  await expect(page.getByRole("region", { name: "Delivered" }).getByRole("listitem", { name: "Homogenic, 2017 Reissue" })).toHaveCount(2, { timeout: 15000 }); // the earlier one and this one
  expect((await admin().from("orders").select("status").eq("id", data.id).single()).data?.status).toBe("seller_paid");
});

test("a sold or removed listing opened from a link says 'This record is no longer available' (finding #61)", async ({ page }) => {
  const removed = await addListing("removed");
  for (const path of [
    `/listings/${listingId}?version=${V_HOMOGENIC_2017}`, // sold
    `/listings/${removed}?version=${V_HOMOGENIC_2017}`,
  ]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("This record is no longer available");
    await expect(page.getByRole("button", { name: /^Buy/ })).toHaveCount(0);
  }
  await screenshot(page, 7, "no-longer-available");
  await page.getByRole("link", { name: "Back to search" }).click();
  await expect(page).toHaveURL("/", { timeout: 15000 }); // the home page may still be compiling in development
  await page.goto(`/listings/00000000-0000-0000-0000-00000000dead`); // a listing that never existed stays "not found"
  await expect(page.getByText("This page could not be found.")).toBeVisible();
});
