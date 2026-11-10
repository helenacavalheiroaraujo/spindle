// Screenshots for the final PDF (DECISIONS · screenshots). Saved only when SCREENSHOTS=1 (npm run screenshots),
// so normal test runs never change the images in git.
// File: docs/screenshots/story-<n>/<name>-<width>.png, e.g. story-9/signup-375.png.
import type { Page } from "@playwright/test";

// A bug fix passes its folder name instead of a story number, e.g. "bug-10" → docs/screenshots/bug-10/.
export async function screenshot(page: Page, story: number | string, name: string) {
  if (process.env.SCREENSHOTS !== "1") return;
  const width = page.viewportSize()?.width ?? 0;
  // Hide the Next.js development badge: it is not part of the app.
  await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  await page.screenshot({ path: `docs/screenshots/${typeof story === "number" ? `story-${story}` : story}/${name}-${width}.png`, fullPage: true });
}
