# Story 29 · A larger log-in window, used for every log-in

> Part of the Spindle MVP specification. Build order, out of scope, shared rules and traceability: [`SPEC.md`](../SPEC.md).

**As a buyer or seller who is not logged in, I want one clear log-in window, wherever I need an account, so I always know what I am logging in for.**

## Scope
- The log-in window of story 27 gets two panels (option B, approved 14 Nov 2026): the record on the left, the form on the right. Titles, fields and texts of story 27 stay.
- With a record (Buy, Continue to checkout, Add to cart): the left panel shows the cover, title, version · condition, seller, price and "Spindle holds your payment until you confirm it's all good."
- Without a record (menu "Log in", Sell, the cart icon): the left panel shows "The right pressing, a verified copy." and three lines: "We tell you which version to buy", "Every copy is checked against it", "Spindle holds your payment until you confirm it's all good" (B1). The window keeps the same size in every case.
- Desktop: a centred window with both panels. Phone: the window fills the screen, the record panel above the form.
- The separate log-in and sign-up pages stop appearing (decision 2026-11-14, point 6). Every log-in opens this window:
  - a page that needs an account (checkout, cart checkout, cart, sell, Your account), opened by its address while signed out, shows only the header, with the rest of the page empty and the window on top (option C, approved 14 Nov 2026); after logging in, the page loads with its content
  - `/login` opens the home page with the window in the log-in state; `/signup` the same in the "Create one" state
  - if the session ends during a checkout, the window opens on top of the checkout and the typed address is kept
- Closing the window on a page that needs an account goes to the previous page, or to the home page if there is none.

## Use cases
1. **Tap Buy while signed out** → two-panel window with the record → log in → checkout
2. **Tap Log in in the menu** → window with the three lines on the left → log in → same page
3. **Open `/sell` from a bookmark while signed out** → header only, "Log in to sell" on top → log in → sell flow
4. **Open `/login`** → home page with the window

## Acceptance criteria
- [ ] Desktop 1280 px: two panels side by side; phone 375 px: full screen, record panel above the form
- [ ] With a record the left panel shows cover, title, version · condition, seller, price and the protection line; without one it shows the heading and the three lines; the window is the same size in both cases
- [ ] No address shows the old log-in or sign-up page: `/login` and `/signup` open the home page with the window in the right state
- [ ] Checkout, cart checkout, cart, sell and Your account, opened signed out, show only the header and the window; after logging in the page shows its content; closing goes back (or home)
- [ ] Session ended during a checkout: the window opens and the address typed is kept after logging in
- [ ] Everything else as story 27: titles, rules, messages, closing with ×, Esc and the dimmed area, focus kept inside, loading mask and error screen with "Try again"

## Edge cases
- The record is sold while the window is open → "This record is no longer available" (finding #61), as story 27
- A link to `/login?next=…` from before this story still lands on the right page after logging in

## Non-functional
- Buttons at least 44 px tall; English text only

## Designs
- Approved 14 Nov 2026, option B and B1: `docs/design/login-window-size-options.html`
- Approved 14 Nov 2026, option C (header only under the window): `docs/design/login-empty-page-options.html`

## Out of scope
- Google and Apple sign-in; "Forgot password"
- The cart icon title (bug 32)

## Open points
None.
