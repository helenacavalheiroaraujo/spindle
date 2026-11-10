# Story 22 · Navy header (desktop)

> Part of the Spindle MVP specification. Build order, out of scope, shared rules and traceability: [`SPEC.md`](../SPEC.md).

**As a buyer on a computer, I want the top bar to be dark navy with light text, like the footer, so every page has the same strong frame.**

## Scope
- The top row of the header on desktop (1280 px and wider), on every page: navy background, the same navy as the footer (story 14)
- Dark text and icons in that row become cream: the logo, the menu links, the cart icon, "Log in" and "Sell for free"
- The search moves to a cream strip under the navy row, on every page except the sell pages. Its dark letters stay dark (option B, approved 10 Nov 2026)

## Use cases
1. **Open any page on desktop** → the top row is navy with light text and icons; the search is in the cream strip under it

## Acceptance criteria
- [ ] On desktop, every page (except the sell pages) shows a navy top row with the same navy as the footer
- [ ] No dark text or dark border is left in the top row; every label and icon is readable
- [ ] The search is in a cream strip under the navy row, on every page at 1280 px and wider
- [ ] Links and buttons in the header go where they did before, and keep their keyboard focus ring
- [ ] The search box works as before: typing, the suggestion box and Enter all behave as in story 16 and 17

## Edge cases
- Pages with a loading mask or error screen show the navy header too
- The checkout pages show it too; the sell pages keep their own search and show no search strip

## Non-functional
- Same navy as the footer; English text only

## Designs
- Approved 10 Nov 2026, option B: `docs/design/header-navy-options.html` (the options page; B is the chosen one)

## Out of scope
- The phone header: unchanged (cream, ☰ drawer, logo in the middle)
- Any other colour change; a navy page background; changes to the footer
- Inverting the search box (option A) was not chosen

## Open points
1. Phone: does the phone header stay cream, or become navy too? The request was for the desktop header, so it stays cream until the owner says otherwise.
