# Story 7 · Buy with protection

> Part of the Spindle MVP specification. Build order, out of scope, shared rules and traceability: [`SPEC.md`](../SPEC.md).


**As a buyer, I want my payment held, so I get a refund if the record isn't as listed.**

## Scope
- Checkout screen ("Buy with protection"), opened from **Buy** on a green or yellow listing (story 5); requires login (story 9)
- **Simulated payment**: no money is charged and no card or bank details are asked for (Assignment 1 p. 12)
- After paying, an **order** is created with the status **"Paid · waiting for the seller"**
- The four protection steps are **explained** on the screen; only step 1 works in the MVP

## What the checkout shows
- The record: version, condition, seller ("Shop" / "Private seller"), city
- **Shipping address:** name, street, postcode, city — typed for each order, not saved
- Postcode in another format → "Use the format 0000-000" under the field
- **Payment method:** MB WAY, shown as a label only (no choice)
- **Price breakdown, before paying:** record price + insured shipping **€4.90** + buyer protection **€2.00** = total
- The four steps: 1. You pay Spindle → 2. Seller ships → 3. You confirm it's all good → 4. Seller gets paid
- "What protection covers: pressing check, payment held until delivery, and a refund if the record isn't as listed."
- Line: "Simulated payment · Illustrative data"
- Button: **"Pay €[total]"**

## What the confirmation shows
- Heading "Order placed" and "€[total] paid"
- Status "Paid · waiting for the seller"
- The record: version, condition, seller, city
- The four steps, with step 1 done
- Button "Back to search" → home page
- Line: "Simulated payment · Illustrative data"

## Designs
| Screen | Design |
|---|---|
| Checkout ("Buy with protection") | `Spindle_mockups_by_section.pdf` p. 16 (phone), p. 19 (desktop) |
| Confirmation after Pay | `order-confirmation.html` (phone and desktop; screenshots `order-confirmation-375.png`, `order-confirmation-1280.png`) |

## Use cases
1. **Buy** (green or yellow) → checkout
2. **Pay** → order created, status "Paid · waiting for the seller"; confirmation screen
3. **Yellow listing** → the warning from story 5 is shown before the checkout

## Acceptance criteria
- [ ] The protection fee (€2.00) is shown before paying
- [ ] For a €28 record, the total is €34.90 (28 + 4.90 + 2.00)
- [ ] Pay is disabled until name, street, postcode and city are filled in and the postcode has the format 0000-000
- [ ] After paying, an order exists with the status "Paid · waiting for the seller"
- [ ] After paying, the listing is marked as sold and no longer appears in the listings
- [ ] A sold listing cannot be bought again
- [ ] Red listings cannot reach the checkout
- [ ] No card number or bank details are asked for

## Edge cases
- Listing sold while the buyer is on the checkout → "Sorry, this record was just sold" and no order is created
- Buyer not signed in → login is asked when going to the checkout (Buy on a green listing; "Continue to checkout" after the warning on a yellow one), then the buyer lands on the checkout

## Data used
- **Order:** buyer, listing, record price, shipping, protection fee, total, status, shipping address, date
- **Listing:** status (on sale / sold)

## Non-functional
- Total calculated in one function, covered by unit tests
- Simulated payment clearly labelled

## Phase 4 (if time allows)
- Step 3: the buyer confirms receipt ("I received it, all good") → status "Seller paid"; needs a "My orders" screen

## Out of scope (MVP)
- Real payments and shipping (Assignment 1 p. 12)
- Steps 2 and 4 (seller ships, seller is paid) as working features
- Refunds and disputes
