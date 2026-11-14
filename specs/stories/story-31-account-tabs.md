# Story 31 · Your account in tabs

> Part of the Spindle MVP specification. Build order, out of scope, shared rules and traceability: [`SPEC.md`](../SPEC.md).

**As a buyer and seller, I want my account split into clear sections, so I find my orders, my listings and my details quickly.**

## Scope
- Your account opens with a profile header: the large initials avatar (the same as in the header), name and email (option C, approved 14 Nov 2026).
- Under it, underlined tabs with counts: **Orders (n)**, **For sale (n)**, **Account details**. Orders opens by default.
  - Orders: the orders as today (story 7 step 3, story 18 reviews); n = all the buyer's orders
  - For sale: the My listings content of story 8 (its "On sale" and "Sold" lists, edit, remove), with "Sell a record"; n = listings on sale
  - Account details: buying priorities and "Change" (stories 23, 26), change password and saved addresses (bug 9), Log out at the bottom. Name and email are in the header, not here
- Each tab has its own address, so the menu (story 32) and "See my orders" (story 30) open the right one.
- `/my-listings` opens the For sale tab.

## Use cases
1. **Open Your account** → profile header, Orders tab
2. **Tap For sale** → my listings; edit a price as in story 8
3. **Open an old `/my-listings` link** → For sale tab

## Acceptance criteria
- [ ] Profile header with initials, name and email; three tabs with the right counts; Orders opens first
- [ ] Each tab shows the content listed above; nothing that was on the account page is lost
- [ ] Each tab has its own address; reloading keeps the tab
- [ ] `/my-listings` opens the For sale tab
- [ ] Tabs work with the keyboard; the selected tab is underlined and marked for screen readers, not by colour alone
- [ ] Loading mask and error screen with "Try again" per tab (Shared rules); 375 px and 1280 px

## Edge cases
- No orders: "No orders yet" and a link to search; no listings: "Nothing for sale yet" and "Sell a record"
- No saved ranking: the buying priorities section is not shown (story 23)

## Non-functional
- Tap targets at least 44 px; English text only

## Designs
- Approved 14 Nov 2026, option C: `docs/design/account-tabs-options.html`

## Out of scope
- "Forgot password"
- New account features

## Open points
None.
