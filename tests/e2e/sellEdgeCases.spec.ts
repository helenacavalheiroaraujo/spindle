// Story 8 · Sell — two cases noted in the build: a failed photo upload, and "Your listing" beside the
// recommendation on desktop. Run on phone and desktop (playwright.config.ts).
// Creates a real test account (city already saved) and, for the second test, a temporary "Test pressing"
// version under Hunky Dory; removes them, their listings and photos afterwards. Never touches Ziggy Stardust.
import { expect, test, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

function env(name: string) {
  if (process.env[name]) return process.env[name]!;
  const line = readFileSync(".env.local", "utf8").split("\n").findLast((l) => l.startsWith(`${name}=`));
  return line?.slice(name.length + 1).trim() ?? "";
}
const admin = () =>
  createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SECRET_KEY"), { auth: { persistSession: false } });

const HUNKY_DORY = "10000000-0000-0000-0000-000000000002";
const V_HOMOGENIC_1997 = "20000000-0000-0000-0000-000000000009"; // no listings, no typical range

// A real 1×1 PNG, so the browser can read and reduce it like a camera photo.
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");
const photo = (name: string) => ({ name: `${name}.png`, mimeType: "image/png", buffer: PNG });

const PASSWORD = "vinyl-test-123";
let email = "";
let userId = "";
let profileId = "";
let versionId = "";

test.beforeAll(async ({}, info) => {
  email = `spindle-sell-edge-${info.project.name}-${Date.now()}@spindle.test`;
  const { data, error } = await admin().auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { name: "Joana Faria" },
  });
  if (error) throw error;
  userId = data.user.id;
  const profile = await admin()
    .from("profiles")
    .insert({ user_id: userId, name: "Joana Faria", city: "Braga" })
    .select("id")
    .single();
  if (profile.error) throw profile.error;
  profileId = profile.data.id;
});

test.afterAll(async () => {
  const { data: listings } = await admin().from("listings").select("id").eq("seller_id", profileId);
  for (const l of listings ?? []) {
    await admin().from("check_results").delete().eq("listing_id", l.id);
    await admin().from("listings").delete().eq("id", l.id);
  }
  if (versionId) await admin().from("versions").delete().eq("id", versionId);
  const { data: files } = await admin().storage.from("listing-photos").list(profileId);
  if (files?.length) await admin().storage.from("listing-photos").remove(files.map((f) => `${profileId}/${f.name}`));
  await admin().from("profiles").delete().eq("id", profileId);
  await admin().auth.admin.deleteUser(userId);
});

async function logIn(page: Page, next: string) {
  await page.goto(`/login?next=${encodeURIComponent(next)}`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(next);
}

test("a failed photo upload: message, nothing listed, and the details are kept", async ({ page, browserName }, info) => {
  // The phone run uses WebKit, which does not let a test rewrite a form that carries files: the photos arrive
  // empty and the app shows its general "couldn't list" message instead. The upload path is the same at both sizes.
  test.skip(browserName === "webkit", "WebKit cannot rewrite a request that carries files");
  const typed = info.project.name === "phone" ? "41.11" : "42.22"; // phone and desktop run at the same time
  await logIn(page, `/sell/versions/${V_HOMOGENIC_1997}`);
  await page.getByText("Very good").click();
  await page.getByLabel("Front cover photo").setInputFiles(photo("cover"));
  await page.getByLabel("Record photo").setInputFiles(photo("record"));
  await expect(page.getByText("Record ✓")).toBeVisible();
  await page.getByLabel("Price").fill(typed);

  // Make the real upload fail: the photos are sent as a type the photo store refuses (only JPEG, PNG, WebP).
  // The app's own checks still pass, so the failure happens in the store, as with a real network or storage error.
  let fail = true;
  await page.route("**/*", (route) => {
    const r = route.request();
    if (!fail || r.method() !== "POST" || !r.headers()["next-action"]) return route.continue();
    const body = r.postDataBuffer();
    if (!body || !body.includes("image/jpeg")) return route.continue();
    return route.continue({ postData: Buffer.from(body.toString("latin1").replaceAll("image/jpeg", "image/gif"), "latin1") });
  });
  await page.getByRole("button", { name: "List for sale" }).click();

  const alert = page.getByRole("alert").filter({ hasText: "We couldn't upload your photos" });
  await expect(alert).toContainText("Nothing was listed; your details are kept.");
  const { data: none } = await admin().from("listings").select("id").eq("seller_id", profileId).eq("price", Number(typed));
  expect(none).toEqual([]);
  const { data: files } = await admin().storage.from("listing-photos").list(profileId);
  expect(files ?? []).toEqual([]); // no orphan photos

  // "Try again" → the form with everything as typed; listing now works.
  fail = false;
  await alert.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByLabel("Price")).toHaveValue(typed);
  await expect(page.getByText("Record ✓")).toBeVisible();
  await page.getByRole("button", { name: "List for sale" }).click();
  await expect(page).toHaveURL(`/versions/${V_HOMOGENIC_1997}/listings`);
  await expect(page.getByRole("listitem").filter({ hasText: `€${typed}` })).toContainText("Your listing");
});

test("desktop: the seller's own listing beside the recommendation shows 'Your listing', not Buy", async ({ page, isMobile }, info) => {
  test.skip(isMobile, "on phone the listings open on their own screen (covered in sell.spec.ts)");
  // A temporary version that wins on Sound, with one listing by the test seller.
  const version = await admin()
    .from("versions")
    .insert({
      album_id: HUNKY_DORY,
      name: `Test pressing beside ${info.project.name}`,
      release_year: 2021,
      country: "EU",
      label: "Test",
      format: "LP",
      sound_score: 5,
      original_score: 1,
      typical_price_min: 20,
      typical_price_max: 30,
    })
    .select("id")
    .single();
  if (version.error) throw version.error;
  versionId = version.data.id;
  const listing = await admin().rpc("create_listing", {
    p_seller_id: profileId,
    p_version_id: versionId,
    p_condition_code: "NM",
    p_price: 21,
    p_cover_photo_url: "/photos/cover.svg",
    p_record_photo_url: "/photos/record.svg",
    p_matrix_photo_url: null,
    p_city: null,
    p_shop_name: null,
  });
  if (listing.error) throw listing.error;

  await logIn(page, "/");
  await page.goto(`/albums/${HUNKY_DORY}/recommendation?priorities=sound`);
  await expect(page.getByText(`Test pressing beside ${info.project.name}`).first()).toBeVisible();
  const beside = page.getByRole("complementary", { name: "Verified listings for this version" });
  const row = beside.getByRole("listitem").filter({ hasText: "€21" });
  await expect(row.getByText("Your listing")).toBeVisible();
  await expect(row.getByRole("link", { name: /^Buy/ })).toHaveCount(0);
  await expect(row.getByRole("button", { name: /^Buy/ })).toHaveCount(0);
});
