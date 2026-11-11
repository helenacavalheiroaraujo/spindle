// Bug 9 · "Your account": change password and saved addresses — run on phone and desktop (playwright.config.ts).
// Creates a real test account in Supabase (already confirmed) and removes it afterwards (its addresses go with it).
import { expect, test, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { screenshot } from "./screenshot";
import { signIn } from "./session";
import { waitUntilHydrated } from "./hydration";

function env(name: string) {
  if (process.env[name]) return process.env[name]!;
  const line = readFileSync(".env.local", "utf8").split("\n").findLast((l) => l.startsWith(`${name}=`));
  return line?.slice(name.length + 1).trim() ?? "";
}
const admin = () =>
  createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SECRET_KEY"), { auth: { persistSession: false } });

const V2012 = "20000000-0000-0000-0000-000000000003";
const GREEN_32 = "40000000-0000-0000-0000-000000000005";
const PASSWORD = "vinyl-test-123";
const NEW_PASSWORD = "vinyl-test-456";

let email = "";
let userId = "";
const passwordForm = (page: Page) => page.getByRole("form", { name: "Password" });
const addressesForm = (page: Page) => page.getByRole("form", { name: "Addresses" });

async function fill(page: Page, prefix: "delivery" | "billing", a: { name: string; street: string; postcode: string; city: string }) {
  await page.locator(`#${prefix}-name`).fill(a.name);
  await page.locator(`#${prefix}-street`).fill(a.street);
  await page.locator(`#${prefix}-postcode`).fill(a.postcode);
  await page.locator(`#${prefix}-city`).fill(a.city);
}

const HOME = { name: "Ana Silva", street: "Rua das Flores 12", postcode: "4050262", city: "Porto" }; // typed without the hyphen: the mask adds it
const WORK = { name: "Ana Silva", street: "Avenida da Boavista 1", postcode: "4100110", city: "Porto" };

test.beforeAll(async ({}, info) => {
  email = `spindle-account-${info.project.name}-${Date.now()}@spindle.test`;
  const { data, error } = await admin().auth.admin.createUser({ email, password: PASSWORD, email_confirm: true, user_metadata: { name: "Ana Silva" } });
  if (error) throw error;
  userId = data.user.id;
  const profile = await admin().from("profiles").insert({ user_id: userId, name: "Ana Silva" });
  if (profile.error) throw profile.error;
});

test.afterAll(async () => {
  await admin().from("profiles").delete().eq("user_id", userId);
  await admin().auth.admin.deleteUser(userId);
});

async function openAccount(page: Page) {
  await page.goto("/login?next=%2Faccount");
  await signIn(page, email, PASSWORD);
  await expect(page.getByRole("heading", { name: "Your account" })).toBeVisible();
  // The address form is a client component: typing before it is hydrated loses the first field.
  await waitUntilHydrated(page.locator("#delivery-name"));
}

test.describe.configure({ mode: "serial" });

test("addresses: empty at first, billing same as delivery is ticked, an incomplete address is refused", async ({ page }) => {
  await openAccount(page);
  await expect(addressesForm(page).getByLabel("Billing is the same as delivery")).toBeChecked();
  await expect(page.locator("#billing-name")).toHaveCount(0);
  await expect(page.locator("#delivery-name")).toHaveValue("");
  await screenshot(page, "bug-9", "account-empty");
  await addressesForm(page).getByRole("button", { name: "Save addresses" }).click();
  await expect(addressesForm(page).getByRole("alert")).toHaveText("Fill in name, street, postcode and city.");
  await expect(addressesForm(page).getByText("Addresses saved.")).toHaveCount(0);
});

test("addresses: the delivery address is saved and is still there after a reload", async ({ page }) => {
  await openAccount(page);
  await fill(page, "delivery", HOME);
  await expect(page.locator("#delivery-postcode")).toHaveValue("4050-262");
  await addressesForm(page).getByRole("button", { name: "Save addresses" }).click();
  await expect(addressesForm(page).getByText("Addresses saved.")).toBeVisible();
  await page.reload();
  await expect(page.locator("#delivery-street")).toHaveValue("Rua das Flores 12");
  await expect(page.locator("#delivery-postcode")).toHaveValue("4050-262");
  await expect(addressesForm(page).getByLabel("Billing is the same as delivery")).toBeChecked();
});

test("addresses: a different billing address is saved; ticking 'same as delivery' again removes it", async ({ page }) => {
  await openAccount(page);
  await addressesForm(page).getByLabel("Billing is the same as delivery").uncheck();
  await addressesForm(page).getByRole("button", { name: "Save addresses" }).click();
  await expect(addressesForm(page).getByRole("alert")).toHaveText("Fill in name, street, postcode and city.");
  await fill(page, "billing", WORK);
  await screenshot(page, "bug-9", "account-billing-different");
  await addressesForm(page).getByRole("button", { name: "Save addresses" }).click();
  await expect(addressesForm(page).getByText("Addresses saved.")).toBeVisible();
  await page.reload();
  await expect(addressesForm(page).getByLabel("Billing is the same as delivery")).not.toBeChecked();
  await expect(page.locator("#billing-street")).toHaveValue("Avenida da Boavista 1");
  await expect(page.locator("#delivery-street")).toHaveValue("Rua das Flores 12"); // delivery untouched
  await addressesForm(page).getByLabel("Billing is the same as delivery").check();
  await addressesForm(page).getByRole("button", { name: "Save addresses" }).click();
  await expect(addressesForm(page).getByText("Addresses saved.")).toBeVisible();
  await page.reload();
  await expect(addressesForm(page).getByLabel("Billing is the same as delivery")).toBeChecked();
  await expect(page.locator("#billing-name")).toHaveCount(0);
});

test("the checkout starts with the saved delivery address", async ({ page }) => {
  await page.goto(`/login?next=${encodeURIComponent(`/checkout/${GREEN_32}?version=${V2012}`)}`);
  await signIn(page, email, PASSWORD);
  await expect(page.getByLabel("Street")).toHaveValue("Rua das Flores 12");
  await expect(page.getByLabel("Postcode")).toHaveValue("4050-262");
  await expect(page.getByLabel("City")).toHaveValue("Porto");
});

test("password: empty, too short and wrong current password are refused with their messages", async ({ page }) => {
  await openAccount(page);
  await screenshot(page, "bug-9", "account-password");
  await passwordForm(page).getByRole("button", { name: "Save password" }).click();
  await expect(passwordForm(page).getByText("Enter your current password.")).toBeVisible();
  await expect(passwordForm(page).getByText("Use at least 8 characters.", { exact: true }).first()).toBeVisible();
  await page.waitForTimeout(300); // the form is emptied when the answer arrives: fill after that
  await passwordForm(page).getByLabel("Current password").fill(PASSWORD);
  await passwordForm(page).getByLabel("New password").fill("short");
  await passwordForm(page).getByRole("button", { name: "Save password" }).click();
  await expect(passwordForm(page).getByText("Enter your current password.")).toHaveCount(0); // the new answer has arrived
  await expect(passwordForm(page).getByText("Use at least 8 characters.", { exact: true }).first()).toBeVisible();
  await passwordForm(page).getByLabel("Current password").fill("not-my-password");
  await passwordForm(page).getByLabel("New password").fill(NEW_PASSWORD);
  await passwordForm(page).getByRole("button", { name: "Save password" }).click();
  await expect(passwordForm(page).getByText("That isn't your current password.")).toBeVisible();
  await expect(passwordForm(page).getByText("Password changed.")).toHaveCount(0);
});

test("password: changed, then only the new one logs in", async ({ page }) => {
  await openAccount(page);
  await passwordForm(page).getByLabel("Current password").fill(PASSWORD);
  await passwordForm(page).getByLabel("New password").fill(NEW_PASSWORD);
  await passwordForm(page).getByRole("button", { name: "Save password" }).click();
  await expect(passwordForm(page).getByText("Password changed.")).toBeVisible();
  await expect(passwordForm(page).getByLabel("Current password")).toHaveValue(""); // fields are emptied

  await page.context().clearCookies();
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.getByText("That email and password don't match. Check them and try again.")).toBeVisible();
  await page.getByLabel("Password").fill(NEW_PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
});
