// Story 29 · A larger log-in window, used for every log-in (and bug 32, the cart icon) — critical flow, run on phone
// and desktop (playwright.config.ts). Creates a real test account (already confirmed) and green listings, and removes
// them afterwards.
import { expect, test, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { screenshot } from "./screenshot";
import { waitUntilHydrated } from "./hydration";
import { windowReady } from "./session";

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

let email = "";
let userId = "";
const made: string[] = [];
let toBuy = "";

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
  email = `spindle-everywhere-${info.project.name}-${Date.now()}@spindle.test`;
  const { data, error } = await admin().auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { name: "Rui Costa" },
  });
  if (error) throw error;
  userId = data.user.id;
  const profile = await admin().from("profiles").insert({ user_id: userId, name: "Rui Costa" });
  if (profile.error) throw profile.error;
  toBuy = await addListing(info.project.name === "phone" ? 41 : 42);
});

test.afterAll(async () => {
  for (const id of made) {
    await admin().from("orders").delete().eq("listing_id", id);
    await admin().from("check_results").delete().eq("listing_id", id);
    await admin().from("listings").delete().eq("id", id);
  }
  await admin().from("profiles").delete().eq("user_id", userId);
  await admin().auth.admin.deleteUser(userId);
});

const checkout = () => `/checkout/${toBuy}?version=${V_HOMOGENIC_2017}`;
const windowOf = (page: Page) => page.getByRole("dialog");
const isPhone = (page: Page) => (page.viewportSize()?.width ?? 0) < 768;

async function logInInWindow(page: Page) {
  await windowReady(page);
  await windowOf(page).getByLabel("Email").fill(email);
  await windowOf(page).getByLabel("Password").fill(PASSWORD);
  await windowOf(page).getByRole("button", { name: "Log in" }).click();
}

// Desktop: two panels side by side, 880 px wide · phone: the whole screen, the left panel above the form.
async function expectLayout(page: Page, panel: ReturnType<Page["getByLabel"]>) {
  const box = (await windowOf(page).boundingBox())!;
  const left = (await panel.boundingBox())!;
  const form = (await windowOf(page).getByLabel("Email").boundingBox())!;
  const viewport = page.viewportSize()!;
  if (isPhone(page)) {
    expect(Math.round(box.width)).toBe(viewport.width);
    expect(Math.round(box.height)).toBe(viewport.height);
    await expect(async () => expect(Math.round((await windowOf(page).boundingBox())!.y)).toBe(0)).toPass(); // at the top, once risen
    expect(left.y + left.height).toBeLessThanOrEqual(form.y); // above the form
  } else {
    expect(Math.round(box.width)).toBe(880);
    expect(left.x + left.width).toBeLessThanOrEqual(form.x); // beside the form, on its left
  }
  return box;
}

test("with a record: the record panel; without one: the heading and three lines; the window keeps its size", async ({ page }) => {
  // With a record: Buy on the listing check screen (use case 1).
  await page.goto(`/listings/${toBuy}?version=${V_HOMOGENIC_2017}`);
  const buy = page.getByRole("link", { name: /^Buy with protection/ });
  await waitUntilHydrated(buy);
  await buy.click();
  const record = windowOf(page).getByLabel("Record");
  await expect(windowOf(page).getByRole("heading", { name: "Log in to buy" })).toBeVisible();
  await expect(record).toContainText("Homogenic");
  await expect(record).toContainText("VG+");
  await expect(record).toContainText(isPhone(page) ? "€41" : "€42");
  await expect(record).toContainText("Spindle holds your payment until you confirm it's all good.");
  await expect(record.locator("img")).toHaveAttribute("src", "/photos/cover.svg"); // the cover
  const withRecord = await expectLayout(page, record);
  await screenshot(page, 29, "window-record", { fullPage: false });
  await page.keyboard.press("Escape");

  // Without a record: the menu "Log in" (use case 2).
  await page.goto("/");
  const login = page.getByRole("link", { name: "Log in" }).locator("visible=true").first();
  await waitUntilHydrated(login);
  await login.click();
  const lines = windowOf(page).getByRole("list", { name: "What Spindle does" });
  await expect(windowOf(page).getByRole("heading", { name: "Log in" })).toBeVisible();
  await expect(lines.getByRole("listitem")).toHaveText([
    "1We tell you which version to buy",
    "2Every copy is checked against it",
    "3Spindle holds your payment until you confirm it's all good",
  ]);
  if (!isPhone(page)) await expect(windowOf(page).getByText("The right pressing, a verified copy.")).toBeVisible();
  await expect(windowOf(page).getByLabel("Record")).toHaveCount(0);
  const without = await expectLayout(page, lines);
  expect(Math.round(without.width)).toBe(Math.round(withRecord.width)); // same size in every case
  expect(Math.round(without.height)).toBe(Math.round(withRecord.height));
  await screenshot(page, 29, "window-no-record", { fullPage: false });

  // "Create one": same window, same size.
  await windowOf(page).getByRole("button", { name: "Create one" }).click();
  await expect(windowOf(page).getByRole("heading", { name: "Create an account" })).toBeVisible();
  expect(Math.round((await windowOf(page).boundingBox())!.height)).toBe(Math.round(withRecord.height));
  await screenshot(page, 29, "window-signup", { fullPage: false });
});

