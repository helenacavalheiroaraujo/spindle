# Story 32 · Account button and menu

> Part of the Spindle MVP specification. Build order, out of scope, shared rules and traceability: [`SPEC.md`](../SPEC.md).

**As a signed-in user, I want the account corner to look like a button and open a short menu, so I can reach my orders, listings, details or log out from any page.**

## Scope
- Signed in, the account corner of the header is an outlined pill: initials, first name (desktop only) and ▾ (option C, approved 14 Nov 2026). Signed out it still reads "Log in".
- Tapping it opens a small card under it, on both sizes (option A, approved 14 Nov 2026): name and email, then **Orders**, **For sale**, **Account details** (the tabs of story 31) and **Log out**.
- The card closes with Esc, a tap outside or a choice.
- Log out: the user stays on the page they were on; on a page that needs an account, they go to the home page.
- The first name is the first word of the name given at sign-up.

## Use cases
1. **Tap the pill → For sale** → Your account, For sale tab
2. **Tap the pill → Log out** on an album page → same album page, signed out

## Acceptance criteria
- [ ] Desktop: pill with initials, first name and ▾ on the navy row; phone: initials and ▾
- [ ] The card shows name, email, the three links and Log out; each link opens its tab
- [ ] Esc, a tap outside or a choice close the card; focus returns to the pill; keyboard can reach every item
- [ ] Log out keeps the user on the page, or sends them home from a page that needs an account
- [ ] 375 px and 1280 px

## Edge cases
- A long first name is cut with "…" so the header keeps its height (story 19)

## Non-functional
- Pill and rows at least 44 px tall; English text only

## Designs
- Approved 14 Nov 2026: `docs/design/account-icon-options.html` (option C), `docs/design/account-flyout-options.html` (option A)

## Out of scope
- The phone drawer of stories 15 and 19 (its "Your account" row stays)

## Open points
None.
