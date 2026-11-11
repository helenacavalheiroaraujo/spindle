# Story 24 · More genres and a crate row for 7+ genres

> Part of the Spindle MVP specification. Build order, out of scope, shared rules and traceability: [`SPEC.md`](../SPEC.md).

**As a buyer, I want more genres on the home page, and a way to browse them when there are more than six, so I can find my music faster.**

## Scope
- New genre: **Classical**, with 8 albums by Ludovico Einaudi.
- **Rock** gets 4 Kaleo, 3 Pink Floyd, 4 Arctic Monkeys and 4 Radiohead albums. The Pink Floyd album *The Dark Side of the Moon* is already in the seed.
- Crates sorted alphabetically.
- With **7 or more** crates, the row shows a progress line under it and the label "Showing 1 to 4 of N genres". No arrows. The row moves by drag, trackpad or swipe.
- Phone (375 px): the row swipes sideways.
- With **6 or fewer** crates, the row is unchanged: no line and no label.

## Use cases
1. **Open the home page with 7 genres** → the crate row shows the progress line and the label; drag or swipe moves along the row.
2. **Tap a crate** → genre screen, as in story 12.

## Acceptance criteria
- [ ] Classical appears as a genre in the database and in the crates
- [ ] A genre with no albums has no crate
- [ ] Crates are in alphabetical order
- [ ] With 7+ crates, the row shows the progress line and "Showing 1 to 4 of N genres"
- [ ] With 7+ crates, the row moves by drag, trackpad and swipe
- [ ] With 6 or fewer crates, no line and no label show
- [ ] On phone, the row swipes sideways

## Edge cases
- A genre loses its last album: its crate goes; at 6 crates the line and the label go.

## Data used
- **Album:** genre (one per album), from the list in migration `0012`.
- **Demo data (seed):** the 23 albums above, with full demo data (versions, scores, tracks, typical prices, listings and checks), labelled "Illustrative data". Years marked as unconfirmed in the decision log are checked before the seed is written.

## Non-functional
- Works on phone and desktop; crates large enough to tap
- All catalogue data is illustrative

## Designs
- Crate row with 7+ genres: option C (progress line, no arrows), approved by the owner. File: `docs/design/crate-carousel-options.html`
- Phone: sideways swipe, same file

## Out of scope
- Arrows (rejected by the owner in favour of option C)
- Pagination or a "See all" button (options A and B of the same file, not chosen)
- "All genres and formats" (story 10)