test("/login and /signup open the home page with the window; closing leaves the home page", async ({ page }) => {
  await page.goto("/signup");
  await expect(windowOf(page).getByRole("heading", { name: "Create an account" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Pick a crate. We'll pick the pressing." })).toBeAttached();
  await page.goto("/login");
  await expect(windowOf(page).getByRole("heading", { name: "Log in" })).toBeVisible();
  await windowOf(page).getByRole("button", { name: "Close" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.locator("dialog[open]")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Pick a crate. We'll pick the pressing." })).toBeVisible();
});

test("pages that need an account, opened signed out, show only the header and the window", async ({ page }) => {
  const cases: [string, string][] = [
    [checkout(), "Log in to buy"],
    ["/cart", "Log in to see your cart"],
    ["/cart/checkout", "Log in to see your cart"],
    ["/sell", "Log in to sell"],
    ["/account", "Log in"],
    ["/account/details", "Log in"],
    ["/orders/placed?ids=00000000-0000-0000-0000-000000000000", "Log in"],
  ];
  for (const [path, title] of cases) {
    await page.goto(path);
    await expect(windowOf(page).getByRole("heading", { name: title, exact: true })).toBeVisible();
    await expect(page).toHaveURL(path);
    await expect(page.locator("main header")).toBeAttached(); // the header
    await expect(page.locator("main h1")).toHaveCount(0); // nothing of the page itself
  }
  await page.goto(checkout());
  await expect(windowOf(page).getByLabel("Record")).toContainText("Homogenic"); // the checkout shows the record
  await screenshot(page, 29, "checkout-signed-out", { fullPage: false });
  await page.goto("/account");
  await expect(windowOf(page).getByRole("heading", { name: "Log in", exact: true })).toBeVisible();
  await screenshot(page, 29, "account-signed-out", { fullPage: false });
});

test("closing the window on a page that needs an account goes back, or home when there is no previous page", async ({ page }) => {
  // From a bookmark (first page of the tab): home.
  await page.goto("/sell");
  await windowOf(page).getByRole("button", { name: "Close" }).click();
  await expect(page).toHaveURL("/");

  // After another page: back to it.
  await page.goto("/search?q=bjork");
  await page.goto("/account");
  await expect(windowOf(page).getByRole("heading", { name: "Log in", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL("/search?q=bjork");
});

test("Open /sell from a bookmark, log in, the sell flow shows (use case 3)", async ({ page }) => {
  await page.goto("/sell");
  await expect(windowOf(page).getByRole("heading", { name: "Log in to sell" })).toBeVisible();
  await expect(windowOf(page).getByText("Selling is free. You need an account.")).toBeVisible();
  await logInInWindow(page);
  await expect(page.locator("dialog[open]")).toHaveCount(0);
  await expect(page).toHaveURL("/sell");
  await expect(page.locator("main h1")).toBeVisible(); // the page's own content
});

test("bug 32: signed out, the cart icon opens 'Log in to see your cart', then the cart", async ({ page }) => {
  await page.goto("/");
  const cart = page.getByRole("link", { name: "Cart", exact: true }).locator("visible=true").first();
  await waitUntilHydrated(cart);
  await cart.click();
  await expect(page).toHaveURL("/"); // the page stays
  await expect(windowOf(page).getByRole("heading", { name: "Log in to see your cart" })).toBeVisible();
  await windowOf(page).getByRole("button", { name: "Create one" }).click();
  await expect(windowOf(page).getByRole("heading", { name: "Create an account to see your cart" })).toBeVisible();
  await windowOf(page).getByRole("button", { name: "Log in" }).click();
  await logInInWindow(page);
  await expect(page).toHaveURL("/cart");
});

test("session ended during a checkout: the window opens on top and the address typed is kept", async ({ page }) => {
  await page.goto(checkout());
  await logInInWindow(page);
  await expect(page.locator("dialog[open]")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Buy with protection" })).toBeVisible();
  const fields: [string, string][] = [
    ["Name", "Rita Lopes"],
    ["Street", "Rua das Flores 10"],
    ["Postcode", "4050-262"],
    ["City", "Porto"],
  ];
  const pay = page.getByRole("button", { name: /^Pay/ });
  await waitUntilHydrated(pay);
  await expect(async () => {
    for (const [label, value] of fields) await page.getByRole("main").getByLabel(label).fill(value);
    await expect(pay).toBeEnabled({ timeout: 1000 });
  }).toPass();

  await page.context().clearCookies(); // the session ends
  await pay.click();
  await expect(windowOf(page).getByRole("heading", { name: "Log in to buy" })).toBeVisible();
  await expect(windowOf(page).getByLabel("Record")).toContainText("Homogenic");
  await expect(page).toHaveURL(checkout());
  await screenshot(page, 29, "session-ended", { fullPage: false });
  await logInInWindow(page);
  await expect(page.locator("dialog[open]")).toHaveCount(0);
  await expect(page).toHaveURL(checkout());
  for (const [label, value] of fields) await expect(page.getByRole("main").getByLabel(label)).toHaveValue(value);
  const { data: orders } = await admin().from("orders").select("id").eq("listing_id", toBuy);
  expect(orders).toEqual([]); // nothing was paid
});
