// Story 7 · Buy with protection — critical flow, run on phone and desktop (playwright.config.ts).
// Creates a real test account in Supabase (already confirmed) and removes it afterwards.
// Uses the illustrative data in supabase/seed.sql.
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

const V1990 = "20000000-0000-0000-0000-000000000002";
const V2012 = "20000000-0000-0000-0000-000000000003";
const GREEN_32 = "40000000-0000-0000-0000-000000000005";
const YELLOW_36 = "40000000-0000-0000-0000-000000000006";
const RED_29 = "40000000-0000-0000-0000-000000000008"; // claimed 2012 Remaster, actually 1990 Reissue
const V_HOMOGENIC_2017 = "20000000-0000-0000-0000-000000000010"; // the Pay tests add their own €28 listings (the seed has €34 and €31 here)
// Screenshots for bug reports (saved only when BUGSHOTS=1): docs/screenshots/<folder>/<name>-<width>.png
async function shot(page: Page, folder: string, name: string) {
  if (process.env.BUGSHOTS !== "1") return;
  await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  await page.screenshot({ path: `docs/screenshots/${folder}/${name}-${page.viewportSize()?.width}.png`, fullPage: true });
}
const rows = (page: Page) => page.getByRole("list", { name: "Verified listings" }).getByRole("listitem");

const PASSWORD = "vinyl-test-123";
let email = "";
let userId = "";
let toBuy = ""; // green €28 listing, bought in the test
let own = ""; // green €28 listing sold by the buyer himself (bug 12)
let toLose = ""; // green €28 listing, sold to someone else while the buyer is on the checkout

// A green €28 listing of its own for each run, so paying never changes the demo data.
async function addListing(sellerId = "30000000-0000-0000-0000-000000000001", price = 28): Promise<string> {
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
  return data.id;
}

test.beforeAll(async ({}, info) => {
  email = `spindle-checkout-${info.project.name}-${Date.now()}@spindle.test`;
  const { data, error } = await admin().auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { name: "Rui Costa" },
  });
  if (error) throw error;
  userId = data.user.id;
  await admin().from("profiles").insert({ user_id: userId, name: "Rui Costa" });
  toBuy = await addListing();
  toLose = await addListing();
  const { data: profile } = await admin().from("profiles").select("id").eq("user_id", userId).single();
  own = await addListing(profile!.id, 27); // €27, so the buyer's own listing is not counted among the €28 ones the Pay test checks
});

test.afterAll(async () => {
  for (const id of [toBuy, toLose, own]) {
    await admin().from("orders").delete().eq("listing_id", id);
    await admin().from("check_results").delete().eq("listing_id", id);
    await admin().from("listings").delete().eq("id", id);
  }
  await admin().from("profiles").delete().eq("user_id", userId);
  await admin().auth.admin.deleteUser(userId);
});

const logIn = (page: Page) => signIn(page, email, PASSWORD);
// Signed out, Buy and Continue to checkout open the log-in window on the page (story 27).
async function windowLogIn(page: Page) {
  const box = page.getByRole("dialog");
  await expect(box.getByRole("heading", { name: "Log in to buy" })).toBeVisible();
  await expect(page).toHaveURL(`/versions/${V2012}/listings`);
  await box.getByLabel("Email").fill(email);
  await box.getByLabel("Password").fill(PASSWORD);
  await box.getByRole("button", { name: "Log in" }).click();
}

