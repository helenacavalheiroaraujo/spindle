// Loading masks and error screens of the sections that load in the browser (SPEC · Shared rules), phone and desktop.
// The server action behind each one is held back or cut, so the shared loading mask and error screen show.
// The loading masks and error screens of the pages built on the server cannot be provoked from the browser:
// they are in the manual test record (docs/manual-tests.md, DECISIONS · Testing).
import { expect, test } from "@playwright/test";
import { typeSearch } from "./searchBox";

const ZIGGY_ID = "10000000-0000-0000-0000-000000000001";
const isServerAction = (route: { request: () => { method: () => string; headers: () => Record<string, string> } }) =>
  route.request().method() === "POST" && !!route.request().headers()["next-action"];

test("home sections: 'Loading the shop…' while they load, then the crates", async ({ page }) => {
  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => (release = resolve));
  await page.route("**/*", async (route) => {
    if (isServerAction(route)) await gate;
    await route.continue();
  });
  await page.goto("/");
  await expect(page.getByRole("status").filter({ hasText: "Loading the shop…" })).toBeVisible();
  await expect(page.getByRole("searchbox", { name: "Album or artist" })).toBeVisible(); // the search stays usable
  release();
  await expect(page.getByRole("link", { name: "Rock, 4 records" })).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "Loading the shop…" })).toHaveCount(0);
});

test("listings beside the recommendation (desktop): loading mask, then an error screen with 'Try again' that recovers", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "on phone the listings open on their own screen");
  let mode: "hold" | "fail" | "ok" = "hold";
  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => (release = resolve));
  await page.route("**/*", async (route) => {
    if (!isServerAction(route) || mode === "ok") return route.continue();
    if (mode === "fail") return route.abort();
    await gate;
    return route.abort(); // held, then cut
  });
  await page.goto(`/albums/${ZIGGY_ID}/recommendation?priorities=price`);
  const beside = page.getByRole("complementary", { name: "Verified listings for this version" });
  await expect(beside.getByRole("status").filter({ hasText: "Checking listings…" })).toBeVisible();
  mode = "fail";
  release();
  const alert = beside.getByRole("alert").filter({ hasText: "We couldn't load the listings" });
  await expect(alert).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible(); // the recommendation stays
  mode = "ok";
  await alert.getByRole("button", { name: "Try again" }).click();
  await expect(beside.getByRole("listitem").first()).toBeVisible();
  await expect(alert).toHaveCount(0);
});

test("search: 'Searching…' while the albums load, with the typed text kept", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Rock, 4 records" })).toBeVisible(); // the page has finished loading
  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => (release = resolve));
  await page.route("**/*", async (route) => {
    if (isServerAction(route)) await gate;
    await route.continue();
  });
  await typeSearch(page, "ziggy");
  await expect(page.getByRole("status").filter({ hasText: "Searching…" })).toBeVisible();
  release();
  await expect(page.getByRole("list", { name: "Search results" }).getByRole("listitem")).toHaveCount(1);
});
