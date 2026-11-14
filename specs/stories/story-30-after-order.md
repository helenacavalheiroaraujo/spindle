# Story 30 · Next steps after "Order placed"

> Part of the Spindle MVP specification. Build order, out of scope, shared rules and traceability: [`SPEC.md`](../SPEC.md).

**As a buyer who has just paid, I want to see where to go next, so I know where to follow my order.**

## Scope
- The "Order placed" page (story 7) keeps its content and gains two buttons of equal weight: **See my orders** (Your account, Orders tab, story 31) and **Back to the home page** (option A, approved 14 Nov 2026).
- The cart checkout (story 20) also ends on an "Order placed" page, instead of going straight to Your account (option B, approved 14 Nov 2026): a summary on top ("Order placed", "€71.80 paid for 2 records · each seller ships their own") with the same two buttons, then one card per record (title, version, condition, seller, price paid) with its own progress bar (Paid, Shipped, You confirm, Seller paid), as on the Orders tab.
- Only the buyer opens these pages (as story 7).

## Use cases
1. **Buy one record → Pay** → "Order placed" → See my orders → Orders tab, the order first
2. **Cart with two records → Pay** → "Order placed" with both records and the total → Back to the home page

## Acceptance criteria
- [ ] After Pay (one record) the page shows "See my orders" and "Back to the home page", same size and weight
- [ ] After Pay in the cart the "Order placed" page shows the total paid (€71.80 for €28 and €30) and the number of records, the same two buttons, and one card per record with its price paid (€34.90, €36.90) and its progress bar with only Paid done
- [ ] "See my orders" opens the Orders tab; "Back to the home page" opens `/`
- [ ] Another user opening the page is refused, as story 7
- [ ] Loading mask and error screen with "Try again" (Shared rules); 375 px and 1280 px

## Edge cases
- A record of the cart is sold just before Pay → it leaves the cart as story 20; the page lists only the records bought

## Non-functional
- Buttons at least 44 px tall; English text only; simulated payment and illustrative data labelled

## Designs
- Approved 14 Nov 2026, option A (one record): `docs/design/after-order-options.html`
- Approved 14 Nov 2026, option B (several records): `docs/design/order-placed-cart-options.html`

## Out of scope
- Changes to the protection steps or the order statuses

## Open points
None.
