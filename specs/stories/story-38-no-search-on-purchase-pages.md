# Story 38 · No search bar on the purchase and account pages

> Part of the Spindle MVP specification. Build order, out of scope, shared rules and traceability: [`SPEC.md`](../SPEC.md).

**As a buyer who is paying or managing my account, I want no search bar on those pages, so nothing pulls me away from what I am doing.**

## Scope
- No header search, and no cream strip on desktop, on: the cart, the checkout of one record, the checkout of the cart, and every tab of "Your account" (owner's decision, 21 Nov 2026).
- Pages where the buyer looks for records keep the search; the sell pages already have none (story 8).
- This replaces the empty strip left on the checkout pages by bug 31. On these pages the header is only the navy row (56 px), so story 19's "same header height on every page" no longer holds for them.

## Use cases
1. **Open the cart or a checkout on desktop** → navy row only, no search strip
2. **Open "Your account" (any tab)** → the same
3. **Open the home page, a results page, an album or a genre** → the search strip is there as before

## Acceptance criteria
- [ ] At 1280 px, /cart, /cart/checkout, /checkout/[id] and the three account tabs show no search box and no cream strip
- [ ] At 1280 px, home, search results, album, genre, versions and listing pages still show the strip with the search
- [ ] Which pages have the search is decided by one rule (a pure function), tested with a decision table
- [ ] 375 px and 1280 px

## Non-functional
- English text only

## Designs
- No new screen: the strip is only removed (owner confirmed, 21 Nov 2026)

## Out of scope
- Search on the phone (it lives on the page, not in the header, and is unchanged)

## Open points
None.
