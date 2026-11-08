# Story 12 · Home page

> Part of the Spindle MVP specification. Build order, out of scope, shared rules and traceability: [`SPEC.md`](../SPEC.md).


**As a buyer, I want a home page that shows what I can find, so I can start from a genre or a search.**

## Scope
- Title "Pick a crate. We'll pick the pressing." and the line "No jargon, no homework. We tell you which version to buy and check every listing."
- Search box (story 1), unchanged; on desktop it sits in the header of every page ("Which record are you after?")
- **Crates by genre:** one per genre that has albums, with the real number of albums ("4 records")
- **This week at the shop:** "This weekend" features one album on sale; "For sellers": "Sell for free, 0% commission"

## Use cases
1. **Tap a crate** → genre screen: that genre's albums, with the same rows as the search results (story 1); tapping an album works as in story 1
2. **Search** (phone: on the page; desktop: from the header) → story 1
3. **Tap "This weekend"** → the featured album (priorities screen, story 2)
4. **Tap "For sellers"** → sell flow (story 8; log in first if signed out)

## Acceptance criteria
- [ ] The home page shows the title, the search, one crate per genre with albums, and the two "This week" cards
- [ ] Each crate shows the real number of albums in that genre; genres with no albums are not shown
- [ ] Tapping a crate opens the genre screen with only that genre's albums, newest first
- [ ] On desktop the search is in the header on every page and gives the same results as story 1
- [ ] "This weekend" opens the featured album's priorities screen; "For sellers" opens the sell flow
- [ ] "This weekend" features the album that opens (story 1) with the most active listings, newest first on a tie; if no album opens, the card is not shown

## Edge cases
- Featured album sells out → the next album that opens takes its place; if none, only "For sellers" is shown

## Data used
- **Album:** genre (new, one per album)
- **Demo data (seed):** Rock: Ziggy Stardust, Hunky Dory, Blackstar, The Dark Side of the Moon (Pink Floyd, 1973) · Soul and funk: Let's Dance · Electronic: Homogenic, Megalithic Symphony (AWOLNATION, 2011). Let's Dance, Homogenic (2017 Reissue only), The Dark Side of the Moon and Megalithic Symphony get full demo data (versions, scores, reasons, listings, checks), so every crate opens at least one album on sale.

## Non-functional
- Works on phone and desktop; crates large enough to tap
- All catalogue data is illustrative

## Designs
- Home page (title, search, crates): Assignment 1 designs, `docs/design/HappyPath.png` (phone) and `docs/design/Spindle_user_flow_desktop.png` (desktop)
- Genre screen: option B, crate on top — `docs/design/genre-screen-options.html` (phone), `docs/design/genre-screen-desktop.html`
- This week at the shop: option B, stacked cards — `docs/design/this-week-options.html` (phone), `docs/design/this-week-desktop.html` (side by side)

## Out of scope
- "Because you like…" with a wishlist (story 13)
- "All genres and formats" (needs filters, story 10)
