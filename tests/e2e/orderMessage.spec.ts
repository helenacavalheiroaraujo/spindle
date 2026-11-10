// Bug 8 · The buyer messages the seller from the order (design option A); the seller reads it on the Sold tab.
// Creates test accounts, listings and orders in Supabase and removes them afterwards. Phone and desktop.
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
const MESSAGE = "Hi, could you send it with tracking?";

type Account = { email: string; userId: string; profileId: string };
let buyer: Account;
let seller: Account;
let paidOrder = "";
const listingIds: string[] = [];
const orderIds: string[] = [];

async function addAccount(label: string, project: string, name: string): Promise<Account> {
  const email = `spindle-${label}-${project}-${Date.now()}@spindle.test`;
  const { data, error } = await admin().auth.admin.createUser({ email, password: PASSWORD, email_confirm: true, user_metadata: { name } });
  if (error) throw error;
  const profile = await admin().from("profiles").insert({ user_id: data.user.id, name }).select("id").single();
  if (profile.error) throw profile.error;
  return { email, userId: data.user.id, profileId: profile.data.id };
}

// A sold listing of the test seller with an order of the test buyer.
async function addOrder(status: "paid_waiting_seller" | "seller_paid"): Promise<string> {
  const listing = await admin()
    .from("listings")
    .insert({
      seller_id: seller.profileId,
      claimed_version_id: V_HOMOGENIC_2017,
      actual_version_id: V_HOMOGENIC_2017,
      condition_code: "VG+",
      price: 28,
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
      record_price: 28,
      shipping: 4.9,
      protection_fee: 2,
      total: 34.9,
      status,
      ship_name: "Rui Costa",
      ship_street: "Rua do Almada 120",
      ship_postcode: "4050-031",
      ship_city: "Porto",
    })
    .select("id")
    .single();
  if (order.error) throw order.error;
  orderIds.push(order.data.id);
  return order.data.id;
}

test.beforeAll(async ({}, info) => {
  buyer = await addAccount("msg-buyer", info.project.name, "Rui Costa");
  seller = await addAccount("msg-seller", info.project.name, "Ana Silva");
  paidOrder = await addOrder("paid_waiting_seller");
  await addOrder("seller_paid"); // delivered: no message button
});

test.afterAll(async () => {
  for (const id of orderIds) {
    await admin().from("order_messages").delete().eq("order_id", id);
    await admin().from("orders").delete().eq("id", id);
  }
  for (const id of listingIds) {
    await admin().from("check_results").delete().eq("listing_id", id);
    await admin().from("listings").delete().eq("id", id);
  }
  for (const a of [buyer, seller]) {
    await admin().from("profiles").delete().eq("user_id", a.userId);
    await admin().auth.admin.deleteUser(a.userId);
  }
});

async function logInTo(page: Page, account: Account, next: string) {
  await page.goto(`/login?next=${encodeURIComponent(next)}`);
  await signIn(page, account.email, PASSWORD);
}
const onItsWay = (page: Page) => page.getByRole("region", { name: "On its way" });
const delivered = (page: Page) => page.getByRole("region", { name: "Delivered" });

test.describe.configure({ mode: "serial" });

test("a paid order offers 'Message the seller' next to 'It arrived'; an empty message is refused", async ({ page }) => {
  await logInTo(page, buyer, "/account");
  await expect(onItsWay(page).getByRole("button", { name: "It arrived, all good" })).toBeVisible();
  await screenshot(page, "bug-8", "order-paid");
  await onItsWay(page).getByRole("button", { name: "Message the seller" }).click();
  await screenshot(page, "bug-8", "message-form");
  await onItsWay(page).getByRole("button", { name: "Send message" }).click();
  await expect(onItsWay(page).getByText("Write a message first.")).toBeVisible();
  await onItsWay(page).getByRole("button", { name: "Not now" }).click();
  await expect(onItsWay(page).getByRole("button", { name: "Message the seller" })).toBeVisible();
  expect((await admin().from("order_messages").select("id").eq("order_id", paidOrder)).data).toHaveLength(0);
});

test("the buyer sends one message: 'You wrote', no second message, the order is not cancelled", async ({ page }) => {
  await logInTo(page, buyer, "/account");
  await onItsWay(page).getByRole("button", { name: "Message the seller" }).click();
  await onItsWay(page).getByLabel("Your message to the seller").fill(`  ${MESSAGE}  `);
  await onItsWay(page).getByRole("button", { name: "Send message" }).click();
  await expect(onItsWay(page).getByText("You wrote")).toBeVisible();
  await expect(onItsWay(page).getByText(`“${MESSAGE}”`)).toBeVisible();
  await expect(onItsWay(page).getByRole("button", { name: "Message the seller" })).toHaveCount(0);
  await screenshot(page, "bug-8", "you-wrote");
  await page.reload();
  await expect(onItsWay(page).getByText(`“${MESSAGE}”`)).toBeVisible(); // still there
  await expect(onItsWay(page).getByRole("button", { name: "It arrived, all good" })).toBeVisible(); // order still Paid
  const saved = await admin().from("order_messages").select("body").eq("order_id", paidOrder);
  expect(saved.data).toEqual([{ body: MESSAGE }]); // one row, trimmed
  const order = await admin().from("orders").select("status").eq("id", paidOrder).single();
  expect(order.data?.status).toBe("paid_waiting_seller");
});

test("a delivered order without a message has no 'Message the seller'", async ({ page }) => {
  await logInTo(page, buyer, "/account");
  await expect(delivered(page).getByText("Delivered. The seller has been paid.")).toBeVisible();
  await expect(delivered(page).getByRole("button", { name: "Message the seller" })).toHaveCount(0);
});

test("the seller reads the message under the sold record on the Sold tab", async ({ page }) => {
  await logInTo(page, seller, "/my-listings");
  await page.getByRole("tab", { name: /^Sold/ }).click();
  const sold = page.getByRole("list", { name: "Sold" }).getByRole("listitem");
  await expect(sold).toHaveCount(2);
  await expect(sold.filter({ hasText: "Message from Rui Costa" })).toHaveCount(1); // only the order with a message
  await expect(sold.filter({ hasText: `“${MESSAGE}”` })).toHaveCount(1);
  await screenshot(page, "bug-8", "seller-sold-tab");
});
