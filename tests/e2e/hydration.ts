// Typing or clicking before React has taken over the page loses the input: wait until the element is hydrated.
// The same wait as in searchBox.ts and cart.spec.ts, for any locator.
import type { Locator } from "@playwright/test";

export async function waitUntilHydrated(locator: Locator) {
  const handle = await locator.elementHandle();
  await locator.page().waitForFunction((el) => !!el && Object.keys(el).some((k) => k.startsWith("__reactProps")), handle);
}
