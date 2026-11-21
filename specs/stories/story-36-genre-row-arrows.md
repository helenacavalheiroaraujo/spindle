# Story 36 · Arrows on the genre row (desktop)

> Part of the Spindle MVP specification. Build order, out of scope, shared rules and traceability: [`SPEC.md`](../SPEC.md).

**As a buyer on a computer, I want arrows on the genre row, so I can move along the genres with one click.**

## Scope
- On desktop (1024 px and wider), with **7 or more** crates, the row has a visible heading "Crates by genre" and two round arrows (44 px) at the right end of it (owner's decision, 21 Nov 2026; reverses "No arrows" of story 24).
- The left arrow is greyed and disabled at the start of the row; the right arrow is greyed and disabled at the end.
- One click moves the row by one crate. The progress line and the label "Showing 1 to 4 of N genres" follow the row, as in story 24.
- Phone (under 1024 px): no arrows and no heading; the row still swipes sideways (story 24).
- With **6 or fewer** crates: unchanged, no arrows and no heading.
- Dragging and the trackpad keep working on desktop.

## Use cases
1. **Open the home page on desktop with 7 genres** → the heading and two arrows show; the left one is greyed.
2. **Click the right arrow** → the row moves one crate; the label changes to "Showing 2 to 5 of 7 genres".
3. **Reach the end of the row** → the right arrow is greyed.

## Acceptance criteria
- [ ] At 1280 px with 7 crates, the heading "Crates by genre" and two arrows show; the left arrow is disabled
- [ ] The right arrow moves the row by one crate and the label follows ("Showing 2 to 5 of 7 genres")
- [ ] At the end of the row the right arrow is disabled and the left one is enabled
- [ ] The left arrow moves the row back by one crate
- [ ] At 375 px there are no arrows and no heading
- [ ] With 6 or fewer crates there are no arrows and no heading
- [ ] The arrows can be used with the keyboard and are named "Previous genres" and "Next genres"

## Edge cases
- A genre loses its last album and the count falls to 6: arrows and heading go with the progress line.

## Non-functional
- Arrows 44 px; navy outline on cream, as in the design; English text only

## Designs
- Option A of `docs/design/user-test-options.html` (part 2): two arrows at the right end of the heading, approved by the owner on 21 Nov 2026

## Out of scope
- Arrows on the phone
- Pagination or a "See all" button
