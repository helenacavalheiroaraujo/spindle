// Captures every screen in docs/ux-review/findings.json that has a route, at 375 and 1280 px.
// Output: .ux-review/shots/<key>-<width>.png (git-ignored). Screens with auth: true use a temporary
// test account (created with the admin key from .env.local, as tests/e2e/login.spec.ts does) and delete it afterwards.
import { test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

// search: optional text typed into the page's search box before the picture (e.g. search results).
type Screen = { key: string; route: string | null; auth?: boolean; search?: string };
const register = JSON.parse(readFileSync("docs/ux-review/findings.json", "utf8"));
const screens: Screen[] = (register.screens ?? []).filter((s: Screen) => s.route);
const needsAuth = screens.some((s) => s.auth);

function env(name: string) {
  if (process.env[name]) return process.env[name]!;
  const line = readFileSync(".env.local", "utf8").split("\n").findLast((l) => l.startsWith(`${name}=`));
  return line?.slice(name.length + 1).trim() ?? "";
}
const admin = () =>
  createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SECRET_KEY"), { auth: { persistSession: false } });

const PASSWORD = "vinyl-test-123";
let email = "";
let userId = "";

test.beforeAll(async ({}, info) => {
  if (!needsAuth) return;
  email = `spindle-uxreview-${info.project.name}-${Date.now()}@spindle.test`;
  const { data, error } = await admin().auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { name: "Rui Costa" },
  });
  if (error) throw error;
  userId = data.user.id;
  await admin().from("profiles").insert({ user_id: userId, name: "Rui Costa" });
});

test.afterAll(async () => {
  if (!userId) return;
  await admin().from("profiles").delete().eq("user_id", userId);
  await admin().auth.admin.deleteUser(userId);
});

for (const s of screens) {
  test(s.key, async ({ page }) => {
    const width = page.viewportSize()?.width ?? 0;
    if (s.auth) {
      await page.goto(`/login?next=${encodeURIComponent(s.route!)}`);
      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Password").fill(PASSWORD);
      await page.getByRole("button", { name: "Log in" }).click();
      await page.waitForURL((u) => !u.pathname.startsWith("/login"));
    }
    await page.goto(s.route!);
    await page.waitForLoadState("networkidle");
    if (s.search) {
      await page.getByRole("searchbox").first().fill(s.search);
      await page.waitForTimeout(800);
      await page.waitForLoadState("networkidle");
    }
    // Hide the Next.js development badge: it is not part of the app.
    await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
    await page.screenshot({ path: `.ux-review/shots/${s.key}-${width}.png`, fullPage: true });
  });
}
