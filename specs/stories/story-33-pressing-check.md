# Story 33 · "Pressing check" on every listing

> Part of the Spindle MVP specification. Build order, out of scope, shared rules and traceability: [`SPEC.md`](../SPEC.md).

**As a buyer, I want each listing to say plainly whether it matches the pressing, so I do not need a legend to understand the colour.**

## Scope
- On every listing (listings screen on phone, listings beside the recommendation on desktop), the traffic-light word moves into a line under the seller: **Pressing check · Match**, with its meaning in one sentence, then "See the checks" (option A, approved 14 Nov 2026). Meanings as built for bug 4: Match "All three checks match this version", Check "At least one check is uncertain", No match "It's a different pressing".
- The whole listing becomes a card tinted with its colour and a thin border of the same colour (Colour 3): green, amber or red.
- The legend above the list and "What do these mean?" are removed.
- The traffic light rule, order, red-listing texts and the listing check screen do not change (story 5).

## Use cases
1. **Open the listings of Ziggy Stardust 2012 Remaster** → green, amber and red cards, each with its "Pressing check" line

## Acceptance criteria
- [ ] Each listing shows "Pressing check", the word and its meaning, then "See the checks"
- [ ] Each listing is tinted with its colour and has a thin border of that colour; the word is always written (never colour alone)
- [ ] No legend and no "What do these mean?" on the listings screen or beside the recommendation
- [ ] Text on every tint meets 4.5:1 contrast
- [ ] 375 px and 1280 px

## Edge cases
- "Moved here · check pending" listings are amber with the Check meaning (story 5)
- The seller's own listing ("Your listing") keeps its tint and line

## Non-functional
- English text only; illustrative data stays labelled

## Designs
- Approved 14 Nov 2026, option A + Colour 3: `docs/design/traffic-light-redesign-options.html`

## Out of scope
- Options B and C, Colours 1 and 2; a hover tooltip

## Open points
None.
