# Story 39 · Cancel an order while it is "Paid"

> Part of the Spindle MVP specification. Build order, out of scope, shared rules and traceability: [`SPEC.md`](../SPEC.md).

**As a buyer, I want to cancel an order before the seller ships it, so I can change my mind without having to ask anyone.**

## Scope
- In "Your account → Orders", an order that is "Paid · waiting for the seller" shows a quiet underlined link "Cancel order" under its two buttons (option A, approved 21 Nov 2026).
- Clicking it opens a confirmation box: "Cancel this order?" · "The record goes back on sale and your €[total] is returned." · buttons "Keep order" and "Cancel order".
- "Keep order" closes the box; nothing changes.
- "Cancel order" cancels the order, puts the record back on sale and returns the total (simulated), all at once.
- The cancelled order stays in Orders, greyed, with no progress steps and no buttons: "Cancelled · €[total] returned to you". The page's "Simulated payment · Illustrative data" line stays under the list.
- Cancelled orders sit in their own group, "Cancelled", under "Delivered" (owner's choice, 21 Nov 2026).
- The record shows again in search, on its album page and in the seller's "On sale" tab, and can be bought again.
- Only "Paid" orders can be cancelled. Once the buyer confirms receipt ("Seller paid"), the link is not shown.

## Use cases
1. **Cancel a paid order** → Orders → "Cancel order" → "Cancel order" in the box → the card moves to "Cancelled", greyed, with "Cancelled · €38.90 returned to you"; the record is on sale again
2. **Change your mind** → "Cancel order" → "Keep order" → the box closes, the order is still "Paid"
3. **The order was confirmed in another tab** → "Cancel order" in the box → nothing changes; message "This order can no longer be cancelled." and the card shows its real status

## Acceptance criteria
- [ ] A "Paid" order shows "Cancel order" under its buttons; a "Seller paid" or cancelled order does not
- [ ] "Keep order" closes the box and the order stays "Paid"
- [ ] After cancelling, the card is in the "Cancelled" group, greyed, with "Cancelled · €[total] returned to you", no steps and no buttons
- [ ] After cancelling, the listing is on sale again and can be bought by another buyer
- [ ] An order that is no longer "Paid" cannot be cancelled, even by opening the action directly
- [ ] While cancelling: the shared LoadingMask ("Cancelling…"); if it fails: the shared error with "Try again", and the order is unchanged
- [ ] 375 px and 1280 px

## Edge cases
- The buyer had written to the seller: the cancelled card still shows "You wrote" with the message (owner's choice, 21 Nov 2026). The seller no longer sees it once the record is back on sale, and a new buyer's order never shows it
- The cancelled record was greyed "Sold" in another buyer's cart (story 35): it becomes available again in that cart

## Non-functional
- The link has a tap area of at least 44 px; the box can be used with the keyboard (Esc = "Keep order"); English text only

## Designs
- Approved 21 Nov 2026: `docs/design/user-test-options.html`, part 3, option A, and "After cancelling"

## Out of scope
- Cancelling after "Seller paid"; the seller cancelling; partial refunds; a reason for cancelling; e-mails to the seller or the buyer

## Open points
None.
