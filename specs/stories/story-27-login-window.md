# Story 27 · Log in without leaving the page

> Part of the Spindle MVP specification. Build order, out of scope, shared rules and traceability: [`SPEC.md`](../SPEC.md).

**As a buyer or seller who is not logged in, I want to log in or create an account in a window on the page I am on, so I do not lose the record I was looking at.**

## Scope
- When a signed-out user taps **Buy**, **Continue to checkout** (after the yellow warning), **Add to cart**, **Sell** or the **Log in** link in the menu, a window opens on top of the current page instead of the separate log-in page (option A, approved 13 Nov 2026)
- The window title says what the user was doing: "Log in to buy", "Log in to add to your cart", "Log in to sell", or just "Log in" from the menu
- With a record (Buy, Continue to checkout, Add to cart): the record summary (title, version, condition, seller, price), Email, Password, "Log in" and "No account? Create one"
- Without a record (Sell, menu): no summary. Sell shows "Selling is free. You need an account."; the menu shows "Welcome back."
- "Create one" swaps the form in the same window to Name, Email, Password and "Create account" (title "Create an account to buy" when there is a record); "Log in" brings the first form back
- After logging in or creating an account, the action goes on as today: checkout for that listing, the record added to the cart, or the sell flow. From the menu the user stays on the page they were on (story 15)
- Phone: the window is a sheet that rises from the bottom; desktop: a centred window

## Use cases
1. **Tap Buy while signed out** → window → log in → checkout for that listing
2. **Tap Add to cart while signed out** → window → create an account → the record is in the cart
3. **Tap Log in in the menu** → window → log in → the user is on the same page, signed in
4. **Close the window** → the page is as it was; nothing bought or added

## Acceptance criteria
- [ ] Buy, Continue to checkout, Add to cart, Sell and the menu "Log in", when signed out, open the window and do not change the page
- [ ] The window shows the right title for the action; with a record it shows the record summary, without one it shows none
- [ ] Log in works as on the log-in page (same rule, same wrong-password message); after it, the original action goes on
- [ ] "Create one" shows the sign-up form in the same window; sign-up uses the same rules as the sign-up page; after it, the original action goes on
- [ ] ×, Esc and a tap on the dimmed area close the window; the page stays as it was and nothing is bought or added
- [ ] Keyboard: focus stays inside the window while it is open and returns to the button that opened it when it closes
- [ ] Loading mask while logging in or signing up; if it fails, the error screen with "Try again", and the typed text is kept (Shared rules)
- [ ] Works at 375 px (sheet from the bottom) and 1280 px (centred window)

## Edge cases
- The record is sold while the window is open → after logging in the user sees "This record is no longer available" (finding #61)
- A seller taps Buy on their own listing → they see "Your listing", as today (finding #12)
- Typing is kept if the user switches between "Log in" and "Create one"
- "Log in" is not shown in the menu on the log-in and sign-up pages (story 19), so the window does not open there

## Non-functional
- Buttons at least 44 px tall; English text only

## Designs
- Approved 13 Nov 2026, option A (log-in, "Create one" and no-record states): `docs/design/login-sheet-options.html`

## Out of scope
- The separate log-in and sign-up pages stay: they are used when the address is opened directly and when a signed-out user opens Your account
- Google and Apple sign-in; "Forgot password"
- Options B and C of the design page were not chosen

## Open points
None.
