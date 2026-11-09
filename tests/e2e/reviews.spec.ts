// Story 18 · Rate the seller — critical flow, run on phone and desktop (playwright.config.ts).
// Creates a test buyer, a test seller, listings and orders in Supabase and removes them (and their reviews) afterwards,
// so the illustrative reviews of the seed sellers never change. Uses the illustrative data in supabase/seed.sql.
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
const V2012 = "20000000-0000-0000-0000-000000000003";
const PASSWORD = "vinyl-test-123";
const isServerAction = (route: { request: () => { method: () => string; headers: () => Record<string, string> } }) =>
  route.request().method() === "POST" && !!route.request().headers()["next-action"];

let email = "";
let userId = "";
let buyerId = "";
let sellerId = "";
const listingIds: string[] = [];
const orderIds: string[] = [];

// A sold listing of the test seller with an order of the test buyer; status "seller_paid" = already confirmed.
async function addOrder(status: "paid_waiting_seller" | "seller_paid"): Promise<{ orderId: string; listingId: string }> {
  const l = await admin()
    .from("listings")
    .insert({
      seller_id: sellerId,
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
  if (l.error) throw l.error;
  listingIds.push(l.data.id);
  const checks = await admin()
    .from("check_results")
    .insert(["cover_label", "country_year", "matrix"].map((item) => ({ listing_id: l.data.id, item, result: "match" })));
  if (checks.error) throw checks.error;
  const o = await admin()
    .from("orders")
    .insert({
      buyer_id: buyerId,
      listing_id: l.data.id,
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
  if (o.error) throw o.error;
  orderIds.push(o.data.id);
  return { orderId: o.data.id, listingId: l.data.id };
}

test.beforeAll(async ({}, info) => {
  email = `spindle-review-${info.project.name}-${Date.now()}@spindle.test`;
  const u = await admin().auth.admin.createUser({ email, password: PASSWORD, email_confirm: true, user_metadata: { name: "Rui Costa" } });
  if (u.error) throw u.error;
  userId = u.data.user.id;
  const b = await admin().from("profiles").insert({ user_id: userId, name: "Rui Costa" }).select("id").single();
  if (b.error) throw b.error;
  buyerId = b.data.id;
  const s = await admin().from("profiles").insert({ name: "Test Seller", city: "Faro" }).select("id").single();
  if (s.error) throw s.error;
  sellerId = s.data.id;
});

test.afterAll(async () => {
  await admin().from("reviews").delete().eq("seller_id", sellerId);
  await admin().from("orders").delete().eq("buyer_id", buyerId);
  for (const id of listingIds) {
    await admin().from("check_results").delete().eq("listing_id", id);
    await admin().from("listings").delete().eq("id", id);
  }
  await admin().from("profiles").delete().eq("id", sellerId);
  await admin().from("profiles").delete().eq("id", buyerId);
  await admin().auth.admin.deleteUser(userId);
});

async function logInTo(page: Page, next: string) {
  await page.goto(`/login?next=${encodeURIComponent(next)}`);
  await signIn(page, email, PASSWORD);
}
const reviews = async () => (await admin().from("reviews").select("order_id, rating, seller_id").eq("seller_id", sellerId)).data ?? [];
const card = (page: Page) => page.getByRole("listitem", { name: "Homogenic, 2017 Reissue" });

test("listings show the seller's reviews on their own line: average and count, one review, or 'No reviews yet'", async ({ page }) => {
  // Seed sellers: Discos do Rui 12 reviews (4.75), João Pinto 1 review (5), Marta Lopes none.
  await page.goto(`/listings/40000000-0000-0000-0000-000000000005?version=${V2012}`); // Discos do Rui
  await expect(page.getByText("★ 4.8 · 12 reviews")).toBeVisible();
  await page.goto(`/listings/40000000-0000-0000-0000-000000000004?version=20000000-0000-0000-0000-000000000001`); // João Pinto
  await expect(page.getByText("★ 5.0 · 1 review", { exact: true })).toBeVisible();
  await page.goto(`/listings/40000000-0000-0000-0000-000000000008?version=${V2012}`); // Marta Lopes
  await expect(page.getByText("No reviews yet")).toBeVisible();
  // The same words on the list of listings.
  await page.goto(`/versions/${V2012}/listings`);
  await expect(page.getByRole("link", { name: /^Open €32/ })).toContainText("★ 4.8 · 12 reviews");
  await expect(page.getByRole("link", { name: /^Open €29/ })).toContainText("No reviews yet");
  await screenshot(page, 18, "listings-rating");
});

test("confirm receipt, then the question opens by itself; Send review waits for a star; the review is saved once", async ({ page }) => {
  const { orderId, listingId } = await addOrder("paid_waiting_seller");
  await logInTo(page, "/account");
  await card(page).getByRole("button", { name: "It arrived, all good" }).click();
  await card(page).getByRole("button", { name: "Yes, release the money" }).click();

  const question = page.getByRole("group", { name: "How was the seller?" });
  await expect(question).toBeVisible();
  await expect(question.getByText("Choose from 1 to 5 stars")).toBeVisible();
  await expect(page.getByRole("button", { name: "Send review" })).toBeDisabled();
  await screenshot(page, 18, "rate-question");
  await question.getByText("4", { exact: true }).click();
  await expect(question.getByText("4 of 5 stars")).toBeVisible();
  await expect(page.getByRole("button", { name: "Send review" })).toBeEnabled();
  await page.getByRole("button", { name: "Send review" }).click();

  await expect(card(page).getByText("Thanks, your review is in.")).toBeVisible();
  await expect(page.getByRole("group", { name: "How was the seller?" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Rate this seller" })).toHaveCount(0);
  expect(await reviews()).toEqual([expect.objectContaining({ order_id: orderId, rating: 4, seller_id: sellerId })]);

  await page.reload();
  await expect(card(page).getByText("Thanks, your review is in.")).toBeVisible(); // the question does not come back
  await expect(page.getByRole("group", { name: "How was the seller?" })).toHaveCount(0);

  // The seller's summary on their listing now counts it (the listing is put back on sale so it can be opened).
  await admin().from("listings").update({ status: "on_sale" }).eq("id", listingId);
  await page.goto(`/listings/${listingId}?version=${V_HOMOGENIC_2017}`);
  await expect(page.getByText("★ 4.0 · 1 review", { exact: true })).toBeVisible();

  // A second review of the same order is refused by the table.
  const again = await admin().from("reviews").insert({ order_id: orderId, seller_id: sellerId, rating: 1 });
  expect(again.error?.code).toBe("23505");
});

test("'Not now' closes the question; 'Rate this seller' stays on the delivered order and opens it again", async ({ page }) => {
  const { orderId } = await addOrder("seller_paid");
  await logInTo(page, "/account");
  // Opened from a reload, not right after confirming: the button, not the question.
  const delivered = page.getByRole("region", { name: "Delivered" });
  const mine = delivered.getByRole("listitem", { name: "Homogenic, 2017 Reissue" }).filter({ hasNotText: "Thanks, your review is in." });
  await expect(page.getByRole("group", { name: "How was the seller?" })).toHaveCount(0);
  await mine.first().getByRole("button", { name: "Rate this seller" }).click();
  await expect(page.getByRole("group", { name: "How was the seller?" })).toBeVisible();
  await page.getByRole("button", { name: "Not now" }).click();
  await expect(page.getByRole("group", { name: "How was the seller?" })).toHaveCount(0);
  await expect(mine.first().getByRole("button", { name: "Rate this seller" })).toBeVisible();
  expect((await reviews()).filter((r) => r.order_id === orderId)).toHaveLength(0); // nothing saved
  await screenshot(page, 18, "rate-this-seller");
});

test("a failed save shows the error screen with 'Try again', keeps the stars, and recovers", async ({ page }) => {
  await addOrder("seller_paid");
  await logInTo(page, "/account");
  const open = page.getByRole("button", { name: "Rate this seller" }).first();
  await open.click();
  const question = page.getByRole("group", { name: "How was the seller?" }).first();
  await question.getByText("5", { exact: true }).click();
  // The save is held back so the mask shows; then it fails for real: the session has ended, so the server refuses it.
  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => (release = resolve));
  await page.route("**/*", async (route) => {
    if (isServerAction(route)) await gate;
    await route.continue();
  });
  const saved = await page.context().cookies();
  await page.context().clearCookies();
  await page.getByRole("button", { name: "Send review" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Sending…" })).toBeVisible();
  release();
  const alert = page.getByRole("alert").filter({ hasText: "We couldn't send your review" });
  await expect(alert).toBeVisible({ timeout: 15000 });
  await expect(question.getByText("5 of 5 stars")).toBeVisible(); // the stars are kept
  await page.context().addCookies(saved); // signed in again
  await alert.getByRole("button", { name: "Try again" }).click();
  await expect(alert).toHaveCount(0);
  await expect(question.getByText("5 of 5 stars")).toBeVisible();
  await page.getByRole("button", { name: "Send review" }).click();
  await expect(page.getByText("Thanks, your review is in.").first()).toBeVisible();
});

test("an order that is not delivered yet has no question and no 'Rate this seller'", async ({ page }) => {
  await addOrder("paid_waiting_seller");
  await logInTo(page, "/account");
  const waiting = page.getByRole("region", { name: "On its way" }).getByRole("listitem", { name: "Homogenic, 2017 Reissue" }).first();
  await expect(waiting.getByRole("button", { name: "Rate this seller" })).toHaveCount(0);
  await expect(waiting.getByRole("group", { name: "How was the seller?" })).toHaveCount(0);
});
