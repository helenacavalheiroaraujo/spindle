# Story 4 · Compare versions (phase 4)

> Part of the Spindle MVP specification. Build order, out of scope, shared rules and traceability: [`SPEC.md`](../SPEC.md).


**As a buyer, I want to compare the best versions side by side, so I see what really differs.**

## Scope
- **"Compare pressings"** on the recommendation screen (story 3)
- Shows the recommended version and the next best by total score (story 3 rule): **2 on phone, 3 on desktop**
- Only versions **with active listings** (same rule as the recommendation)
- Rows (same order for every version), in plain words as in the design: sound (a short word from the data, e.g. "Cleaner"); typical price; first pressing (Yes / No); best condition on sale (grade name, e.g. "Near mint"); number for sale. Release year, country, label and format sit in the column heading. No 1–5 scores are shown.
- **The buyer's chosen priorities are highlighted**, in rank order, at the top
- Tapping a version → the version page (design: `docs/design/version-page.html`): version details, how it fits the buyer's priorities, track list, and its verified listings (beside it on desktop; on phone behind "See verified listings"). "Back to compare" returns to the comparison.

## Designs
| Screen | Design |
|---|---|
| Compare pressings (phone and desktop) | `docs/design/compare-desktop.html` (approved 2026-11-08): 2 versions on phone, up to 3 on desktop. Phone also in `Spindle_mockups_by_section.pdf` p. 11 |
| Version page (from a column) | `docs/design/version-page.html` (approved 2026-11-08) |

## Acceptance criteria
- [ ] On a phone-sized screen, 2 versions are shown; on desktop, up to 3
- [ ] The first column is the recommended version; the others follow by total score
- [ ] Versions without listings are not shown
- [ ] The rows for the buyer's chosen priorities are highlighted and appear first, in rank order
- [ ] With only one version on sale, "Compare pressings" is not shown
- [ ] Tapping a version opens its page with its listings

## Edge cases
- Only one version with listings → no comparison
- Two versions on desktop (fewer than 3 available) → show 2

## Data used
- Same as stories 3 and 6 (version scores, details, typical range, listings)

## Non-functional
- Highlight is not shown by colour alone (accessibility)

## Out of scope (MVP)
- Choosing which versions to compare
- Buying from the version page uses the same Buy flow as story 5
