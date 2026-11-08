# Spindle MVP — Specification

Based on the user stories of Assignment 1 (Product Specification Report).
Stack and hosting: see `DECISIONS.md`. Assignment 1 stated PHP; the MVP uses Next.js (reasons in `DECISIONS.md`).

## Build order
1. **Core:** stories 1, 2, 3, 5, 6
2. **Purchase:** stories 9 (sign-up, log in), 7, 2 (save to account)
3. **Seller:** story 8
4. **If time allows:** story 7 step 3 (confirm receipt), story 4, story 9 (reviews)

Not in this MVP: stories 10, 11

## Out of scope
- Search by artist with an artist page (possible future story)
- New (sealed) records: the MVP lists used records only
- From Assignment 1, p. 12:
  - Real payments and shipping (simulated)
  - Automatic photo and matrix checks (results are mock data)
  - AI-written explanations (fixed text)
  - Google and Apple sign-in
  - Reviews from people who didn't buy
  - Real catalogue data
  - Links to other platforms

## Shared rules
- **Active listing:** a listing on sale (not sold, not removed) that is green or yellow.
- Every count, lowest price, "No listings" label and "has listings" check uses **active listings only**.
- A red listing counts for its **actual** version, not for the version the seller claimed.
- **While loading:** a loading mask covers the area that is loading.
- **If loading or saving fails:** an error screen says what failed, in plain language, with a **"Try again"** button.
- After "Try again", **forms keep what was typed** (e.g. the checkout address, the sell form and its photos).

---

## Stories

In build order. Each story has its own file in `specs/`.

| Story | File |
|---|---|
| Story 1 · Search for an album | [`specs/story-1-search.md`](specs/story-1-search.md) |
| Story 2 · Say what matters to me | [`specs/story-2-priorities.md`](specs/story-2-priorities.md) |
| Story 3 · Get one recommendation | [`specs/story-3-recommendation.md`](specs/story-3-recommendation.md) |
| Story 5 · See verified listings | [`specs/story-5-listings.md`](specs/story-5-listings.md) |
| Story 6 · Fair price | [`specs/story-6-fair-price.md`](specs/story-6-fair-price.md) |
| Story 9 · Sign up, log in (reviews in phase 4) | [`specs/story-9-accounts.md`](specs/story-9-accounts.md) |
| Story 7 · Buy with protection | [`specs/story-7-checkout.md`](specs/story-7-checkout.md) |
| Story 8 · Sell a record for free (phase 3) | [`specs/story-8-sell.md`](specs/story-8-sell.md) |
| Story 4 · Compare versions (phase 4) | [`specs/story-4-compare.md`](specs/story-4-compare.md) |

---

## Traceability

Every requirement maps to at least one feature and one automated test (Class 2, slide 26).

