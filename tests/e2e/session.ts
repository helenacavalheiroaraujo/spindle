// Log in without hitting Supabase Auth's rate limit (finding: ~200 log-ins per run returned 429 and the
// suite failed at random). Call it on the log-in page, where each spec used to fill in the form.
// The first call for an account in a worker is a real log-in through the form; later calls reuse its cookies
// and open the page the form would have returned to. login.spec.ts and signup.spec.ts keep using the real form.
import type { BrowserContext, Page } from "@playwright/test";

type Cookies = Awaited<ReturnType<BrowserContext["cookies"]>>;
const sessions = new Map<string, Cookies>(); // one entry per account, per worker

export async function signIn(page: Page, email: string, password: string) {
  const saved = sessions.get(email);
  if (saved) {
    const next = new URL(page.url()).searchParams.get("next") ?? "/";
    await page.context().addCookies(saved);
    await page.goto(next);
    return;
  }
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
  sessions.set(email, await page.context().cookies());
}
