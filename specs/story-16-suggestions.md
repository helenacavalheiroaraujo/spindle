# Story 16 · Search suggestions

> Part of the Spindle MVP specification. Build order, out of scope, shared rules and traceability: [`SPEC.md`](../SPEC.md).

**As a buyer, I want to see matching albums while I type, so I can pick one without opening a results page.**

## Scope
- A suggestion box under the search box (home page; on desktop, the header search), from the 3rd character
- Up to 4 albums, newest first. Each row: cover, title, artist, year, "n versions" or "No listings" (same row as story 1)
- Last line: "See all results for “…”"
- Matching is the same as story 1 (title and artist, ignoring case and accents)
- The sell search screen (story 8) gets the same suggestion box. There a suggestion opens the album's list of versions (story 8), not the priorities screen. The sell screen has no results page of its own: it keeps its list under the box.

## Use cases
1. **Tap a suggestion** → as story 1: priorities screen (story 2), or "Nobody is selling this album right now" / "Not in the demo"
2. **Tap "See all results for …", press Search or Enter** → results page (story 17)
3. **Type with a typo** → the box shows "Did you mean…?" with up to 3 albums (story 1 rule); with no match, "No albums found"

## Acceptance criteria
- [ ] With fewer than 3 characters, no box is shown
- [ ] "bowie" shows up to 4 albums, newest first, and the line "See all results for “bowie”"
- [ ] Each suggestion shows cover, title, artist, year and "n versions" or "No listings"
- [ ] "BOWIE" and "bowie" give the same suggestions; "bjork" finds "Björk"
- [ ] A typo or no match gives "Did you mean…?" or "No albums found", as in story 1
- [ ] Keys: ↑ ↓ move, Enter opens the highlighted row (or the results page if none is highlighted), Esc closes; tapping outside closes the box
- [ ] Loading shows the shared `LoadingMask` ("Searching…"); a failure shows the shared `ErrorScreen` with "Try again" and keeps the typed text

## Edge cases
- Pressing Search with fewer than 3 characters does nothing (message to be decided with story 17)
- Slow typing or fast typing: the box always shows the result of the last text typed

## Non-functional
- Same visual direction as the rest of the app; English text only; illustrative data labelled

## Designs
- `docs/design/search-autocomplete-options.html`, **option B** (with covers), approved 2026-11-08

## Out of scope
- Artist suggestions; recent searches

## Open points
1. Depends on story 17: the "See all results" line opens its page.
