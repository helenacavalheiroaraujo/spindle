# Story 25 · Recommendation page polish

> Part of the Spindle MVP specification. Build order, out of scope, shared rules and traceability: [`SPEC.md`](../SPEC.md).

**As a buyer, I want the recommendation page to be clear and easy to scan, so I can decide faster.**

## Scope
- Left column under the title: the track list goes under the cover (finding 38).
- No price slider. The sentence "Typical price for this pressing: €20–€32" stays, labelled "Illustrative data" (finding 39).
- "Reissue", "first pressing" and "reissue" are plain text, with no dotted underline (finding 40).
- The "Illustrative data" label at the top of the page covers the whole page. No extra label is added (finding 41).
- No "Shop" tag next to the seller name (finding 42).
- More space between "Buy" and "Add to cart" (finding 43).

## Use cases
1. **Open the recommendation page at 1280 px** → the left column shows the cover and the track list; the price shows the typical-price sentence and no slider.

## Acceptance criteria
- [ ] At 1280 px, the left column shows the track list under the cover
- [ ] The recommendation page has no price slider
- [ ] "Typical price for this pressing: €20–€32" is shown and labelled "Illustrative data"
- [ ] "Reissue", "first pressing" and "reissue" have no dotted underline
- [ ] The "Illustrative data" label at the top covers the whole page
- [ ] No "Shop" tag appears next to the seller name
- [ ] There is visible space between "Buy" and "Add to cart"

## Non-functional
- Checked at 375 px (phone) and 1280 px (desktop)

## Designs
- Track list under the cover in the left column: **not yet approved**. A layout change needs an approved design before the story starts.

## Out of scope
- Price slider (removed)
- Links or explanations for the terms "Reissue", "first pressing" and "reissue"
- Any other change to the recommendation page
