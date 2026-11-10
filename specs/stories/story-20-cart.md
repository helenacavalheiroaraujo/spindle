# Story 20 · Cart

> Part of the Spindle MVP specification. Build order, out of scope, shared rules and traceability: [`SPEC.md`](../SPEC.md).

**As a buyer, I want to put several records in a cart and pay for them together, so I do not have to check out one record at a time.**

## Scope
- "Add to cart" on green and yellow listings, next to "Buy" (story 5). "Buy" still goes straight to the checkout of one record
- The cart belongs to the account: adding requires login (story 9)
- Records from several sellers can be in the same cart
- A "Cart" cell in the menu, with the number of records (stories 15 and 19, desktop and phone drawer)
- A cart screen with the records, their prices, the total and "Go to checkout"
- One checkout for the whole cart (story 7's checkout, extended): the address is typed once; Pay creates one order for each record

## What the cart shows
- Each record: version, condition, seller ("Shop" / "Private seller"), city, price, "Remove"
- Total: for each record, price + insured shipping €4.90 + buyer protection €2.00, added up
- Button "Go to checkout"
- Line: "Simulated payment · Illustrative data"
- Empty cart: "Your cart is empty" with a link to search

## Designs
| Screen | Design |
|---|---|
| "Add to cart" next to "Buy" | `docs/design/cart-options.html`, part 1, option B: "Buy" is the only button; "Add to cart" is a text link with a cart icon under it (the link is 48 px high, like a button). After adding: "Added to your cart" with "View cart". Already in the cart: "In your cart · View cart". Signed out: "Log in to add this record to your cart" |
| "Cart" in the menu | Part 2, option A: a cart icon with the number of records at the right of the header (phone and desktop), and a "Cart" cell with the icon and the number in the drawer. Empty cart: no number |
| Cart screen | Part 3, option A: the records as rows with "Remove", then a sand summary card (records, shipping, protection, total) and "Go to checkout". Empty cart: "Your cart is empty" and a link to search. On desktop the summary sits beside the list |

## Use cases
1. **Add to cart** on a green or yellow listing → the record is in the cart; signed out → log in first, then the record is added
2. **Open the cart** from the menu → the records, the total, "Remove" on each, "Go to checkout"
3. **Remove** a record → it leaves the cart and the total is recalculated
4. **Go to checkout** → address typed once, then **Pay €[total]** → one order per record, each "Paid · waiting for the seller"; the listings are marked sold
5. **A record sold to someone else while in the cart** → it leaves the cart with a message and the total is recalculated

## Acceptance criteria
- [ ] A red or sold listing cannot be added to the cart
- [ ] A signed-in seller cannot add their own listing (finding #12)
- [ ] The same listing cannot be in the cart twice
- [ ] Signed out, "Add to cart" asks to log in and then adds the record
- [ ] The cart total is calculated in one function, covered by unit tests
- [ ] For one €28 record the total is €34.90; for €28 and €30 it is €34.90 + €36.90 = €71.80
- [ ] Removing a record updates the total
- [ ] The menu shows the number of records in the cart
- [ ] A record sold while in the cart leaves the cart with a message, and the total is recalculated
- [ ] After paying, there is one order for each record, each with the status "Paid · waiting for the seller", and "Your account" shows them like any other order (story 7)
- [ ] Loading mask and error screen with "Try again"; the checkout keeps the typed address (Shared rules)
- [ ] No card number or bank details are asked for

## Edge cases
- A record is sold between opening the checkout and paying → nothing is paid, the record leaves the cart with a message (as in story 7)
- Empty cart → "Your cart is empty" and a link to search

## Data used
- **Cart item:** buyer, listing, date added
- **Order, listing:** as in story 7

## Non-functional
- Total calculated in one function, in `lib/rules/`; database access in `lib/db/`

## Out of scope
- Reserving a record while it is in the cart; coupons or discounts; a cart for signed-out users; real payments and shipping
