// Story 39 · Cancel an order while it is "Paid" (design part 3, option A, and "After cancelling").
// Creates test accounts, listings and orders in Supabase and removes them afterwards.
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

const V_HOMOGENIC_2017 = "20000000-0000-0000-0000-000000000010";
const PASSWORD = "vinyl-test-123";
const ALBUM = "Homogenic, 2017 Reissue";
const isServerAction = (route: { request: () => { method: () => string; headers: () => Record<string, string> } }) =>
  route.request().method() === "POST" && !!route.request().headers()["next-action"];

type Account = { email: string; userId: string; profileId: string };
const accounts: Account[] = [];
const listingIds: string[] = [];

async function addAccount(label: string, project: string): Promise<Account> {
  const email = `spindle-cancel-${label}-${project}-${Date.now()}@spindle.test`;
  const { data, error } = await admin().auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { name: "Rui Costa" },
  });
  if (error) throw error;
  const profile = await admin().from("profiles").insert({ user_id: data.user.id, name: "Rui Costa" }).select("id").single();
  if (profile.error) throw profile.error;
  const account = { email, userId: data.user.id, profileId: profile.data.id };
  accounts.push(account);
  return account;
}

// A sold listing with an order of the given status (what Pay leaves behind).
async function addOrder(buyer: Account, status: "paid_waiting_seller" | "seller_paid" = "paid_waiting_seller") {
  const listing = await admin()
    .from("listings")
    .insert({
      seller_id: "30000000-0000-0000-0000-000000000001",
      claimed_version_id: V_HOMOGENIC_2017,
      actual_version_id: V_HOMOGENIC_2017,
      condition_code: "VG+",
      price: 32,
      status: "sold",
      cover_photo_url: "/photos/cover.svg",
      record_photo_url: "/photos/record.svg",
      matrix_photo_url: "/photos/matrix.svg",
    })
    .select("id")
    .single();
  if (listing.error) throw listing.error;
  listingIds.push(listing.data.id);
  const checks = await admin()
    .from("check_results")
    .insert(["cover_label", "country_year", "matrix"].map((item) => ({ listing_id: listing.data.id, item, result: "match" })));
  if (checks.error) throw checks.error;
  const order = await admin()
    .from("orders")
    .insert({
      buyer_id: buyer.profileId,
      listing_id: listing.data.id,
      record_price: 32,
      shipping: 4.9,
      protection_fee: 2,
      total: 38.9,
      status,
      ship_name: "Rui Costa",
      ship_street: "Rua do Almada 120",
      ship_postcode: "4050-031",
      ship_city: "Porto",
    })
    .select("id")
    .single();
  if (order.error) throw order.error;
  return { listingId: listing.data.id as string, orderId: order.data.id as string };
}

test.afterAll(async () => {
  for (const id of listingIds) {
    const orders = await admin().from("orders").select("id").eq("listing_id", id);
    for (const o of orders.data ?? []) await admin().from("order_messages").delete().eq("order_id", o.id);
    await admin().from("orders").delete().eq("listing_id", id);
    await admin().from("check_results").delete().eq("listing_id", id);
    await admin().from("listings").delete().eq("id", id);
  }
  for (const a of accounts) {
    await admin().from("profiles").delete().eq("user_id", a.userId);
    await admin().auth.admin.deleteUser(a.userId);
  }
});

async function logInTo(page: Page, account: Account, next: string) {
  await page.goto(`/login?next=${encodeURIComponent(next)}`);
  await signIn(page, account.email, PASSWORD);
}
const orderStatus = async (id: string) => (await admin().from("orders").select("status").eq("id", id).single()).data?.status;
const listingStatus = async (id: string) => (await admin().from("listings").select("status").eq("id", id).single()).data?.status;
const onItsWayCard = (page: Page) => page.getByRole("region", { name: "On its way" }).getByRole("listitem", { name: ALBUM });

test("a 'Paid' order shows 'Cancel order'; 'Keep order' and Esc close the box and change nothing", async ({ page }, info) => {
  const buyer = await addAccount("keep", info.project.name);
  const { orderId } = await addOrder(buyer);
  await logInTo(page, buyer, "/account");
  const card = onItsWayCard(page);
  await card.getByRole("button", { name: "Cancel order" }).click();
  const box = card.getByRole("group", { name: "Cancel this order?" });
  await expect(box).toContainText("The record goes back on sale and your €38.90 is returned.");
  await expect(box.getByRole("button", { name: "Keep order" })).toBeFocused();
  await screenshot(page, 39, "cancel-box");
  await box.getByRole("button", { name: "Keep order" }).click();
  await expect(box).toHaveCount(0);
  await card.getByRole("button", { name: "Cancel order" }).click();
  await page.keyboard.press("Escape");
  await expect(card.getByRole("group", { name: "Cancel this order?" })).toHaveCount(0);
  await expect(card.getByRole("button", { name: "Cancel order" })).toBeVisible();
  expect(await orderStatus(orderId)).toBe("paid_waiting_seller");
});

