// UX review capture: same two sizes and dev server as playwright.config.ts (CLAUDE.md · 375 and 1280 px).
// Run from the project root: npx playwright test -c .claude/skills/ux-review/scripts/capture.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "capture.spec.ts",
  outputDir: "../../../../.ux-review/test-results",
  reporter: "line",
  workers: 1,
  use: { baseURL: "http://localhost:3000" },
  projects: [
    { name: "375", use: { ...devices["iPhone 13"], viewport: { width: 375, height: 812 } } },
    { name: "1280", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
  ],
  webServer: { command: "npm run dev", url: "http://localhost:3000", reuseExistingServer: true },
});
