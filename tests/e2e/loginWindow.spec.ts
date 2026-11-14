// Story 27 · Log in without leaving the page — critical flow, run on phone and desktop (playwright.config.ts).
// Creates a real test account (already confirmed) and green listings of its own, and removes them afterwards with
// the account created through the window.
import { expect, test, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { screenshot } from "./screenshot";
import { waitUntilHydrated } from "./hydration";

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
let profileId = "";
const users: string[] = []; // accounts of this run, incl. the one created through the window
const made: string[] = []; // listings of this run
let toBuy = "";
let toAdd = "";
let toLose = ""; // sold while the window is open
let own = ""; // the test account's own listing

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

test.beforeAll(async ({}, info) => {
  email = `spindle-window-${info.project.name}-${Date.now()}@spindle.test`;
  const { data, error } = await admin().auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { name: "Rui Costa" },
  });
  if (error) throw error;
  userId = data.user.id;
  users.push(userId);
  const profile = await admin().from("profiles").insert({ user_id: userId, name: "Rui Costa" }).select("id").single();
  if (profile.error) throw profile.error;
  profileId = profile.data.id;
  const phone = info.project.name === "phone";
  toBuy = await addListing(phone ? 27 : 37);
  toAdd = await addListing(phone ? 24 : 38);
  toLose = await addListing(phone ? 23 : 39);
  own = await addListing(phone ? 22 : 40, profileId);
});

test.afterAll(async () => {
  for (const id of made) {
    await admin().from("cart_items").delete().eq("listing_id", id);
    await admin().from("orders").delete().eq("listing_id", id);
    await admin().from("check_results").delete().eq("listing_id", id);
    await admin().from("listings").delete().eq("id", id);
  }
  for (const id of users) {
    const profile = await admin().from("profiles").select("id").eq("user_id", id).maybeSingle();
    if (profile.data) await admin().from("cart_items").delete().eq("buyer_id", profile.data.id);
    await admin().from("profiles").delete().eq("user_id", id);
    await admin().auth.admin.deleteUser(id);
  }
});

const listingPage = (id: string) => `/listings/${id}?version=${V_HOMOGENIC_2017}`;
const windowOf = (page: Page) => page.getByRole("dialog");
const isPhone = (page: Page) => (page.viewportSize()?.width ?? 0) < 640;

async function open(page: Page, id: string) {
  await page.goto(listingPage(id));
  await waitUntilHydrated(page.getByRole("button", { name: /^Add to cart/ }));
}
async function logInInWindow(page: Page) {
  await windowOf(page).getByLabel("Email").fill(email);
  await windowOf(page).getByLabel("Password").fill(PASSWORD);
  await windowOf(page).getByRole("button", { name: "Log in" }).click();
}