| Story | Requirement | Implemented in | Covered by test |
|---|---|---|---|
| 1 | Search by title or artist from the 3rd character, ignoring case and accents, newest first | `lib/rules/albumSearch.ts`, `app/AlbumSearch.tsx` | `tests/unit/albumSearch.test.ts`, `tests/e2e/search.spec.ts` |
| 1 | Up to 3 suggestions, or "No albums found" | `lib/rules/searchSuggestions.ts` | `tests/unit/searchSuggestions.test.ts`, `tests/e2e/search.spec.ts` |
| 1 | "No listings" from active listings only | `lib/rules/activeListings.ts`, `lib/rules/trafficLight.ts`, `lib/db/albums.ts` | `tests/unit/activeListings.test.ts`, `tests/unit/trafficLight.test.ts`, `tests/e2e/search.spec.ts` |
| 1 | Tap: priorities screen, or "Nobody is selling this album right now"; albums without recommendation data show "Not in the demo" and do not open (finding #50) | `lib/rules/albumAccess.ts`, `lib/db/albums.ts`, `app/AlbumSearch.tsx` | `tests/unit/albumAccess.test.ts`, `tests/e2e/search.spec.ts` |
| 1 | Error screen with "Try again" keeps the typed text (Shared rules) | `components/ErrorScreen.tsx`, `app/AlbumSearch.tsx` | `tests/e2e/search.spec.ts` |
| 2 | Pick by tap order, ranks shown as numbers; unpick closes the gap; all four can be picked | `lib/rules/priorities.ts`, `app/albums/[albumId]/priorities/PriorityPicker.tsx` | `tests/unit/priorities.test.ts`, `tests/e2e/priorities.spec.ts` |
| 2 | "See recommendation" disabled until one option is picked, and again when all are unpicked | `lib/rules/priorities.ts`, `app/albums/[albumId]/priorities/PriorityPicker.tsx` | `tests/unit/priorities.test.ts`, `tests/e2e/priorities.spec.ts` |
| 2 | Tap an album → this screen, with the album and the four options and their lines | `app/albums/[albumId]/priorities/page.tsx`, `lib/db/albums.ts` | `tests/e2e/priorities.spec.ts` |
| 2 | The recommendation receives the ranking in order, in the page address; "Change" refills it | `lib/rules/priorities.ts`, `app/albums/[albumId]/priorities/page.tsx` | `tests/unit/priorities.test.ts`, `tests/e2e/priorities.spec.ts` |
| 2 | Loading mask and error screen with "Try again" (Shared rules) | `app/albums/[albumId]/priorities/loading.tsx`, `app/albums/[albumId]/priorities/error.tsx` | Not tested automatically |
| 3 | One version among those with active listings; weighted total; tie → cheaper; 1. Price, 2. Sound → 2012 Remaster; 1. Price → 1990 Reissue | `lib/rules/recommendation.ts`, `lib/db/recommendation.ts` | `tests/unit/recommendation.test.ts`, `tests/e2e/recommendation.spec.ts` |
| 3 | "Matches" tags for chosen priorities scoring 4 or 5 | `lib/rules/recommendation.ts`, `app/albums/[albumId]/recommendation/page.tsx` | `tests/unit/recommendation.test.ts`, `tests/e2e/recommendation.spec.ts` |
| 3 | Reasons in rank order (max 3), prices from the listings or the typical range | `lib/rules/recommendation.ts`, `app/albums/[albumId]/recommendation/page.tsx` | `tests/unit/recommendation.test.ts`, `tests/e2e/recommendation.spec.ts` |
| 3 | Alternative with a label per 1st priority, only when different | `lib/rules/recommendation.ts`, `app/albums/[albumId]/recommendation/page.tsx` | `tests/unit/recommendation.test.ts`, `tests/e2e/recommendation.spec.ts` |
| 3 | "Ideal but unavailable" note (no listings → price and condition 0) | `lib/rules/recommendation.ts`, `app/albums/[albumId]/recommendation/page.tsx` | `tests/unit/recommendation.test.ts`, `tests/e2e/recommendation.spec.ts` |
| 3 | Glossary terms show their plain explanation | `lib/rules/glossary.ts`, `app/albums/[albumId]/recommendation/GlossaryText.tsx` | `tests/unit/glossary.test.ts`, `tests/e2e/recommendation.spec.ts` |
| 3 | Version details, source line, track list collapsed with "Bonus" | `app/albums/[albumId]/recommendation/page.tsx` | `tests/e2e/recommendation.spec.ts` |
| 3 | "Change" → priorities with the ranking filled in; "See verified listings" on phone only | `app/albums/[albumId]/recommendation/page.tsx` | `tests/e2e/recommendation.spec.ts` |
| 3 | Loading mask and error screen with "Try again" (Shared rules) | `app/albums/[albumId]/recommendation/loading.tsx`, `app/albums/[albumId]/recommendation/error.tsx` | Not tested automatically |
| 5 | Traffic light from the three checklist items: all ✓ → green "Match"; no ✗ and a ? → yellow "Check"; any ✗ → red "No match" | `lib/rules/trafficLight.ts`, `components/TrafficLight.tsx` | `tests/unit/trafficLight.test.ts`, `tests/e2e/listings.spec.ts` |
| 5 | Missing matrix photo → yellow, never green | `lib/rules/trafficLight.ts`, `lib/rules/listingCheck.ts` | `tests/unit/trafficLight.test.ts`, `tests/unit/listingCheck.test.ts`, `tests/e2e/listings.spec.ts` |
| 5 | Green and yellow cheapest first, red last; every light shows its word | `lib/rules/listingOrder.ts`, `components/ListingList.tsx` | `tests/unit/listingOrder.test.ts`, `tests/e2e/listings.spec.ts` |
| 5 | Red: "moved to [version]", "Not for sale here", no Buy; all red → "No listing matches this version yet" | `lib/rules/listingOrder.ts`, `components/ListingList.tsx` | `tests/unit/listingOrder.test.ts`, `tests/e2e/listings.spec.ts` |
| 5 | A red listing also appears under its correct version, yellow, "Moved here · check pending" | `lib/rules/listingOrder.ts`, `lib/rules/listingCheck.ts`, `lib/db/listings.ts` | `tests/unit/listingOrder.test.ts`, `tests/unit/listingCheck.test.ts`, `tests/e2e/listings.spec.ts`, `tests/e2e/listingCheck.spec.ts` |
| 5 | Yellow: Buy first shows what is uncertain, with "Continue to checkout" and "Back", from the list and the check screen | `lib/rules/yellowWarning.ts`, `components/BuyButton.tsx` | `tests/unit/yellowWarning.test.ts`, `tests/e2e/listings.spec.ts`, `tests/e2e/listingCheck.spec.ts` |
| 5 | Listing check screen: summary, checklist, photos (or "No … photo"), condition in plain words; "Buy with protection" for green and yellow only | `lib/rules/listingCheck.ts`, `app/listings/[listingId]/page.tsx` | `tests/unit/listingCheck.test.ts`, `tests/e2e/listingCheck.spec.ts` |
| 5 | Listings on their own screen on phone, beside the recommendation on desktop | `app/versions/[versionId]/listings/page.tsx`, `components/ListingsBeside.tsx`, `app/albums/[albumId]/recommendation/page.tsx` | `tests/e2e/listings.spec.ts` |
| 5 | Desktop: if the listings beside fail, only that area shows the error; "Try again" recovers | `components/ListingsBeside.tsx`, `components/ErrorScreen.tsx` | `tests/e2e/listings.spec.ts` (desktop only) |
| 5 | Loading mask and error screen with "Try again" on the listings and listing check screens (Shared rules) | `app/versions/[versionId]/listings/loading.tsx`, `app/versions/[versionId]/listings/error.tsx`, `app/listings/[listingId]/loading.tsx`, `app/listings/[listingId]/error.tsx` | Not tested automatically |
| 6 | Label rule: below / typical (limits included) / above; €24, €28, €36, €40 with €28–€36 | `lib/rules/fairPrice.ts` | `tests/unit/fairPrice.test.ts` |
| 6 | Every listing (green, yellow and red) shows its label; red uses its actual version's range | `components/ListingList.tsx`, `lib/db/listings.ts` | `tests/unit/fairPrice.test.ts`, `tests/e2e/fairPrice.spec.ts` |
| 6 | "Typical price for this pressing: €min–€max" below the list, on phone and beside the recommendation | `components/ListingList.tsx`, `components/ListingsBeside.tsx` | `tests/e2e/fairPrice.spec.ts` |
| 6 | Version without a range: no label and no range line | `lib/rules/fairPrice.ts`, `components/ListingList.tsx`, `supabase/seed.sql` | `tests/unit/fairPrice.test.ts`, `tests/e2e/fairPrice.spec.ts` |
| 9 | Sign up; log in; wrong password message; log out from Your account; return to where the user was | `lib/rules/signUp.ts`, `lib/rules/login.ts`, `lib/db/session.ts`, `lib/db/profiles.ts` | `tests/unit/signUp.test.ts`, `tests/unit/login.test.ts`, `tests/e2e/signup.spec.ts`, `tests/e2e/login.spec.ts` |
| 9 | Sellers: shop name and "Shop" tag, or "Private seller"; no personal names (finding #64) | `lib/rules/seller.ts`, `lib/db/listings.ts`, `components/SellerLine.tsx` | `tests/unit/seller.test.ts`, `tests/e2e/listings.spec.ts` |
| 9 | Tap Buy while signed out → log in or sign up → checkout for that listing | Built with story 7 | Written with story 7 |
| 9 | Tap Sell while signed out → log in or sign up → back to the sell form | Built with story 8 | Written with story 8 |
| 7 | | | |
| 8 | | | |
| 4 | | | |
