# Story 14 · Desktop footer

> Part of the Spindle MVP specification. Build order, out of scope, shared rules and traceability: [`SPEC.md`](../SPEC.md).

**As a buyer on a computer, I want a footer at the bottom of every page, so I can always find the basics about Spindle and move on without scrolling back to the top.**

## Scope
- A footer at the bottom of every page, **desktop only** (1280 px and wider); no footer on phone
- Content: the Spindle name, a one-line description, and a note that all catalogue data is illustrative
- Links: *(to decide, see open points)*

## Use cases
1. **Scroll to the bottom** on any page → the footer is there
2. **Tap a footer link** → opens that page

## Acceptance criteria
- [ ] On desktop, every page shows the footer after the main content, never covering it
- [ ] On a short page the footer sits at the bottom of the window, not in the middle
- [ ] On phone, the footer is not shown
- [ ] The footer shows the Spindle name and the line "All catalogue data is illustrative"
- [ ] Every link in the footer opens a page that exists

## Edge cases
- Pages with a loading mask or error screen still show the footer
- The checkout and sell forms show it too, and it never pushes a button out of reach

## Non-functional
- Same visual direction as the rest of the app (cream, navy, thin borders); English text only

## Designs
- *Missing. Needs an approved design before the story starts (CLAUDE.md, step 1b).*

## Out of scope
- Footer on phone; newsletter sign-up; social media links

## Open points
1. Which links, if any? Nothing in SPEC.md defines them (no About, Terms or Contact pages).
