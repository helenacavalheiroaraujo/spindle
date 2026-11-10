# Story 15 · Menu

> Part of the Spindle MVP specification. Build order, out of scope, shared rules and traceability: [`SPEC.md`](../SPEC.md).

**As a buyer or seller, I want a menu with the main places of the app, so I can move around without going back to the home page.**

## Scope
- A menu with: Home, Sell, and Your account (Log in if signed out), plus two illustrative future features: **Artists** and **All genres and formats**
- On desktop: a row of links under the search box. On phone: a ☰ button (top left) that opens a side drawer
- It replaces the loose "+ Sell" and account links that sit in the header today

## Use cases
1. **Tap Home** → home page
2. **Tap Sell** → sell flow (log in first if signed out, story 8)
3. **Tap Your account / Log in** → account page or login (story 9)
4. **Open and close the menu on phone** → the list appears and disappears; tapping a link closes it

## Acceptance criteria
- [ ] The menu appears on every page and shows the same items everywhere
- [ ] Home, Sell and Your account open the right page; the current page is marked
- [ ] Artists and All genres and formats show "Coming soon" and cannot be tapped
- [ ] Signed out shows "Log in"; signed in shows "Your account"
- [ ] On phone the menu opens and closes, and the buttons are large enough to tap
- [ ] The menu can be used with the keyboard

## Edge cases
- Signed out and "Sell" → login first, then back to the sell flow

## Designs
- `docs/design/menu-options.html`: desktop row, phone **option B** (side drawer), approved 2026-11-09

## Out of scope
- Search inside the menu (the header search stays as in story 12); categories and genres in the menu
