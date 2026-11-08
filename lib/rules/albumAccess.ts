// Whether a search result opens (story 1 + story 3 · finding #50): covered by tests/unit/albumAccess.test.ts.
// An album opens only when it has active listings and reason texts for its recommendation.
// With listings but no reason texts (Hunky Dory in the seed) it shows "Not in the demo" and does not open.
export type AlbumAccess = "open" | "no_listings" | "not_in_demo";

export function albumAccess(hasListings: boolean, hasReasons: boolean): AlbumAccess {
  if (!hasListings) return "no_listings";
  return hasReasons ? "open" : "not_in_demo";
}