test("signed out: Buy on a green listing asks to log in, then lands on its checkout", async ({ page }) => {
  await page.goto(`/versions/${V2012}/listings`);
  await rows(page).nth(0).getByRole("link", { name: /^Buy/ }).click();
  await windowLogIn(page); // story 27: the log-in window, on the same page
  await expect(page).toHaveURL(`/checkout/${GREEN_32}?version=${V2012}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Buy with protection");
  await expect(page.getByRole("region", { name: "The record" })).toContainText("Spiders from Mars, 2012 Remaster");
});

test("signed out: Continue to checkout after the yellow warning asks to log in, then lands on its checkout", async ({ page }) => {
  await page.goto(`/versions/${V2012}/listings`);
  await rows(page).nth(1).getByRole("button", { name: /^Buy/ }).click();
  await page.getByRole("group", { name: "Before you buy" }).getByRole("link", { name: "Continue to checkout" }).click();
  await windowLogIn(page);
  await expect(page).toHaveURL(`/checkout/${YELLOW_36}?version=${V2012}`);
});

test("signed in: a red listing never reaches the checkout; the same listing under its actual version does", async ({ page }) => {
  await page.goto("/login");
  await logIn(page);
  await expect(page).toHaveURL("/");
  await page.goto(`/checkout/${RED_29}?version=${V2012}`);
  await expect(page.getByText("This page could not be found.")).toBeVisible();
  await page.goto(`/checkout/${RED_29}?version=${V1990}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Buy with protection");
  await expect(page.getByRole("region", { name: "The record" })).toContainText("Spiders from Mars, 1990 Reissue");
});

test("signed in: the checkout of my own listing goes back to the listing with a notice, and has no Buy button (bug 12)", async ({ page }) => {
  await page.goto("/login");
  await logIn(page);
  await expect(page).toHaveURL("/");
  await page.goto(`/checkout/${own}?version=${V_HOMOGENIC_2017}`);
  await expect(page).toHaveURL(`/listings/${own}?version=${V_HOMOGENIC_2017}&notice=own`);
  await expect(page.getByText("This page could not be found.")).toHaveCount(0);
  await expect(page.getByRole("status").filter({ hasText: "This listing is yours, you can't buy it" })).toBeVisible();
  await expect(page.getByText("Your listing")).toBeVisible(); // same as in the list: no Buy button, no path to the checkout
  await expect(page.locator(`a[href^="/checkout/"]`)).toHaveCount(0);
  await shot(page, "bug-12", "own-listing-notice");
  await page.goto(`/listings/${own}?version=${V_HOMOGENIC_2017}`); // without the address's notice: no notice
  await expect(page.getByRole("status")).toHaveCount(0);
});

async function fillAddress(page: Page) {
  // Typing before React has taken over the page loses the text (the Pay button stays off): wait until the form is hydrated.
  const first = await page.getByLabel("Name").elementHandle();
  await page.waitForFunction((el) => !!el && Object.keys(el).some((k) => k.startsWith("__reactProps")), first);
  await page.getByLabel("Name").fill("Rui Costa");
  await page.getByLabel("Street").fill("Rua do Almada 120");
  await page.getByLabel("Postcode").fill("4050-031");
  await page.getByLabel("City").fill("Porto");
}

test("checkout: fee and total before paying; Pay waits for a full address; no card or bank details", async ({ page }) => {
  await page.goto(`/login?next=${encodeURIComponent(`/checkout/${toBuy}?version=${V_HOMOGENIC_2017}`)}`);
  await logIn(page);
  const price = page.getByRole("definition");
  await expect(price).toHaveText(["€28.00", "€4.90", "€2.00", "€34.90"]); // record, insured shipping, buyer protection, total
  await expect(page.getByText("MB WAY")).toBeVisible();
  // Bug 7: only one line "How protection works"; the four steps stay hidden until it is opened.
  const steps = page.getByRole("list", { name: "Protection steps" });
  await expect(page.getByText("How protection works")).toBeVisible();
  await expect(steps).toBeHidden();
  await expect(page.getByText("What protection covers")).toHaveCount(0);
  await shot(page, "bug-7b", "closed");
  await page.getByText("How protection works").click(); // mouse
  await expect(steps.getByRole("listitem")).toHaveText(["1You pay Spindle", "2Seller ships", "3You confirm it's all good", "4Seller gets paid"]);
  await expect(page.getByText("Pressing check, payment held until delivery, and a refund if the record isn't as listed.")).toBeVisible();
  await shot(page, "bug-7b", "open");
  await page.getByText("How protection works").click();
  await expect(steps).toBeHidden();
  await page.getByText("How protection works").focus(); // keyboard: Enter opens, Enter closes
  await page.keyboard.press("Enter");
  await expect(steps).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(steps).toBeHidden();
  await expect(page.getByText("Simulated payment · Illustrative data")).toBeVisible();

  const payButton = page.getByRole("button", { name: "Pay €34.90" });
  await expect(payButton).toBeDisabled();
  await page.getByLabel("Name").fill("Rui Costa");
  await page.getByLabel("Street").fill("Rua do Almada 120");
  await page.getByLabel("City").fill("Porto");
  await expect(payButton).toBeDisabled(); // postcode still missing
  await page.getByLabel("Postcode").fill("40500"); // incomplete: the mask makes 4050031 a valid 4050-031 (bug 7)
  await expect(page.getByText("Use the format 0000-000")).toBeVisible();
  await expect(payButton).toBeDisabled();
  await page.getByLabel("Postcode").fill("4050-031");
  await expect(page.getByText("Use the format 0000-000")).toHaveCount(0);
  await expect(payButton).toBeEnabled();

  // No card number or bank details anywhere.
  await expect(page.locator('input[autocomplete^="cc-"]')).toHaveCount(0);
  await expect(page.getByText(/card number|IBAN|CVV|expiry/i)).toHaveCount(0);
  await expect(page.getByRole("textbox")).toHaveCount(4);
  await screenshot(page, 7, "checkout");
});

test("Pay: the order is created as 'Paid · waiting for the seller'; the listing is sold, gone from the list and cannot be bought again", async ({ page }) => {
  await page.goto(`/login?next=${encodeURIComponent(`/checkout/${toBuy}?version=${V_HOMOGENIC_2017}`)}`);
  await logIn(page);
  await fillAddress(page);
  await page.getByRole("button", { name: "Pay €34.90" }).click();
  await expect(page).toHaveURL(/\/orders\/[0-9a-f-]{36}$/);

  // Confirmation (story 7 · What the confirmation shows).
  const orderUrl = page.url();
  await expect(page.getByRole("heading", { name: "Order placed" })).toBeVisible();
  await expect(page.getByText("€34.90 paid")).toBeVisible();
  await expect(page.getByText("Paid · waiting for the seller")).toBeVisible();
  await expect(page.getByText(/Homogenic, 2017 Reissue/).and(page.locator(":visible"))).toBeVisible();
  const steps = page.getByRole("list", { name: "How protection works" }).getByRole("listitem");
  await expect(steps).toHaveCount(4);
  await expect(steps.first()).toContainText("done");
  await expect(page.getByText("Simulated payment · Illustrative data")).toBeVisible();
  await screenshot(page, 7, "order-confirmation");
  // Only the buyer can open it: signed out, the login is asked; the link then comes back to the order.
  await page.context().clearCookies();
  await page.goto(orderUrl);
  await expect(page).toHaveURL(/\/login/);
  await logIn(page);
  await expect(page.getByRole("heading", { name: "Order placed" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to search" })).toHaveCount(0); // no back link (DECISIONS 2026-11-11)

  const { data: order } = await admin().from("orders").select("*").eq("listing_id", toBuy).single();
  const { data: profile } = await admin().from("profiles").select("id").eq("user_id", userId).single();
  expect(order).toMatchObject({
    buyer_id: profile!.id,
    status: "paid_waiting_seller",
    record_price: 28,
    shipping: 4.9,
    protection_fee: 2,
    total: 34.9,
    ship_name: "Rui Costa",
    ship_postcode: "4050-031",
  });
  const { data: listing } = await admin().from("listings").select("status").eq("id", toBuy).single();
  expect(listing?.status).toBe("sold");

  await page.goto(`/versions/${V_HOMOGENIC_2017}/listings`);
  await expect(page.getByRole("list", { name: "Verified listings" }).getByRole("link", { name: /^Buy €28/ })).toHaveCount(
    (await admin().from("listings").select("id").eq("claimed_version_id", V_HOMOGENIC_2017).eq("status", "on_sale").eq("price", 28)).data!.length,
  );
  await expect(page.locator(`a[href^="/checkout/${toBuy}"]`)).toHaveCount(0);
  await page.goto(`/checkout/${toBuy}?version=${V_HOMOGENIC_2017}`);
  // Finding #61 (DECISIONS 2026-11-08): a sold listing opened from a link says so, instead of "not found".
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("This record is no longer available");
  await expect(page.getByRole("button", { name: /^Pay/ })).toHaveCount(0);
});

test("sold while the buyer is on the checkout: 'Sorry, this record was just sold' and no order", async ({ page }) => {
  await page.goto(`/login?next=${encodeURIComponent(`/checkout/${toLose}?version=${V_HOMOGENIC_2017}`)}`);
  await logIn(page);
  await fillAddress(page);
  await admin().from("listings").update({ status: "sold" }).eq("id", toLose); // someone else bought it
  await page.getByRole("button", { name: "Pay €34.90" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Sorry" })).toContainText("Sorry, this record was just sold");
  await expect(page.getByRole("button", { name: /^Pay/ })).toHaveCount(0);
  await expect(page.getByLabel("Street")).toHaveValue("Rua do Almada 120"); // what was typed is kept
  const { data: orders } = await admin().from("orders").select("id").eq("listing_id", toLose);
  expect(orders).toHaveLength(0);
  await screenshot(page, 7, "checkout-just-sold");
});
