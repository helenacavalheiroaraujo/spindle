import { defineConfig, devices } from "@playwright/test";

// Every critical flow runs on a phone (375 px) and on desktop (1280 px) — CLAUDE.md.
export default defineConfig({
  testDir: "tests/e2e",
  use: { baseURL: "http://localhost:3000" },
  projects: [
    { name: "phone", use: { ...devices["iPhone 13"], viewport: { width: 375, height: 812 } } },
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
  ],
  webServer: { command: "npm run dev", url: "http://localhost:3000", reuseExistingServer: true },
});
