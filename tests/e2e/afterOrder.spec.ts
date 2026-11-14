// Story 30 · Next steps after "Order placed" — critical flow, run on phone and desktop (playwright.config.ts).
// Creates two test accounts (the buyer and another user) and their own listings in Supabase, and removes them afterwards.
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
const SEED_SELLER = "30000000-0000-0000-0000-000000000001";
const PASSWORD = "vinyl-test-123";

type Account = { email: string; userId: string; profileId: string };
let buyer: Account;
let other: Account;
const made: string[] = []; // listings of this run

async function createAccount(kind: string, project: string, name: string): Promise<Account> {
  const email = `spindle-after-order-${kind}-${project}-${Date.now()}@spindle.test`;
  const { data, error } = await admin().auth.admin.createUser({ email, password: PASSWORD, email_confirm: true, user_metadata: { name } });
  if (error) throw error;
  const profile = await admin().from("profiles").insert({ user_id: data.user.id, name }).select("id").single();
  if (profile.error) throw profile.error;
  return { email, userId: data.user.id, profileId: profile.data.id };
}

// A green listing of its own for each test, so paying never changes the demo data.
async function addListing(price: number): Promise<string> {
  const { data, error } = await admin()
    .from("listings")
    .insert({
      seller_id: SEED_SELLER,
      claimed_version_id: V_HOMOGENIC_2017,
      actual_version_id: V_HOMOGENIC_2017,
      condition_code: "VG+",
      price,
      status: "on_sale",
      cover_photo_url: "/photos/cover.svg",
      record_photo_url: "/photos/record.svg",
      matrix_photo_url: "/photos/matrix.svg",
    })
    .select("id")
    .single();
  if (error) throw error;
  const items = ["cover_label", "country_year", "matrix"].map((item) => ({ listing_id: data.id, item, result: "match" }));
  const checks = await admin().from("check_results").insert(items);
  if (checks.error) throw checks.error;
  made.push(data.id);
  return data.id;
}

test.beforeAll(async ({}, info) => {
  buyer = await createAccount("buyer", info.project.name, "Rui Costa");
  other = await createAccount("other", info.project.name, "Ana Lima");
});

test.afterAll(async () => {
  for (const account of [buyer, other]) await admin().from("cart_items").delete().eq("buyer_id", account.profileId);
  for (const id of made) {
    await admin().from("cart_items").delete().eq("listing_id", id);
    await admin().from("orders").delete().eq("listing_id", id);
    await admin().from("check_results").delete().eq("listing_id", id);
    await admin().from("listings").delete().eq("id", id);
  }
  for (const account of [buyer, other]) {
    await admin().from("profiles").delete().eq("user_id", account.userId);
    await admin().auth.admin.deleteUser(account.userId);
  }
});

async function logInTo(page: Page, account: Account, next: string) {
  await page.goto(`/login?next=${encodeURIComponent(next)}`);
  await signIn(page, account.email, PASSWORD);
}
async function fillAddress(page: Page) {
  const first = await page.getByLabel("Name").elementHandle();
  await page.waitForFunction((el) => !!el && Object.keys(el).some((k) => k.startsWith("__reactProps")), first);
  await page.getByLabel("Name").fill("Rui Costa");
  await page.getByLabel("Street").fill("Rua do Almada 120");
  await page.getByLabel("Postcode").fill("4050-031");
  await page.getByLabel("City").fill("Porto");
}

// "See my orders" and "Back to the home page": both visible, same height and the same font weight; 44 px or taller.
async function expectNextSteps(page: Page) {
  const steps = page.getByRole("navigation", { name: "Next steps" });
  await expect(steps).toHaveCount(1); // the other copy (phone or desktop place) is hidden
  const orders = steps.getByRole("link", { name: "See my orders" });
  const home = steps.getByRole("link", { name: "Back to the home page" });
  await expect(orders).toHaveAttribute("href", "/account/orders");
  await expect(home).toHaveAttribute("href", "/");
  const [a, b] = [await orders.boundingBox(), await home.boundingBox()];
  expect(a!.height).toBeGreaterThanOrEqual(44);
  expect(b!.height).toBe(a!.height);
  const weight = (el: Element) => getComputedStyle(el).fontWeight;
  expect(await orders.evaluate(weight)).toBe(await home.evaluate(weight));
}

test("one record: Pay → 'Order placed' with See my orders and Back to the home page; each opens its page", async ({ page }) => {
  const listing = await addListing(28);
  await logInTo(page, buyer, `/checkout/${listing}?version=${V_HOMOGENIC_2017}`);
  await fillAddress(page);
  await page.getByRole("button", { name: "Pay €34.90" }).click();
  await expect(page).toHaveURL(/\/orders\/[0-9a-f-]{36}$/);
  const orderUrl = page.url();

  // Story 7's content stays.
  await expect(page.getByRole("heading", { name: "Order placed" })).toBeVisible();
  await expect(page.getByText("€34.90 paid")).toBeVisible();
  await expect(page.getByRole("list", { name: "How protection works" }).getByRole("listitem")).toHaveCount(4);
  await expectNextSteps(page);
  await screenshot(page, 30, "order-placed-one");

  await page.getByRole("link", { name: "Back to the home page" }).click();
  await expect(page).toHaveURL("/");
  await page.goto(orderUrl);
  await page.getByRole("link", { name: "See my orders" }).click();
  await expect(page).toHaveURL("/account/orders"); // the Orders tab (story 31)
});

test("cart with two records: Pay → 'Order placed' with the total, the two buttons and one card per record; Back to the home page", async ({ page }) => {
  const a28 = await addListing(28);
  const b30 = await addListing(30);
  await admin().from("cart_items").insert([a28, b30].map((listing_id) => ({ buyer_id: buyer.profileId, listing_id })));
  await logInTo(page, buyer, "/cart/checkout");
  await fillAddress(page);
  await page.getByRole("button", { name: "Pay €71.80" }).click();

  await expect(page).toHaveURL(/\/orders\/placed\?ids=[0-9a-f-]{36},[0-9a-f-]{36}$/);
  const placedUrl = page.url();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Order placed");
  await expect(page.getByText("€71.80 paid for 2 records")).toBeVisible();
  await expectNextSteps(page);

  const cards = page.getByRole("list", { name: "Records bought" }).getByRole("listitem", { name: "Homogenic, 2017 Reissue" });
  await expect(cards).toHaveCount(2);
  const prices = await cards.evaluateAll((els) => els.map((el) => el.textContent?.match(/€\d+\.\d{2}/)?.[0]).sort());
  expect(prices).toEqual(["€34.90", "€36.90"]);
  for (const card of await cards.all()) {
    await expect(card).toContainText("VG+");
    const progress = card.getByRole("list", { name: "Order progress" }).getByRole("listitem");
    await expect(progress).toHaveText(["Paid (done)", "Shipped", "You confirm", "Seller paid"]);
  }
  await expect(page.getByText("Simulated payment · Illustrative data")).toBeVisible();
  await screenshot(page, 30, "order-placed-cart");

  await page.getByRole("link", { name: "Back to the home page" }).click();
  await expect(page).toHaveURL("/");

  // Another user opening the page is refused (as story 7): no order is shown.
  await page.context().clearCookies();
  await logInTo(page, other, new URL(placedUrl).pathname + new URL(placedUrl).search);
  await expect(page.getByRole("heading", { name: "Order placed" })).toHaveCount(0);
  await expect(page.getByText("Homogenic, 2017 Reissue")).toHaveCount(0);
});
