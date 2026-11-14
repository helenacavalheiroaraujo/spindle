// Story 20 · Cart — critical flow, run on phone and desktop (playwright.config.ts).
// Creates a real test account in Supabase (already confirmed) and removes it afterwards, with its listings, carts and orders.
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

const V2012 = "20000000-0000-0000-0000-000000000003";
const GREEN_32 = "40000000-0000-0000-0000-000000000005";
const V_HOMOGENIC_2017 = "20000000-0000-0000-0000-000000000010";
const SEED_SELLER = "30000000-0000-0000-0000-000000000001";
const PASSWORD = "vinyl-test-123";

let email = "";
let userId = "";
let profileId = "";
const made: string[] = []; // listings of this run

// A green listing of its own for each run, so the tests never change the demo data.
async function addListing(price: number, sellerId = SEED_SELLER): Promise<string> {
  const { data, error } = await admin()
    .from("listings")
    .insert({
      seller_id: sellerId,
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

let a28 = "";
let red = ""; // red: the country/year and the matrix do not match, and it is not moved to another version
let b30 = "";
let own = "";
// The phone and the desktop run at the same time on the same data: each has its own prices for the red and the own listing.
let ownPrice = 0;
let redPrice = 0;

test.beforeAll(async ({}, info) => {
  email = `spindle-cart-${info.project.name}-${Date.now()}@spindle.test`;
  const { data, error } = await admin().auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { name: "Rui Costa" },
  });
  if (error) throw error;
  userId = data.user.id;
  const profile = await admin().from("profiles").insert({ user_id: userId, name: "Rui Costa" }).select("id").single();
  if (profile.error) throw profile.error;
  profileId = profile.data.id;
  a28 = await addListing(28);
  b30 = await addListing(30);
  ownPrice = info.project.name === "phone" ? 33 : 35;
  redPrice = info.project.name === "phone" ? 25 : 26;
  own = await addListing(ownPrice, profileId);
  red = await addListing(redPrice);
  await admin().from("check_results").update({ result: "no_match" }).eq("listing_id", red).in("item", ["country_year", "matrix"]);
});

test.afterAll(async () => {
  await admin().from("cart_items").delete().eq("buyer_id", profileId);
  for (const id of made) {
    await admin().from("cart_items").delete().eq("listing_id", id);
    await admin().from("orders").delete().eq("listing_id", id);
    await admin().from("check_results").delete().eq("listing_id", id);
    await admin().from("listings").delete().eq("id", id);
  }
  await admin().from("profiles").delete().eq("user_id", userId);
  await admin().auth.admin.deleteUser(userId);
});

test.beforeEach(async () => {
  // Every test starts with an empty cart and on-sale listings.
  await admin().from("cart_items").delete().eq("buyer_id", profileId);
  await admin().from("orders").delete().in("listing_id", made);
  await admin().from("listings").update({ status: "on_sale" }).in("id", made);
});

const logIn = (page: Page) => signIn(page, email, PASSWORD);
async function signedIn(page: Page, next = "/") {
  await page.goto(`/login?next=${encodeURIComponent(next)}`);
  await logIn(page);
  await expect(page).toHaveURL(next);
}
const inCart = async () => {
  const { data } = await admin().from("cart_items").select("listing_id").eq("buyer_id", profileId);
  return (data ?? []).map((r) => r.listing_id).sort();
};
// The address a signed-out buyer returns to after logging in: it adds the record and goes back (home, without ?next=).
async function visitAdd(page: Page, id: string) {
  await page.goto(`/cart/add/${id}`);
  await page.waitForURL("/");
}
const listingPage = (id: string) => `/listings/${id}?version=${V_HOMOGENIC_2017}`;

// Clicking before React has taken over the page does nothing: wait until the button is hydrated.
async function hydrated(page: Page, name: RegExp | string) {
  const handle = await page.getByRole("button", { name }).first().elementHandle();
  await page.waitForFunction((el) => !!el && Object.keys(el).some((k) => k.startsWith("__reactProps")), handle);
}
async function addToCart(page: Page, id: string) {
  await page.goto(listingPage(id));
  await hydrated(page, /^Add to cart/);
  await page.getByRole("button", { name: /^Add to cart/ }).click();
  await expect(page.getByText("Added to your cart")).toBeVisible();
}
const header = (page: Page) => page.locator("header");
const cartLink = (page: Page, name: string) => page.getByRole("link", { name, exact: true }).first();
async function fillAddress(page: Page) {
  const first = await page.getByLabel("Name").elementHandle();
  await page.waitForFunction((el) => !!el && Object.keys(el).some((k) => k.startsWith("__reactProps")), first);
  await page.getByLabel("Name").fill("Rui Costa");
  await page.getByLabel("Street").fill("Rua do Almada 120");
  await page.getByLabel("Postcode").fill("4050-031");
  await page.getByLabel("City").fill("Porto");
}

test("Add to cart on a green listing: 'Added to your cart' with View cart, the record is in the cart, and the header counts it", async ({ page }) => {
  await signedIn(page);
  await page.goto(listingPage(a28));
  await expect(page.getByRole("link", { name: /^Buy with protection/ })).toBeVisible(); // Buy stays
  await screenshot(page, 20, "add-to-cart");
  await hydrated(page, /^Add to cart/);
  await page.getByRole("button", { name: /^Add to cart/ }).click();
  await expect(page.getByText("Added to your cart")).toBeVisible();
  await expect(page.getByRole("link", { name: "View cart" })).toBeVisible();
  await screenshot(page, 20, "added");
  expect(await inCart()).toEqual([a28]);
  await expect(cartLink(page, "Cart, 1 record")).toBeVisible();

  // Back on the listing: "In your cart · View cart"; the same listing cannot be added twice.
  await page.goto(listingPage(a28));
  await expect(page.getByText("In your cart ·")).toBeVisible();
  await expect(page.getByRole("button", { name: /^Add to cart/ })).toHaveCount(0);
  await visitAdd(page, a28); // a second add (as after logging in) changes nothing
  expect(await inCart()).toEqual([a28]);
});

test("Add to cart on the list of a version, beside Buy", async ({ page }) => {
  await signedIn(page);
  await page.goto(`/versions/${V2012}/listings`);
  const row = page.getByRole("list", { name: "Verified listings" }).getByRole("listitem").nth(0); // the green €32
  await expect(row.getByRole("link", { name: /^Buy/ })).toBeVisible();
  await hydrated(page, /^Add to cart/);
  await row.getByRole("button", { name: /^Add to cart/ }).click();
  await expect(row.getByText("Added to your cart")).toBeVisible();
  expect(await inCart()).toEqual([GREEN_32]);
});

test("signed out: Add to cart asks to log in, and after logging in the record is in the cart", async ({ page }) => {
  await page.goto(listingPage(a28));
  await hydrated(page, /^Add to cart/);
  await page.getByRole("button", { name: /^Add to cart/ }).click();
  // Story 27: the log-in window opens on the page (it replaced the "Log in to add this record to your cart" line).
  const box = page.getByRole("dialog");
  await expect(box.getByRole("heading", { name: "Log in to add to your cart" })).toBeVisible();
  expect(await inCart()).toEqual([]); // nothing yet
  await box.getByLabel("Email").fill(email);
  await box.getByLabel("Password").fill(PASSWORD);
  await box.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(listingPage(a28)); // back where they were
  await expect(page.getByText("In your cart ·")).toBeVisible();
  expect(await inCart()).toEqual([a28]);
});

test("a red listing, a sold listing and the seller's own listing cannot be added", async ({ page }) => {
  await signedIn(page);
  // Red: no Add to cart (nor Buy) on its row; and the server refuses it too.
  await page.goto(`/versions/${V_HOMOGENIC_2017}/listings`);
  await expect(page.getByRole("listitem", { name: new RegExp(`€${redPrice}`) }).getByRole("button", { name: /^Add to cart/ })).toHaveCount(0);
  await expect(page.getByRole("listitem", { name: new RegExp(`€${redPrice}`) }).getByText("No match").first()).toBeVisible();
  await visitAdd(page, red);
  // Red under the claimed version of the seed (moved to another version): not on that row either.
  await page.goto(`/versions/${V2012}/listings`);
  await expect(page.getByRole("button", { name: /^Add to cart/ })).toHaveCount(2); // the green and the yellow only
  // Sold.
  await admin().from("listings").update({ status: "sold" }).eq("id", b30);
  await visitAdd(page, b30);
  // The seller's own listing: "Your listing" instead of Buy and Add to cart.
  await page.goto(`/versions/${V_HOMOGENIC_2017}/listings`);
  await expect(page.getByRole("listitem", { name: new RegExp(`€${ownPrice}`) }).getByText("Your listing")).toBeVisible();
  await expect(page.getByRole("listitem", { name: new RegExp(`€${ownPrice}`) }).getByRole("button", { name: /^Add to cart/ })).toHaveCount(0);
  await visitAdd(page, own);
  expect(await inCart()).toEqual([]);
});

test("the cart: records, prices, total €34.90 for one record and €71.80 for €28 and €30; Remove recalculates", async ({ page }) => {
  await signedIn(page);
  await addToCart(page, a28);
  await page.goto("/cart");
  const summary = page.getByRole("region", { name: "Summary" });
  await expect(summary.getByRole("definition")).toHaveText(["€28.00", "€4.90", "€2.00", "€34.90"]);

  await addToCart(page, b30);
  await expect(cartLink(page, "Cart, 2 records")).toBeVisible();
  await page.goto("/cart");
  const list = page.getByRole("list", { name: "Records in your cart" }).getByRole("listitem");
  await expect(list).toHaveCount(2);
  await expect(list.nth(0)).toContainText("Homogenic, 2017 Reissue");
  await expect(list.nth(0)).toContainText("VG+");
  await expect(list.nth(0)).toContainText("€28.00");
  await expect(list.nth(1)).toContainText("€30.00");
  await expect(summary.getByRole("term")).toHaveText(["Records", "Insured shipping · 2 × €4.90", "Buyer protection · 2 × €2.00", "Total"]);
  await expect(summary.getByRole("definition")).toHaveText(["€58.00", "€9.80", "€4.00", "€71.80"]);
  await expect(page.getByText("Simulated payment · Illustrative data")).toBeVisible();
  await expect(page.getByRole("link", { name: "Go to checkout" })).toBeVisible();
  await screenshot(page, 20, "cart");

  await hydrated(page, /^Remove/);
  await list.nth(0).getByRole("button", { name: /^Remove/ }).click();
  await expect(list).toHaveCount(1);
  await expect(summary.getByRole("definition")).toHaveText(["€30.00", "€4.90", "€2.00", "€36.90"]);
  await expect(cartLink(page, "Cart, 1 record")).toBeVisible();
  expect(await inCart()).toEqual([b30]);
});

test("an empty cart says so, with a link to search; the header shows no number", async ({ page }) => {
  await signedIn(page);
  await page.goto("/cart");
  await expect(page.getByRole("heading", { name: "Your cart is empty" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Search for an album" })).toHaveAttribute("href", "/");
  await expect(cartLink(page, "Cart")).toBeVisible(); // no count in its name
  await screenshot(page, 20, "cart-empty");
});

test("the menu: the Cart cell with the number of records in the phone drawer", async ({ page, isMobile }) => {
  test.skip(!isMobile, "the drawer exists on the phone; the desktop shows the cart icon in the header");
  await signedIn(page);
  await addToCart(page, a28);
  await addToCart(page, b30);
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  const cell = page.getByRole("dialog", { name: "Menu" }).getByRole("link", { name: /^Cart/ });
  await expect(cell).toContainText("2");
  await screenshot(page, 20, "menu-cart");
  await cell.click();
  await expect(page).toHaveURL("/cart");
});

test("a record sold to someone else while in the cart leaves it with a message and the total is recalculated", async ({ page }) => {
  await signedIn(page);
  await addToCart(page, a28);
  await addToCart(page, b30);
  await admin().from("listings").update({ status: "sold" }).eq("id", a28);
  await page.goto("/cart");
  await expect(page.getByRole("status").filter({ hasText: "left your cart" })).toHaveText(
    "“Homogenic, 2017 Reissue” was just sold to someone else and left your cart. The total is updated.",
  );
  const list = page.getByRole("list", { name: "Records in your cart" }).getByRole("listitem");
  await expect(list).toHaveCount(1);
  await expect(page.getByRole("region", { name: "Summary" }).getByRole("definition")).toHaveText(["€30.00", "€4.90", "€2.00", "€36.90"]);
  await screenshot(page, 20, "cart-sold");
  expect(await inCart()).toEqual([b30]);
});

test("checkout: the address is typed once; Pay creates one order for each record, 'Paid · waiting for the seller', the listings are sold and the cart is empty", async ({ page }) => {
  await signedIn(page);
  await addToCart(page, a28);
  await addToCart(page, b30);
  await page.goto("/cart");
  await page.getByRole("link", { name: "Go to checkout" }).click();
  await expect(page).toHaveURL("/cart/checkout");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Buy with protection");
  await expect(page.getByRole("region", { name: "The records" })).toContainText("Homogenic, 2017 Reissue");
  await expect(page.getByRole("definition")).toHaveText(["€58.00", "€9.80", "€4.00", "€71.80"]);
  const pay = page.getByRole("button", { name: "Pay €71.80" });
  await expect(pay).toBeDisabled();
  // No card number or bank details anywhere.
  await expect(page.locator('input[autocomplete^="cc-"]')).toHaveCount(0);
  await expect(page.getByText(/card number|IBAN|CVV|expiry/i)).toHaveCount(0);
  await expect(page.getByRole("textbox")).toHaveCount(4); // one address, for all the records
  await screenshot(page, 20, "checkout");
  await fillAddress(page);
  await expect(pay).toBeEnabled();
  await pay.click();

  // Story 30: the cart checkout ends on its own "Order placed" page; Your account shows the orders like any other.
  await expect(page).toHaveURL(/\/orders\/placed\?ids=/);
  await expect(page.getByText("€71.80 paid for 2 records")).toBeVisible();
  await page.goto("/account");
  const cards = page.getByRole("region", { name: "On its way" }).getByRole("listitem", { name: "Homogenic, 2017 Reissue" });
  await expect(cards).toHaveCount(2);
  await screenshot(page, 20, "orders-in-account");

  const { data: orders } = await admin().from("orders").select("listing_id, status, total, ship_postcode").eq("buyer_id", profileId).order("total");
  expect(orders).toEqual([
    { listing_id: a28, status: "paid_waiting_seller", total: 34.9, ship_postcode: "4050-031" },
    { listing_id: b30, status: "paid_waiting_seller", total: 36.9, ship_postcode: "4050-031" },
  ]);
  const { data: listings } = await admin().from("listings").select("status").in("id", [a28, b30]);
  expect(listings?.map((l) => l.status)).toEqual(["sold", "sold"]);
  expect(await inCart()).toEqual([]);
});

test("desktop: the cart checkout keeps the cream strip under the navy row, without the search (bug 31)", async ({ page, isMobile }) => {
  test.skip(isMobile, "the strip exists on the desktop only");
  await signedIn(page);
  await addToCart(page, a28);
  await page.goto("/cart/checkout");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Buy with protection");
  await expect(page.getByTestId("header-search-strip")).toBeVisible();
  await expect(page.locator("header").getByRole("search")).toHaveCount(0);
  await page.goto("/cart"); // other pages keep the search
  await expect(page.locator("header").getByRole("search")).toBeVisible();
});

test("a record sold between opening the checkout and paying: nothing is paid, it leaves the cart with a message", async ({ page }) => {
  await signedIn(page);
  await addToCart(page, a28);
  await addToCart(page, b30);
  await page.goto("/cart/checkout");
  await fillAddress(page);
  await admin().from("listings").update({ status: "sold" }).eq("id", b30);
  await page.getByRole("button", { name: "Pay €71.80" }).click();

  await expect(page).toHaveURL("/cart");
  await expect(page.getByRole("status").filter({ hasText: "left your cart" })).toContainText("was just sold to someone else");
  await expect(page.getByRole("region", { name: "Summary" }).getByRole("definition")).toHaveText(["€28.00", "€4.90", "€2.00", "€34.90"]);
  const { data: orders } = await admin().from("orders").select("id").eq("buyer_id", profileId);
  expect(orders).toEqual([]); // nothing was paid
  const { data: kept } = await admin().from("listings").select("status").eq("id", a28).single();
  expect(kept?.status).toBe("on_sale");
});

test("checkout of an empty cart goes back to the cart; signed out, the cart asks to log in and comes back", async ({ page }) => {
  await page.goto("/cart");
  await expect(page).toHaveURL(`/login?next=${encodeURIComponent("/cart")}`);
  await logIn(page);
  await expect(page).toHaveURL("/cart");
  await page.goto("/cart/checkout");
  await expect(page).toHaveURL("/cart");
});