test("cancelling moves the order to 'Cancelled', greyed, with no steps and no buttons; the message stays; the record is on sale again and can be bought", async ({ page }, info) => {
  const buyer = await addAccount("cancel", info.project.name);
  const other = await addAccount("rebuy", info.project.name);
  const { listingId, orderId } = await addOrder(buyer);
  const written = await admin().from("order_messages").insert({ order_id: orderId, body: "Please pack it well." });
  if (written.error) throw written.error;
  await logInTo(page, buyer, "/account");
  const card = onItsWayCard(page);
  await expect(card.getByRole("button", { name: "Cancel order" })).toBeVisible();
  await screenshot(page, 39, "paid-with-link");
  await card.getByRole("button", { name: "Cancel order" }).click();
  await card.getByRole("group", { name: "Cancel this order?" }).getByRole("button", { name: "Cancel order" }).click();

  const cancelled = page.getByRole("region", { name: "Cancelled" });
  await expect(cancelled.getByRole("heading", { name: "Cancelled" })).toBeVisible({ timeout: 15000 });
  const done = cancelled.getByRole("listitem", { name: ALBUM });
  await expect(done).toContainText("Cancelled · €38.90 returned to you");
  await expect(page.getByText("Simulated payment · Illustrative data")).toBeVisible(); // once, under the list
  await expect(done).toContainText("“Please pack it well.”"); // owner's choice 2a
  await expect(done.getByRole("button")).toHaveCount(0);
  await expect(done.getByRole("list", { name: "Order progress" })).toHaveCount(0);
  await expect(page.getByRole("region", { name: "On its way" })).toHaveCount(0);
  await screenshot(page, 39, "cancelled");
  expect(await orderStatus(orderId)).toBe("cancelled");
  expect(await listingStatus(listingId)).toBe("on_sale");

  // Another buyer can now pay for the same record (one live order per listing).
  const rebuy = await admin().rpc("place_order", {
    p_buyer_id: other.profileId,
    p_listing_id: listingId,
    p_shipping: 4.9,
    p_protection_fee: 2,
    p_total: 38.9,
    p_ship_name: "Ana Silva",
    p_ship_street: "Rua de Cedofeita 10",
    p_ship_postcode: "4050-180",
    p_ship_city: "Porto",
  });
  expect(rebuy.error).toBeNull();
  // ...but not twice: the new order is live, so the record is sold again.
  const again = await admin().rpc("place_order", {
    p_buyer_id: buyer.profileId,
    p_listing_id: listingId,
    p_shipping: 4.9,
    p_protection_fee: 2,
    p_total: 38.9,
    p_ship_name: "Rui Costa",
    p_ship_street: "Rua do Almada 120",
    p_ship_postcode: "4050-031",
    p_ship_city: "Porto",
  });
  expect(again.error?.message).toContain("listing_not_on_sale");

  await page.reload();
  await expect(page.getByRole("region", { name: "Cancelled" }).getByRole("listitem", { name: ALBUM })).toBeVisible(); // it stays
});

test("a 'Seller paid' order has no 'Cancel order'", async ({ page }, info) => {
  const buyer = await addAccount("delivered", info.project.name);
  await addOrder(buyer, "seller_paid");
  await logInTo(page, buyer, "/account");
  const card = page.getByRole("region", { name: "Delivered" }).getByRole("listitem", { name: ALBUM });
  await expect(card).toContainText("Delivered. The seller has been paid.");
  await expect(card.getByRole("button", { name: "Cancel order" })).toHaveCount(0);
});

test("confirmed in another tab: cancelling changes nothing and says 'This order can no longer be cancelled.'", async ({ page }, info) => {
  const buyer = await addAccount("refused", info.project.name);
  const { listingId, orderId } = await addOrder(buyer);
  await logInTo(page, buyer, "/account");
  const card = onItsWayCard(page);
  await card.getByRole("button", { name: "Cancel order" }).click();
  await admin().from("orders").update({ status: "seller_paid" }).eq("id", orderId); // the other tab
  await card.getByRole("group", { name: "Cancel this order?" }).getByRole("button", { name: "Cancel order" }).click();
  const delivered = page.getByRole("region", { name: "Delivered" }).getByRole("listitem", { name: ALBUM });
  await expect(delivered).toContainText("This order can no longer be cancelled.", { timeout: 15000 });
  await expect(delivered).toContainText("Delivered. The seller has been paid.");
  expect(await orderStatus(orderId)).toBe("seller_paid");
  expect(await listingStatus(listingId)).toBe("sold");
});

test("cancelling: 'Cancelling…' while it saves; if it fails, an error screen with 'Try again' and the order unchanged", async ({ page }, info) => {
  const buyer = await addAccount("fail", info.project.name);
  const { listingId, orderId } = await addOrder(buyer);
  await logInTo(page, buyer, "/account");
  const card = onItsWayCard(page);
  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => (release = resolve));
  await page.route("**/*", async (route) => {
    if (isServerAction(route)) await gate;
    await route.continue();
  });
  await card.getByRole("button", { name: "Cancel order" }).click();
  const saved = await page.context().cookies();
  await page.context().clearCookies(); // the session has ended: the server refuses it for real
  await card.getByRole("group", { name: "Cancel this order?" }).getByRole("button", { name: "Cancel order" }).click();
  await expect(card.getByRole("status").filter({ hasText: "Cancelling…" })).toBeVisible();
  release();
  const alert = page.getByRole("alert").filter({ hasText: "We couldn't cancel your order" });
  await expect(alert).toBeVisible({ timeout: 15000 });
  expect(await orderStatus(orderId)).toBe("paid_waiting_seller");
  expect(await listingStatus(listingId)).toBe("sold");
  await page.context().addCookies(saved);
  await alert.getByRole("button", { name: "Try again" }).click();
  await expect(alert).toHaveCount(0);
  // "Try again" brings back the box, as it was; one more tap cancels.
  const box = card.getByRole("group", { name: "Cancel this order?" });
  await box.getByRole("button", { name: "Cancel order" }).click();
  await expect(page.getByRole("region", { name: "Cancelled" }).getByRole("listitem", { name: ALBUM })).toBeVisible({ timeout: 15000 });
  expect(await orderStatus(orderId)).toBe("cancelled");
});
