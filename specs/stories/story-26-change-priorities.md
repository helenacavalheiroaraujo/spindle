# Story 26 · Change buying priorities

> Part of the Spindle MVP specification. Build order, out of scope, shared rules and traceability: [`SPEC.md`](../SPEC.md).

**As a buyer with a saved buying order, I want to change it from my account, so that my recommendations follow what matters to me now.**

## Scope
- Your account: the "Buying priorities" section (story 23) has a "Change" button, shown when there is a saved order (design option B).
- "Change" shows the four options in the saved order. Each row has up and down arrows that move it one place. The fourth option, if not yet in the order, is added from the line "Add a fourth option", at the end of the order.
- "Save my order" saves the new order and replaces the saved one (story 2 · finding #11). "Cancel" keeps the saved order as it was.
- Works on phone and desktop.

## Use cases
1. **Account → Buying priorities → Change → move Sound up → Save my order** → the account shows the new order, and the next recommendation uses it.

## Acceptance criteria
- [ ] Signed in with a saved order: the account page shows "Change" in the Buying priorities section
- [ ] The arrows move a row one place up or down; the top row has no up arrow and the bottom row has no down arrow
- [ ] "Add a fourth option" adds the missing option at the end of the order
- [ ] "Save my order" replaces the saved order; the next recommendation uses it
- [ ] "Cancel" keeps the saved order as it was
- [ ] Checked at 375 px and 1280 px

## Out of scope
- Changing the order from the recommendation page (story 3 "Change" stays as it is)
- Signed-out buyers (story 2: nothing is saved)
- Showing the section to a buyer with no saved order (story 23 hides it; not changed here)

## Designs
- Option B (move rows up and down): `docs/design/account-change-priorities-options.html`, chosen by the owner on 11 Nov 2026.
