# Story 2 · Say what matters to me

> Part of the Spindle MVP specification. Build order, out of scope, shared rules and traceability: [`SPEC.md`](../SPEC.md).


**As a buyer, I want to choose what matters most, so the pick fits me.**

## Scope
- Priorities screen ("What matters most to you?"), opened when the buyer taps an album in the search results
- Four options: **Sound**, **Price**, **Original**, **Condition**, each with a short plain-language line: Sound: "I want the best-sounding one" · Price: "I don't want to overpay" · Original: "I want the first pressing" · Condition: "I want a near-mint copy"
- The buyer picks one or more and **ranks them by tap order**: the first tap is 1, the second is 2, and so on
- Button **"See recommendation"** → story 3

## Use cases
1. **Pick** → the option is marked with its rank number
2. **Unpick** (tap again) → the option is cleared and the remaining numbers close the gap (e.g. 1, 2, 3 → remove 2 → 1, 2)
3. **Continue** → the recommendation (story 3) uses the ranked list
4. **Change** (from the recommendation) → back to this screen with the current ranking filled in

## Phase 2 (with accounts)
- Signed-in buyer: the ranking is **saved to the account**
- Signed-in buyer **with a saved ranking**: the screen is **skipped**; the recommendation shows "Based on: Price, Sound · **Change**"
- Without an account, or without a saved ranking: the screen is always shown

## Acceptance criteria
- [x] Tapping an album in the search results opens this screen
- [x] "See recommendation" is disabled until at least one option is picked
- [x] Each picked option shows its rank number, in tap order
- [x] Unpicking an option renumbers the others without gaps
- [x] All four options can be picked
- [x] The recommendation receives the options in rank order
- [x] *(Phase 2)* A signed-in buyer's ranking is saved and reused on the next album
- [x] *(Phase 2)* With a saved ranking, the screen is skipped and "Change" is shown on the recommendation

## Edge cases
- No option picked → cannot continue
- Buyer unpicks everything → button disabled again
- Saved ranking but this album is different → "Change" on the recommendation

## Data used
- **Priority ranking:** ordered list of up to four of sound, price, original, condition
- *(Phase 2)* **User preferences:** user, ranking

## Non-functional
- Options large enough to tap on a phone
- Rank numbers are not shown by colour alone (accessibility)
