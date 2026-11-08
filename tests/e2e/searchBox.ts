// Types in a search box and searches (story 1, 8, 17). Buyers: the box on the page (phone) or in the header (desktop)
// opens /search?q=… when Enter is pressed. The sell screen (story 8) searches as you type; Enter does nothing there.
import type { Page } from "@playwright/test";

export async function typeSearch(page: Page, text: string) {
  const box = page.getByRole("searchbox", { name: "Album or artist" });
  // Typing before React has taken over the page loses the text: wait until the box is hydrated.
  const handle = await box.elementHandle();
  await page.waitForFunction((el) => !!el && Object.keys(el).some((k) => k.startsWith("__reactProps")), handle);
  await box.fill(text);
  await box.press("Enter");
}
