# Story 9 · Sign up, log in (reviews in phase 4)

> Part of the Spindle MVP specification. Build order, out of scope, shared rules and traceability: [`SPEC.md`](../SPEC.md).


**As a user, I want an account and a public profile, so others can trust me.**

## Scope
- **One account** for buying and selling
- Sign up with **name, email and password**; log in; log out
- Login is asked only when needed: **Buy** (story 7) and **Sell** (story 8); after login the user returns to where they were
- Header: "Log in" when signed out; the user's initials when signed in (as in the designs). Tapping the initials opens **Your account** (name, email, **Log out**)
- On listings, the seller appears as **"Shop"** or **"Private seller"**, with the city

## Use cases
1. **Sign up** → account created, user signed in
2. **Log in** → user signed in
3. **Log out** (from Your account) → user signed out, back to the home page
4. **Buy or Sell without an account** → login / sign-up → Buy goes to the checkout for that listing; Sell goes back to the form

## Acceptance criteria
- [ ] A new user can sign up with name, email and password and is signed in
- [ ] A registered user can log in and log out
- [ ] Signing up with an email already in use shows "This email already has an account"
- [ ] A wrong password shows "That email and password don't match. Check them and try again." (without saying which one; no reset link)
- [ ] Passwords shorter than 8 characters are refused
- [ ] Tapping Buy while signed out opens login and, after login, goes to the checkout for that listing
- [ ] The header shows the user's initials when signed in
- [ ] On listings, sellers with a shop name show "Shop"; others show "Private seller"

## Edge cases
- Email already used → clear message, no second account
- Session expired → asked to log in again at the next Buy / Sell
- User signs up from the Buy button → after sign-up, goes to the checkout for that listing

## Data used
- **User:** name, email, password (handled by Supabase Auth, never stored by the app), city, shop name (optional, filled in when selling — story 8)
- *(Phase 2, story 2)* **User preferences:** user, priority ranking

## Non-functional
- Authentication through Supabase Auth; passwords never stored or logged by the app
- No email confirmation in the MVP, so the demo is not blocked by email delivery

## Out of scope (MVP)
- Public profile page (comes with reviews)
- Reviews (phase 4)
- Separate professional accounts / paid plans for shops (after the MVP; "Spindle Pro", story 11)
- Google and Apple sign-in (Assignment 1 p. 12)
- Password reset
- "I also want to sell records" checkbox and the terms line on sign-up (one account for buying and selling; no terms or privacy pages in the MVP)
