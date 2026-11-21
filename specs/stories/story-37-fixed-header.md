# Story 37 · The header stays on screen while scrolling (desktop)

> Part of the Spindle MVP specification. Build order, out of scope, shared rules and traceability: [`SPEC.md`](../SPEC.md).

**As a buyer on a computer, I want the header to stay at the top while I scroll, so the menu, the cart and the search are always within reach.**

## Scope
- On desktop (1024 px and wider) the navy top row and the cream search strip stay fixed at the top of the window while the page scrolls (owner's decision, 21 Nov 2026).
- Where a page has no search strip (story 38), only the navy row stays.
- Phone (under 1024 px): unchanged; the header scrolls with the page (DECISIONS 2026-11-14).

## Use cases
1. **Scroll down any page on desktop** → the navy row and the search strip stay visible
2. **Click a link to a part of the page (#week, #checklist, …)** → the target is not hidden behind the header
3. **Open the log-in window while scrolled** → the window and its dim background cover the header
4. **Open the suggestion box or the account menu from the fixed header** → they show over the page

## Acceptance criteria
- [ ] At 1280 px, after scrolling 600 px, the navy row and the search strip are still at the top of the window
- [ ] At 375 px, after scrolling, the header is not on screen (unchanged)
- [ ] Content is not hidden behind the header: the first line of the page is visible at the top, and a page anchor lands below the header
- [ ] The log-in window and its dim background cover the header
- [ ] The suggestion box and the account menu open over the page from the fixed header

## Non-functional
- Same navy, same heights (56 px + 64 px); English text only

## Designs
- No new screen: the header of stories 19 and 22 does not change; it only stays in place (owner confirmed, 21 Nov 2026)

## Out of scope
- Hiding the header on scroll down; a smaller header while scrolling; the phone header

## Open points
None.
