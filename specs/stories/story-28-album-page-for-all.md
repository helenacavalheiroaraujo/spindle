# Story 28 · One album page for every album

> Part of the Spindle MVP specification. Build order, out of scope, shared rules and traceability: [`SPEC.md`](../SPEC.md).

**As a buyer, I want every album to open the same album page, so I can be sure what I am buying before I choose a version.**

## Scope
- Tapping an album anywhere (search suggestions, search results, genre screen, "This weekend" on the home page) always opens the album page (`/albums/[id]`): cover, title, artist, year, release date, label, the musician's description and the track list (as story 21).
- Only the action card under the title changes:
  - active listings, no saved ranking (signed out, or signed in without one): "Several versions are on sale" · "Tell us what matters to you and we pick one for you." · **Help me choose a version** → priorities screen (story 2) → recommendation (story 3)
  - active listings and a saved ranking: "Your recommendation is ready" · "We picked a version using your priorities." · **See your recommendation** → recommendation with the saved ranking; below it "Based on: Price, Sound · Change", where "Change" opens the priorities screen with the saved ranking filled in (as story 3)
  - no active listings: "Nobody is selling this album right now" (story 21 text, unchanged)
- The action button is the strongest element on the page: on phone the cover is 60% of the width, so the button shows without scrolling.
- If MusicBrainz fails, the track list comes from our database: the tracks of the album's earliest version, without the "Bonus" tracks.
- Albums "Not in the demo" do not open, as today (finding #50).

## Use cases
1. **Signed out, tap Ziggy Stardust** → album page → Help me choose a version → priorities → recommendation
2. **Signed in with a saved ranking, tap Ziggy Stardust** → album page → See your recommendation → recommendation "Based on: Price, Sound"
3. **Tap Kind of Blue** → album page with "Nobody is selling this album right now"

## Acceptance criteria
- [x] From search suggestions, search results, the genre screen and "This weekend", an album with active listings opens `/albums/[id]`, not the priorities screen or the recommendation
- [x] No saved ranking: the card shows "Help me choose a version"; it opens the priorities screen for that album
- [x] Saved ranking: the card shows "See your recommendation" and "Based on: …" in the saved order; it opens the recommendation with that ranking; "Change" opens the priorities screen with the ranking filled in
- [x] No active listings: the page is as in story 21, with the smaller cover on phone
- [x] MusicBrainz down: the track list still shows, from the earliest version in the database, without "Bonus" tracks; Wikipedia down: no "About" section, the rest stays
- [x] At 375 × 812 the action button is fully visible without scrolling; 1280 px as in the design
- [x] Loading mask and error screen with "Try again" (Shared rules)

## Edge cases
- Saved ranking but the album changed (story 2): the saved ranking is used, as today
- Opening `/albums/[id]/priorities` directly still works as in story 2

## Non-functional
- Buttons at least 44 px tall; English text only; data not stored (story 21)

## Designs
- Approved 14 Nov 2026, option A′: `docs/design/album-page-with-listings-options.html` (section "Option A′")

## Out of scope
- Changes to the priorities, recommendation and listing screens
- Options A, B and C of the design page were not chosen

## Open points
None.
