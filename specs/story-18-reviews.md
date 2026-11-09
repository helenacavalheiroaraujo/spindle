# Story 18 · Rate the seller

> Part of the Spindle MVP specification. Build order, out of scope, shared rules and traceability: [`SPEC.md`](../SPEC.md).

**As a buyer, I want to rate the seller after my record arrives, so other buyers can trust the sellers they find.**

## Scope
- Right after "Yes, release the money" (story 7 · step 3), the order card asks "How was the seller?": 1 to 5 stars, "Send review" and "Not now"
- A delivered order that has not been rated shows "Rate this seller", so the buyer can answer later
- Only the buyer of an order that is "Seller paid" can rate, once per order
- On listings, the seller line shows the average and the number of reviews, or "No reviews yet"
- Seed reviews are illustrative data and are labelled

## Use cases
1. **Confirm receipt, then rate** → stars chosen, "Send review" → thank-you line; the seller's summary on listings updates
2. **Confirm receipt, "Not now"** → the question closes; "Rate this seller" stays on the delivered order
3. **Open a delivered order that is not rated** → "Rate this seller" → the same question
4. **Look at a listing** → the seller line shows "★ 4.8 · 12 reviews" or "No reviews yet"

## Acceptance criteria
- [ ] After confirming receipt, the buyer is asked to rate the seller; "Send review" stays disabled until a star is chosen
- [ ] After "Send review" the question does not come back; after "Not now" it stays on the delivered order ("Rate this seller") until answered
- [ ] An order can be reviewed once; only the buyer of that order can review, and only once it is "Seller paid"
- [ ] The seller line on listings shows "★ 4.8 · 12 reviews" (average with 1 decimal), "★ 5.0 · 1 review", or "No reviews yet"
- [ ] The average and the count come from one rule, covered by unit tests
- [ ] Loading mask while saving; error screen with "Try again" that keeps the chosen stars

## Edge cases
- Two orders from the same seller: each is rated on its own
- Sellers with a shop name and private sellers are rated the same way
- A failed save does not lose the stars; the buyer can try again

## Data used
- **Review:** order (one review per order), seller, rating 1–5, date. New table `reviews` (migration 0007)
- Seed reviews for a few sellers, labelled as illustrative data

## Non-functional
- Same visual direction as the rest of the app; English text only; the stars always come with a number, never colour or shape alone

## Designs
- `docs/design/review-options.html`: the question **option A** (inside the order card) and the seller line **option B** (own line under the seller), approved 2026-11-09

## Out of scope
- Comments (a later story); reading individual reviews; a public seller page; replies; editing or deleting a review; reporting a review
