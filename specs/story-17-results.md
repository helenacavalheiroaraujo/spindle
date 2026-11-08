# Story 17 · Search results page

> Part of the Spindle MVP specification. Build order, out of scope, shared rules and traceability: [`SPEC.md`](../SPEC.md).

**As a buyer, I want my search to open a page of its own, so I always know where I am.**

## Scope
- A page `/search?q=…`, reached from the Search button, Enter, or "See all results" in the suggestion box (story 16)
- Content: search box on top with the typed text, "← Back to home", "Results for “…”", the number of albums, then the albums as in story 1, newest first
- No crates and no "This week" on this page
- Search results no longer appear on the home page under the search box (replaces that part of story 1)

## Use cases
1. **Search** → results page
2. **Tap an album** → as story 1 (priorities screen, or "Nobody is selling this album right now" / "Not in the demo")
3. **Typo** → "No albums found for “…”" with up to 3 "Did you mean…" albums (story 1 rule), or only "No albums found"
4. **Open the address directly** (or reload) → the same results
5. **Edit the text and search again** → the page shows the new results

## Acceptance criteria
- [ ] After Search or Enter, the page `/search?q=…` opens and shows only the results, never the home page content
- [ ] The home page does not list results under the search box
- [ ] "bowie" lists David Bowie's albums, newest first, each with cover, title, artist, year and "n versions"; an album with no listings shows "No listings"
- [ ] "ziggy" shows "1 album" and the Ziggy Stardust row
- [ ] "zigy" shows "No albums found for “zigy”" and the "Did you mean" album
- [ ] The search box keeps the typed text; "← Back to home" returns to the home page
- [ ] Opening the address directly gives the same page
- [ ] Phone (375 px) and desktop (1280 px) as in the design

## Edge cases
- Fewer than 3 characters: no search is run; the page shows "Type at least 3 characters to search."
- Loading shows the shared `LoadingMask`; a failure shows the shared `ErrorScreen` with "Try again", keeping the typed text

## Non-functional
- Same visual direction as the rest of the app; English text only; illustrative data labelled

## Designs
- `docs/design/search-results-desktop.html`, approved 2026-11-08

## Out of scope
- Filters and sorting other than newest first; search by artist page

## Open points
1. The sell search screen (story 8) is not changed by this story; it gets the suggestion box with story 16.
