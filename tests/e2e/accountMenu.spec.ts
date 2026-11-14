// Story 32 · Account button and menu — critical flow, run on phone and desktop (playwright.config.ts).
// Uses a real test account. Logs in through the form each time (not the saved-cookie helper), because Log out ends
// the session and an old cookie must not sign the user back in.
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

const ZIGGY = "10000000-0000-0000-0000-000000000001"; // an album with its own page
const PASSWORD = "vinyl-test-123";
let email = "";
let userId = "";

const pill = (page: Page) => page.getByRole("button", { name: /^Your account, signed in as/ });
const card = (page: Page) => page.getByRole("group", { name: "Account menu" });
const isPhone = (page: Page) => (page.viewportSize()?.width ?? 0) < 1024;

async function logInTo(page: Page, next: string) {
  await page.goto(`/login?next=${encodeURIComponent(next)}`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
  // The page after log-in can still swap the header once (e.g. the album page streams in); wait for it to settle,
  // so the hydration wait does not hold a replaced element.
  await page.waitForLoadState("networkidle");
  await waitUntilHydrated(pill(page));
}

test.beforeAll(async ({}, info) => {
  email = `spindle-acctmenu-${info.project.name}-${Date.now()}@spindle.test`;
  const { data, error } = await admin().auth.admin.createUser({ email, password: PASSWORD, email_confirm: true, user_metadata: { name: "Rita Lopes" } });
  if (error) throw error;
  userId = data.user.id;
  const profile = await admin().from("profiles").insert({ user_id: userId, name: "Rita Lopes" });
  if (profile.error) throw profile.error;
});

test.afterAll(async () => {
  await admin().from("profiles").delete().eq("user_id", userId);
  await admin().auth.admin.deleteUser(userId);
});

test.describe.configure({ mode: "serial" });

test("the pill: initials, first name on desktop only, and ▾; at least 44 px tall", async ({ page }) => {
  await logInTo(page, "/");
  await expect(pill(page)).toBeVisible();
  await expect(pill(page)).toContainText("RL");
  await expect(pill(page)).toContainText("▾");
  if (isPhone(page)) await expect(pill(page)).not.toContainText("Rita");
  else await expect(pill(page)).toContainText("Rita");
  expect((await pill(page).boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await expect(pill(page)).toHaveAttribute("aria-expanded", "false");
  await screenshot(page, 32, "pill");
});

test("the card shows name, email, the three links and Log out; Esc, a tap outside and a choice close it; after Esc the focus returns to the pill", async ({ page, browserName }) => {
  await logInTo(page, "/");
  await pill(page).click();
  await expect(pill(page)).toHaveAttribute("aria-expanded", "true");
  await expect(card(page)).toContainText("Rita Lopes");
  await expect(card(page)).toContainText(email);
  await expect(card(page).getByRole("link")).toHaveText(["Orders", "For sale", "Account details"].map((t) => new RegExp(`^${t}`)));
  await expect(card(page).getByRole("button", { name: "Log out" })).toBeVisible();
  for (const row of await card(page).locator("a, button").all()) expect((await row.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await screenshot(page, 32, "menu-open");

  // The keyboard reaches every item, in order. WebKit (the phone run) does not Tab through links, so this part runs in Chromium.
  if (browserName !== "webkit") {
    await page.keyboard.press("Tab");
    await expect(card(page).getByRole("link", { name: "Orders" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(card(page).getByRole("link", { name: "For sale" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(card(page).getByRole("link", { name: "Account details" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(card(page).getByRole("button", { name: "Log out" })).toBeFocused();
  }

  await page.keyboard.press("Escape");
  await expect(card(page)).toHaveCount(0);
  await expect(pill(page)).toBeFocused();

  await pill(page).click();
  await expect(card(page)).toBeVisible();
  await page.locator("h1").first().click({ position: { x: 4, y: 4 } }); // a tap outside: the left edge of the page heading, clear of the card
  await expect(card(page)).toHaveCount(0); // after a tap outside, the focus stays where the user tapped
});

test.describe("each link opens its tab", () => {
  for (const [label, path] of [
    ["Orders", "/account/orders"],
    ["For sale", "/account/for-sale"],
    ["Account details", "/account/details"],
  ] as const) {
    test(`${label} → ${path}`, async ({ page }) => {
      await logInTo(page, "/");
      await pill(page).click();
      await card(page).getByRole("link", { name: label }).click();
      await expect(page).toHaveURL(path);
      await expect(card(page)).toHaveCount(0); // a choice closes the card
      await expect(page.getByRole("navigation", { name: "Your account" }).getByRole("link", { name: new RegExp(`^${label}`) })).toHaveAttribute(
        "aria-current",
        "page",
      );
    });
  }
});

test("Log out on an album page: the user stays on the same page, signed out", async ({ page }) => {
  await logInTo(page, `/albums/${ZIGGY}`);
  await pill(page).click();
  await card(page).getByRole("button", { name: "Log out" }).click();
  await expect(pill(page)).toHaveCount(0);
  await expect(page).toHaveURL(`/albums/${ZIGGY}`);
  const logIn = isPhone(page)
    ? page.locator("body > .pointer-events-none").getByRole("link", { name: "Log in" })
    : page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Log in" });
  await expect(logIn).toBeVisible();
});

test("Log out on a page that needs an account: the user goes to the home page", async ({ page }) => {
  await logInTo(page, "/account/details");
  await pill(page).click();
  await card(page).getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL("/");
  await expect(pill(page)).toHaveCount(0);
});

test("a long first name is cut with … and the header keeps its height", async ({ page }) => {
  await admin().from("profiles").update({ name: "Maximiliana-Josefina-Carolina Lopes" }).eq("user_id", userId);
  try {
    await logInTo(page, "/");
    if (isPhone(page)) {
      await expect(pill(page)).not.toContainText("Maximiliana"); // no first name on phone
    } else {
      const name = pill(page).locator(".truncate");
      await expect(name).toHaveText("Maximiliana-Josefina-Carolina");
      expect(await name.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true); // cut with "…" (text-overflow: ellipsis)
      const row = page.locator("header > div").first();
      expect((await row.boundingBox())!.height).toBe(56); // the navy row keeps its 56 px (story 19)
    }
    expect((await pill(page).boundingBox())!.height).toBeLessThanOrEqual(48);
  } finally {
    await admin().from("profiles").update({ name: "Rita Lopes" }).eq("user_id", userId);
  }
});
