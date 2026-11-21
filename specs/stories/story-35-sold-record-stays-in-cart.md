# Story 35 · A sold record stays in the cart until the buyer removes it

> Part of the Spindle MVP specification. Build order, out of scope, shared rules and traceability: [`SPEC.md`](../SPEC.md).

**As a buyer, I want a record that was sold to someone else to stay in my cart, greyed out, so I understand what happened and decide when to remove it.**

## Scope
- A record in the cart that can no longer be bought (sold to someone else, removed by its seller) stays in the list, greyed, with a "Sold" tag ("No longer available" if the seller removed it) and its "Remove" button (option A, approved 21 Nov 2026).
- A message above the list names it: "“[title]” was sold to someone else. Remove it to go to checkout." It stays while the record is in the cart.
- The summary and the cart count only include the records that can still be bought.
- "Go to checkout" is greyed and cannot be used while any record is unavailable, with the line "Remove the sold record to continue." under it.
- This replaces the story 20 rule "it leaves the cart with a message and the total is recalculated" (use case 5 and its criterion); the story 20 file is not changed.

## Use cases
1. **A record is sold while it is in the cart** → the buyer opens the cart → the record is greyed with "Sold", the message is shown, the total counts only the other record(s), "Go to checkout" is greyed
2. **Remove the sold record** → it leaves the cart, the message goes, "Go to checkout" works again
3. **A record is sold while the buyer is paying** → nothing is paid; the buyer goes back to the cart and sees case 1

## Acceptance criteria
- [ ] An unavailable record stays in the cart, greyed, with its tag and "Remove"
- [ ] The message names the record, and stays until it is removed
- [ ] The total and the header count do not include unavailable records
- [ ] "Go to checkout" is greyed and cannot be used while any record is unavailable; the opened address /cart/checkout sends the buyer back to the cart
- [ ] Removing the unavailable record enables "Go to checkout" again
- [ ] A cart with only unavailable records: "Go to checkout" greyed, total €0.00
- [ ] The header count is right after the sale, without reloading the page (bug 33)
- [ ] 375 px and 1280 px

## Edge cases
- Two records sold: one message each
- The seller removed it: tag "No longer available", message "“[title]” is no longer available. Remove it to go to checkout."

## Non-functional
- Remove button at least 44 px tall; English text only

## Designs
- Approved 21 Nov 2026: `docs/design/user-test-options.html`, part 1, option A

## Out of scope
- Reserving a record while it is in the cart; a cart for signed-out users (next delivery)

## Open points
None.
