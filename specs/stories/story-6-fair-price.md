# Story 6 · Fair price

> Part of the Spindle MVP specification. Build order, out of scope, shared rules and traceability: [`SPEC.md`](../SPEC.md).


**As a buyer, I want to know if a listing is above or below the usual price.**

## Scope
- Each version has a **typical price range** (e.g. €28–€36), stored as illustrative data that stands for past sales
- Each listing shows a **price label** comparing its price with that range
- Below the list: "Typical price for this pressing: €28–€36"

## Label rule
- **Below typical:** price lower than the bottom of the range
- **Typical:** price within the range, limits included
- **Above typical:** price higher than the top of the range
- A red listing is compared with the typical range of its **actual** version (shared rule).

## Acceptance criteria
- [ ] With a range of €28–€36: €24 → "Below typical"; €28 → "Typical"; €36 → "Typical"; €40 → "Above typical"
- [ ] Every listing in the list (green, yellow and red) shows its label
- [ ] The typical range is shown below the list
- [ ] A version without a range shows no label and no range line

## Edge cases
- Version with no range → no label (never a guess)
- Price exactly on a limit → "Typical"

## Data used
- **Version:** typical price minimum, typical price maximum
- **Listing:** price

## Non-functional
- The label rule lives in one function, covered by unit tests
- Typical ranges are illustrative data

## Moved to story 8
- "Sellers see the typical range when listing" (seller side, phase 3)
