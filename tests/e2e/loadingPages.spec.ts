// Loading mask of the search results (story 17). Its data request is held back while the search runs in the browser,
// so the mask shows; then it is released. The loading masks of the other pages built on the server cannot be held
// this way: they stay in the manual record (docs/manual-tests.md, M1–M16).
import { expect, test, type Page } from "@playwright/test";
import { typeSearch } from "./searchBox";

// Holds the page's own navigation requests (React Server Components, not prefetches) until release() is called.
function holdNavigations(page: Page) {
  let open = false;
  let release = () => {};
  const gate = new Promise<void>((resolve) => (release = resolve));
  void page.route("**/*", async (route) => {
    const h = route.request().headers();
    if (!open && h["rsc"] === "1" && !h["next-router-prefetch"]) await gate;
    await route.continue();
  });
  return () => {
    open = true;
    release();
  };
}

test("M14 · search for 'bowie': 'Searching…' then the results", async ({ page }) => {
  await page.goto("/");
  const release = holdNavigations(page);
  await typeSearch(page, "bowie");
  await expect(page.getByRole("status").filter({ hasText: "Searching…" })).toBeVisible();
  release();
  await expect(page).toHaveURL(/\/search\?q=bowie/);
  await expect(page.getByRole("status").filter({ hasText: "Searching…" })).toHaveCount(0);
});
