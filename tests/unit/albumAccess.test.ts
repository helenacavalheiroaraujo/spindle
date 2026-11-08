// Decision table from story 1 ("No listings") and DECISIONS.md (finding #50): only albums with
// recommendation data open; others with listings show "Not in the demo".
import { describe, expect, it } from "vitest";
import { albumAccess } from "@/lib/rules/albumAccess";

describe("albumAccess", () => {
  it.each([
    ["listings and reasons (Ziggy Stardust)", true, true, "open"],
    ["listings, no reasons (Hunky Dory)", true, false, "not_in_demo"],
    ["no listings, no reasons (Blackstar)", false, false, "no_listings"],
    ["no listings, with reasons", false, true, "no_listings"],
  ])("%s → %s", (_, hasListings, hasReasons, expected) => {
    expect(albumAccess(hasListings, hasReasons)).toBe(expected);
  });
});