test("Buy opens the window with the record; ×, Esc and the dimmed area close it; logging in goes on to the checkout", async ({ page }) => {
  const url = listingPage(toBuy);
  await open(page, toBuy);
  const buy = page.getByRole("link", { name: /^Buy with protection/ });
  await buy.click();

  const box = windowOf(page);
  await expect(box.getByRole("heading", { name: "Log in to buy" })).toBeVisible();
  await expect(box.getByLabel("Record")).toContainText("Homogenic");
  await expect(box.getByLabel("Record")).toContainText("VG+");
  await expect(page).toHaveURL(url); // the page did not change
  // Phone: a sheet along the bottom edge (once it has risen); desktop: a centred window.
  await box.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
  const shape = (await box.boundingBox())!;
  const viewport = page.viewportSize()!;
  if (isPhone(page)) {
    expect(Math.round(shape.y + shape.height)).toBe(viewport.height);
    expect(Math.round(shape.width)).toBe(viewport.width);
  } else {
    expect(Math.abs(shape.x + shape.width / 2 - viewport.width / 2)).toBeLessThan(2);
  }
  await screenshot(page, 27, "log-in-to-buy");

  // ×: closed, the page as it was, the focus back on Buy.
  await box.getByRole("button", { name: "Close" }).click();
  await expect(box).toBeHidden();
  await expect(buy).toBeFocused();
  // Esc.
  await buy.click();
  await expect(box).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(box).toBeHidden();
  await expect(buy).toBeFocused();
  // A tap on the dimmed area (top-left corner, outside the window).
  await buy.click();
  await expect(box).toBeVisible();
  await page.mouse.click(4, 4);
  await expect(box).toBeHidden();
  await expect(page).toHaveURL(url);

  // Keyboard: the focus stays inside the window.
  await buy.click();
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press("Tab");
    expect(await box.evaluate((el) => el.contains(document.activeElement))).toBe(true);
  }

  // Wrong password: the same message as the log-in page; what was typed is kept.
  await box.getByLabel("Email").fill(email);
  await box.getByLabel("Password").fill("wrong-password");
  await box.getByRole("button", { name: "Log in" }).click();
  await expect(box.getByText("That email and password don't match. Check them and try again.")).toBeVisible();
  await expect(box.getByLabel("Email")).toHaveValue(email);
  await screenshot(page, 27, "wrong-password");

  await logInInWindow(page);
  await expect(page).toHaveURL(`/checkout/${toBuy}?version=${V_HOMOGENIC_2017}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Buy with protection");
  await expect(box).toBeHidden();
});

test("Add to cart → Create one → the new account has the record in its cart, on the same page", async ({ page }, info) => {
  await open(page, toAdd);
  await page.getByRole("button", { name: /^Add to cart/ }).click();
  const box = windowOf(page);
  await expect(box.getByRole("heading", { name: "Log in to add to your cart" })).toBeVisible();
  await expect(box.getByLabel("Record")).toBeVisible();

  // Switching between the forms keeps what was typed.
  const newEmail = `spindle-window-new-${info.project.name}-${Date.now()}@spindle.test`;
  await box.getByLabel("Email").fill(newEmail);
  await box.getByRole("button", { name: "Create one" }).click();
  await expect(box.getByRole("heading", { name: "Create an account to add to your cart" })).toBeVisible();
  await expect(box.getByLabel("Email")).toHaveValue(newEmail);
  await box.getByRole("button", { name: "Log in" }).click();
  await expect(box.getByLabel("Email")).toHaveValue(newEmail);
  await box.getByRole("button", { name: "Create one" }).click();

  // Same rules as the sign-up page.
  await box.getByLabel("Name").fill("Ana Silva");
  await box.getByLabel("Password").fill("short");
  await box.getByRole("button", { name: "Create account" }).click();
  await expect(box.getByText(/at least 8 characters/i).first()).toBeVisible();
  await screenshot(page, 27, "create-account");

  await box.getByLabel("Password").fill(PASSWORD);
  await box.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText("In your cart ·")).toBeVisible();
  await expect(page).toHaveURL(listingPage(toAdd)); // back on the same page
  await expect(box).toBeHidden();

  const created = (await admin().auth.admin.listUsers()).data.users.find((u) => u.email === newEmail)!;
  users.push(created.id);
  const profile = await admin().from("profiles").select("id").eq("user_id", created.id).single();
  const { data } = await admin().from("cart_items").select("listing_id").eq("buyer_id", profile.data!.id);
  expect(data?.map((r) => r.listing_id)).toEqual([toAdd]);
});

test("the menu Log in opens the window without a record; after logging in the user stays on the page", async ({ page }) => {
  await page.goto("/search?q=bowie");
  const link = isPhone(page)
    ? page.locator("body > .pointer-events-none").getByRole("link", { name: "Log in" })
    : page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Log in" });
  await waitUntilHydrated(link);
  await link.click();
  const box = windowOf(page);
  await expect(box.getByRole("heading", { name: "Log in", exact: true })).toBeVisible();
  await expect(box.getByText("Welcome back.")).toBeVisible();
  await expect(box.getByLabel("Record")).toHaveCount(0);
  await screenshot(page, 27, "log-in-menu");
  await logInInWindow(page);
  await expect(page.getByRole("link", { name: /signed in as Rui Costa/ }).first()).toBeVisible();
  await expect(page).toHaveURL("/search?q=bowie");
  await expect(box).toBeHidden();
});

test("Sell opens the window without a record; logging in goes on to the sell flow", async ({ page }) => {
  await page.goto("/");
  if (isPhone(page)) {
    const menu = page.getByRole("button", { name: "Open menu" });
    await waitUntilHydrated(menu);
    await menu.click();
    await page.getByRole("dialog", { name: "Menu" }).getByRole("link", { name: "Sell for free" }).click();
    await expect(page.getByRole("dialog", { name: "Menu" })).toHaveCount(0); // the menu closed
  } else {
    const sell = page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Sell for free" });
    await waitUntilHydrated(sell);
    await sell.click();
  }
  const box = windowOf(page);
  await expect(box.getByRole("heading", { name: "Log in to sell" })).toBeVisible();
  await expect(box.getByText("Selling is free. You need an account.")).toBeVisible();
  await expect(box.getByLabel("Record")).toHaveCount(0);
  await expect(page).toHaveURL("/");
  await screenshot(page, 27, "log-in-to-sell");
  await logInInWindow(page);
  await expect(page).toHaveURL("/sell");
});

test("edge cases: sold while the window is open, and the seller's own listing", async ({ page }) => {
  await open(page, toLose);
  await page.getByRole("link", { name: /^Buy with protection/ }).click();
  await expect(windowOf(page).getByRole("heading", { name: "Log in to buy" })).toBeVisible();
  await admin().from("listings").update({ status: "sold" }).eq("id", toLose);
  await logInInWindow(page);
  await expect(page.getByText("This record is no longer available")).toBeVisible();

  await page.context().clearCookies();
  await open(page, own);
  await page.getByRole("link", { name: /^Buy with protection/ }).click();
  await logInInWindow(page);
  await expect(page.getByText("This listing is yours, you can't buy it")).toBeVisible();
});
