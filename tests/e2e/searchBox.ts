// Types in a search box (story 1, story 8) at either size. Phone: the box on the page searches as you type.
// Desktop (story 12): on the home page the box is in the header and searches when Search / Enter is pressed.
import type { Page } from "@playwright/test";

export async function typeSearch(page: Page, text: string) {
  const box = page.getByRole("searchbox", { name: "Album or artist" });
  // Typing before React has taken over the page loses the text: wait until the box is hydrated.
  const handle = await box.elementHandle();
  await page.waitForFunction((el) => !!el && Object.keys(el).some((k) => k.startsWith("__reactProps")), handle);
  await box.fill(text);
  if ((page.viewportSize()?.width ?? 0) >= 1024) await box.press("Enter");
}
