# Story 19 · Menu with chevrons

> Part of the Spindle MVP specification. Build order, out of scope, shared rules and traceability: [`SPEC.md`](../SPEC.md).

**As a buyer or seller, I want one menu that shows where I can go and what is coming, so I can move around without seeing the same link twice.**

## Scope
- Desktop: the header has two rows. Top row: the logo on the left, the menu on the right. Below it: the search, full width. Same height on every page (on pages without a header search the second row stays as empty space)
- Menu cells, left to right: Artists, All genres and formats (illustrative, grey, "Soon"), a divider, Log in (the initials when signed in), Sell for free (an outline). Home is the logo
- Each cell is a link plus a chevron. The chevron opens a small box by hover (desktop), click or Enter. For now every box says there is nothing there yet
- Phone: the ☰ drawer of story 15; each row also has a chevron (48 px) that opens the same message under the row
- It replaces the desktop row under the search box (story 15) and the loose "+ Sell for free" and account badge in the top-right corner (stories 8, 9)

## Use cases
1. **Tap a link** → its page (Sell for free: log in first when signed out, story 8; Log in returns to the current page, story 9)
2. **Hover, click or press Enter on a chevron** → the box opens: "Nothing here yet · More options will appear here in the future." (Artists, All genres and formats: "Coming soon · This will open more options in the future.")
3. **Phone: tap a chevron** → the same message opens under the row

## Acceptance criteria
- [ ] Desktop: logo and menu on the top row (56 px high), the search full width below; the header has the same height on every page
- [ ] No link appears twice on desktop: "Sell for free" once, Log in or the initials once
- [ ] Artists and All genres and formats are grey with "Soon" and their links cannot be tapped; their chevrons open the box
- [ ] The box opens by hover, click, Enter or Space on the chevron; Esc closes it and the focus stays on the chevron; tapping outside closes it; it stays open while the pointer moves onto it
- [ ] Signed out shows "Log in"; signed in shows the initials; "Log in" is not shown on the log-in and sign-up pages (story 9)
- [ ] The chevron is at least 40 px wide on desktop and 48 px on the phone; the focus ring is visible; every cell and chevron works with the keyboard
- [ ] Phone: the drawer keeps story 15's behaviour (a link, Esc, the close button or tapping outside closes it; focus stays inside it); the current page is marked in the drawer

## Edge cases
- Signed out and "Sell for free" → log in first, then back to the sell flow
- A page without a header search keeps the same header height

## Designs
- `docs/design/menu-chevron-c-options.html`, approved 2026-11-10

## Out of scope
- Real content in the boxes; a marker for the current page on desktop; search inside the menu
