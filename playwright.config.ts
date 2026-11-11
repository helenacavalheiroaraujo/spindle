import { defineConfig, devices } from "@playwright/test";

// Every critical flow runs on a phone (375 px) and on desktop (1280 px) — CLAUDE.md.
export default defineConfig({
  testDir: "tests/e2e",
  use: { baseURL: "http://localhost:3000" },
  // One worker: the specs share one Supabase database, so running them in parallel makes them fail at random.
  workers: 1,
  projects: [
    { name: "phone", use: { ...devices["iPhone 13"], viewport: { width: 375, height: 812 } } },
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
  ],
  webServer: [
    // Fixed MusicBrainz answers for the album test (no network needed). The dev server below is pointed at it.
    { command: "node tests/e2e/musicbrainzStub.mjs", url: "http://localhost:4010/ws/2/release-group/", reuseExistingServer: true },
    {
      command: "npm run dev",
      url: "http://localhost:3000",
      reuseExistingServer: true,
      env: { MUSICBRAINZ_URL: "http://localhost:4010/ws/2" },
    },
  ],
});
