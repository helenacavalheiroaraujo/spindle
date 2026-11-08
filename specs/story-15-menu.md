# Story 15 · Menu

> Part of the Spindle MVP specification. Build order, out of scope, shared rules and traceability: [`SPEC.md`](../SPEC.md).

**As a buyer or seller, I want a menu with the main places of the app, so I can move around without going back to the home page.**

## Scope
- A menu in the header with: Home, Sell, and Your account (Log in if signed out)
- On desktop: links in the header. On phone: a menu button that opens the list. *(to decide, see open points)*
- It replaces the loose "+ Sell" and account links that sit in the header today

## Use cases
1. **Tap Home** → home page
2. **Tap Sell** → sell flow (log in first if signed out, story 8)
3. **Tap Your account / Log in** → account page or login (story 9)
4. **Open and close the menu on phone** → the list appears and disappears; tapping a link closes it

## Acceptance criteria
- [ ] The menu appears on every page and shows the same items everywhere
- [ ] Each item opens the right page; the current page is marked
- [ ] Signed out shows "Log in"; signed in shows "Your account"
- [ ] On phone the menu opens and closes, and the buttons are large enough to tap
- [ ] The menu can be used with the keyboard

## Edge cases
- Signed out and "Sell" → login first, then back to the sell flow

## Designs
- *Missing. Needs an approved design before the story starts (CLAUDE.md, step 1b).*

## Out of scope
- Search inside the menu (the header search stays as in story 12); categories and genres in the menu

## Open points
1. Desktop only, or phone as well?
2. Which items? Home, Sell and Your account are the minimum that exists today.
