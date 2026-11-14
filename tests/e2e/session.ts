// Log in without hitting Supabase Auth's rate limit (finding: ~200 log-ins per run returned 429 and the
// suite failed at random). Call it where the log-in window is open: /login, /signup, or a page that needs an account
// opened signed out (story 29), where each spec used to fill in the form.
// The first call for an account in a worker is a real log-in through the form; later calls reuse its cookies
// and open the page the form would have returned to. login.spec.ts and signup.spec.ts keep using the real form.
import { expect, type BrowserContext, type Page } from "@playwright/test";

type Cookies = Awaited<ReturnType<BrowserContext["cookies"]>>;
const sessions = new Map<string, Cookies>(); // one entry per account, per worker

export async function signIn(page: Page, email: string, password: string) {
  const saved = sessions.get(email);
  if (saved) {
    const url = new URL(page.url());
    const onLoginPage = url.pathname === "/login" || url.pathname === "/signup";
    const next = onLoginPage ? (url.searchParams.get("next") ?? "/") : url.pathname + url.search; // story 29: same page
    await page.context().addCookies(saved);
    await page.goto(next);
    return;
  }
  const box = page.getByRole("dialog");
  // On a phone the window rises from the bottom (story 27): wait until it has stopped, or a slow run clicks the dimmed
  // area under it instead of "Log in".
  await windowReady(page);
  await box.getByLabel("Email").fill(email);
  await box.getByLabel("Password").fill(password);
  await box.getByRole("button", { name: "Log in" }).click();
  // Logged in, the window opens the next page with a full page load, where no window is open (story 29: often the
  // same address, so the address alone does not say it is done).
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
  await expect(page.locator("dialog[open]")).toHaveCount(0, { timeout: 15_000 });
  sessions.set(email, await page.context().cookies());
}

// The log-in window has stopped moving (on a phone it rises from the bottom, story 27): call it before typing in it.
export async function windowReady(page: Page) {
  await page.getByRole("dialog").evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
}
