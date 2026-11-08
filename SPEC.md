# Spindle MVP — Specification

Based on the user stories of Assignment 1 (Product Specification Report).
Stack and hosting: see `DECISIONS.md`. Assignment 1 stated PHP; the MVP uses Next.js (reasons in `DECISIONS.md`).

## Build order
1. **Core:** stories 1, 2, 3, 5, 6, 12
2. **Purchase:** stories 9 (sign-up, log in), 7, 2 (save to account)
3. **Seller:** story 8
4. **If time allows:** story 7 step 3 (confirm receipt), story 17 (results page), story 4, story 9 (reviews). **Only if time is left, in this order:** story 16 (suggestions; opens story 17), story 15 (menu)

Not in this MVP: stories 10, 11, 13, 14

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
| Story 12 · Home page | [`specs/story-12-home.md`](specs/story-12-home.md) |
| Story 14 · Desktop footer | [`specs/story-14-footer.md`](specs/story-14-footer.md) |
| Story 17 · Search results page | [`specs/story-17-results.md`](specs/story-17-results.md) |
| Story 16 · Search suggestions | [`specs/story-16-suggestions.md`](specs/story-16-suggestions.md) |
| Story 15 · Menu | [`specs/story-15-menu.md`](specs/story-15-menu.md) |

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
| 2 | *(Phase 2)* Signed in: "See recommendation" saves the ranking to the account, replacing any saved one (finding #11); signed out: nothing is saved | `lib/db/preferences.ts`, `app/actions.ts`, `app/albums/[albumId]/priorities/PriorityPicker.tsx`, `supabase/migrations/0004_preferences.sql` | `tests/e2e/savedPriorities.spec.ts` |
| 2 | *(Phase 2)* Signed in with a saved ranking: the screen is skipped on the next album and the recommendation shows "Based on: … · Change"; "Change" still opens the screen | `app/albums/[albumId]/priorities/page.tsx`, `lib/db/preferences.ts` | `tests/e2e/savedPriorities.spec.ts` |
| 2 | Loading mask and error screen with "Try again" (Shared rules) | `app/albums/[albumId]/priorities/loading.tsx`, `app/albums/[albumId]/priorities/error.tsx` | Not tested automatically: manual test M1 (`docs/manual-tests.md`) |
| 3 | One version among those with active listings; weighted total; tie → cheaper; 1. Price, 2. Sound → 2012 Remaster; 1. Price → 1990 Reissue | `lib/rules/recommendation.ts`, `lib/db/recommendation.ts` | `tests/unit/recommendation.test.ts`, `tests/e2e/recommendation.spec.ts` |
| 3 | "Matches" tags for chosen priorities scoring 4 or 5 | `lib/rules/recommendation.ts`, `app/albums/[albumId]/recommendation/page.tsx` | `tests/unit/recommendation.test.ts`, `tests/e2e/recommendation.spec.ts` |
| 3 | Reasons in rank order (max 3), prices from the listings or the typical range | `lib/rules/recommendation.ts`, `app/albums/[albumId]/recommendation/page.tsx` | `tests/unit/recommendation.test.ts`, `tests/e2e/recommendation.spec.ts` |
| 3 | Alternative with a label per 1st priority, only when different | `lib/rules/recommendation.ts`, `app/albums/[albumId]/recommendation/page.tsx` | `tests/unit/recommendation.test.ts`, `tests/e2e/recommendation.spec.ts` |
| 3 | "Ideal but unavailable" note (no listings → price and condition 0) | `lib/rules/recommendation.ts`, `app/albums/[albumId]/recommendation/page.tsx` | `tests/unit/recommendation.test.ts`, `tests/e2e/recommendation.spec.ts` |
| 3 | Glossary terms show their plain explanation | `lib/rules/glossary.ts`, `app/albums/[albumId]/recommendation/GlossaryText.tsx` | `tests/unit/glossary.test.ts`, `tests/e2e/recommendation.spec.ts` |
| 3 | Version details, source line, track list collapsed with "Bonus" | `app/albums/[albumId]/recommendation/page.tsx` | `tests/e2e/recommendation.spec.ts` |
| 3 | "Change" → priorities with the ranking filled in; "See verified listings" on phone only | `app/albums/[albumId]/recommendation/page.tsx` | `tests/e2e/recommendation.spec.ts` |
| 3 | Loading mask and error screen with "Try again" (Shared rules) | `app/albums/[albumId]/recommendation/loading.tsx`, `app/albums/[albumId]/recommendation/error.tsx` | Not tested automatically: manual test M2 (`docs/manual-tests.md`) |
| 5 | Traffic light from the three checklist items: all ✓ → green "Match"; no ✗ and a ? → yellow "Check"; any ✗ → red "No match" | `lib/rules/trafficLight.ts`, `components/TrafficLight.tsx` | `tests/unit/trafficLight.test.ts`, `tests/e2e/listings.spec.ts` |
| 5 | Missing matrix photo → yellow, never green | `lib/rules/trafficLight.ts`, `lib/rules/listingCheck.ts` | `tests/unit/trafficLight.test.ts`, `tests/unit/listingCheck.test.ts`, `tests/e2e/listings.spec.ts` |
| 5 | Green and yellow cheapest first, red last; every light shows its word | `lib/rules/listingOrder.ts`, `components/ListingList.tsx` | `tests/unit/listingOrder.test.ts`, `tests/e2e/listings.spec.ts` |
| 5 | Red: "moved to [version]", "Not for sale here", no Buy; all red → "No listing matches this version yet" | `lib/rules/listingOrder.ts`, `components/ListingList.tsx` | `tests/unit/listingOrder.test.ts`, `tests/e2e/listings.spec.ts` |
| 5 | A red listing also appears under its correct version, yellow, "Moved here · check pending" | `lib/rules/listingOrder.ts`, `lib/rules/listingCheck.ts`, `lib/db/listings.ts` | `tests/unit/listingOrder.test.ts`, `tests/unit/listingCheck.test.ts`, `tests/e2e/listings.spec.ts`, `tests/e2e/listingCheck.spec.ts` |
| 5 | Yellow: Buy first shows what is uncertain, with "Continue to checkout" and "Back", from the list and the check screen | `lib/rules/yellowWarning.ts`, `components/BuyButton.tsx` | `tests/unit/yellowWarning.test.ts`, `tests/e2e/listings.spec.ts`, `tests/e2e/listingCheck.spec.ts` |
| 5 | Listing check screen: summary, checklist, photos (or "No … photo"), condition in plain words; "Buy with protection" for green and yellow only | `lib/rules/listingCheck.ts`, `app/listings/[listingId]/page.tsx` | `tests/unit/listingCheck.test.ts`, `tests/e2e/listingCheck.spec.ts` |
| 5 | Listings on their own screen on phone, beside the recommendation on desktop | `app/versions/[versionId]/listings/page.tsx`, `components/ListingsBeside.tsx`, `app/albums/[albumId]/recommendation/page.tsx` | `tests/e2e/listings.spec.ts` |
| 5 | Desktop: if the listings beside fail, only that area shows the error; "Try again" recovers | `components/ListingsBeside.tsx`, `components/ErrorScreen.tsx` | `tests/e2e/listings.spec.ts` (desktop only) |
| 5 | Loading mask and error screen with "Try again" on the listings and listing check screens (Shared rules) | `app/versions/[versionId]/listings/loading.tsx`, `app/versions/[versionId]/listings/error.tsx`, `app/listings/[listingId]/loading.tsx`, `app/listings/[listingId]/error.tsx` | Not tested automatically: manual tests M3, M4 (`docs/manual-tests.md`) |
| 6 | Label rule: below / typical (limits included) / above; €24, €28, €36, €40 with €28–€36 | `lib/rules/fairPrice.ts` | `tests/unit/fairPrice.test.ts` |
| 6 | Every listing (green, yellow and red) shows its label; red uses its actual version's range | `components/ListingList.tsx`, `lib/db/listings.ts` | `tests/unit/fairPrice.test.ts`, `tests/e2e/fairPrice.spec.ts` |
| 6 | "Typical price for this pressing: €min–€max" below the list, on phone and beside the recommendation | `components/ListingList.tsx`, `components/ListingsBeside.tsx` | `tests/e2e/fairPrice.spec.ts` |
| 6 | Version without a range: no label and no range line | `lib/rules/fairPrice.ts`, `components/ListingList.tsx`, `supabase/seed.sql` | `tests/unit/fairPrice.test.ts`, `tests/e2e/fairPrice.spec.ts` |
| 9 | Sign up; log in; wrong password message; log out from Your account; return to where the user was | `lib/rules/signUp.ts`, `lib/rules/login.ts`, `lib/db/session.ts`, `lib/db/profiles.ts` | `tests/unit/signUp.test.ts`, `tests/unit/login.test.ts`, `tests/e2e/signup.spec.ts`, `tests/e2e/login.spec.ts` |
| 9 | Sellers: shop name and "Shop" tag, or "Private seller"; no personal names (finding #64) | `lib/rules/seller.ts`, `lib/db/listings.ts`, `components/SellerLine.tsx` | `tests/unit/seller.test.ts`, `tests/e2e/listings.spec.ts` |
| 9 | Tap Buy while signed out → log in or sign up → checkout for that listing | `app/checkout/[listingId]/page.tsx`, `lib/rules/checkoutAccess.ts`, `lib/rules/login.ts` | `tests/e2e/checkout.spec.ts` |
| 9 | Tap Sell while signed out → log in or sign up → back to the sell flow | `components/AccountBadge.tsx`, `app/sell/page.tsx`, `lib/rules/login.ts` | `tests/e2e/sell.spec.ts` |
| 7 | Checkout shows the record, address, MB WAY label, price breakdown, steps and "Pay €[total]"; total €34.90 for a €28 record | `lib/rules/checkoutTotal.ts`, `app/checkout/[listingId]/page.tsx`, `app/checkout/[listingId]/CheckoutForm.tsx` | `tests/unit/checkoutTotal.test.ts`, `tests/e2e/checkout.spec.ts` |
| 7 | Pay disabled until the address is complete; postcode "0000-000" | `lib/rules/shippingAddress.ts`, `app/checkout/[listingId]/CheckoutForm.tsx` | `tests/unit/shippingAddress.test.ts`, `tests/e2e/checkout.spec.ts` |
| 7 | Pay creates the order "Paid · waiting for the seller" and marks the listing sold; a sold listing cannot be bought again | `app/checkout/[listingId]/actions.ts`, `lib/db/orders.ts`, `supabase/migrations/0002_orders.sql` | `tests/e2e/checkout.spec.ts` |
| 7 | Red or sold listings never reach the checkout; signed out → login first | `lib/rules/checkoutAccess.ts`, `app/checkout/[listingId]/page.tsx` | `tests/unit/checkoutAccess.test.ts`, `tests/e2e/checkout.spec.ts` |
| 7 | Sold while on the checkout → "Sorry, this record was just sold", no order | `app/checkout/[listingId]/actions.ts`, `app/checkout/[listingId]/CheckoutForm.tsx` | `tests/e2e/checkout.spec.ts` |
| 7 | No card or bank details | `app/checkout/[listingId]/CheckoutForm.tsx` | `tests/e2e/checkout.spec.ts` |
| 7 | Confirmation: "Order placed", total, status, record, steps with 1 done, "Back to search"; only the buyer opens it | `app/orders/[id]/page.tsx`, `lib/db/orders.ts` | `tests/e2e/checkout.spec.ts` |
| 7 | Loading mask and error screen on the checkout and the confirmation (Shared rules) | `app/checkout/[listingId]/loading.tsx`, `app/checkout/[listingId]/error.tsx`, `app/orders/[id]/loading.tsx`, `app/orders/[id]/error.tsx` | Not tested automatically: manual tests M5, M6 (`docs/manual-tests.md`) |
| 7 | Step 3 (phase 4): orders show on Your account, "On its way" with four steps (only Paid done), then "Delivered" once confirmed; no "Report a problem" | `lib/rules/orderProgress.ts`, `app/account/page.tsx`, `app/account/OrderCard.tsx`, `lib/db/orders.ts` | `tests/unit/orderProgress.test.ts`, `tests/e2e/confirmReceipt.spec.ts` |
| 7 | Step 3: "It arrived, all good" → "Are you sure? The money is released to the seller." → order becomes "Seller paid"; only the buyer, only once | `app/account/actions.ts`, `app/account/OrderCard.tsx`, `lib/db/orders.ts` (`confirmReceipt`) | `tests/unit/orderProgress.test.ts`, `tests/e2e/confirmReceipt.spec.ts` |
| 7 | Step 3: "Confirming…" mask and an error screen with "Try again" on the card; Your account loading mask and error screen | `app/account/OrderCard.tsx`, `app/account/loading.tsx`, `app/account/error.tsx` | `tests/e2e/confirmReceipt.spec.ts` (the card); Not tested automatically for the whole page: manual test M13 (`docs/manual-tests.md`) |
| 5, 7 | Finding #61: a sold or removed listing opened from a link says "This record is no longer available" with "Back to search" | `lib/rules/checkoutAccess.ts`, `components/ListingUnavailable.tsx`, `app/listings/[listingId]/page.tsx`, `app/checkout/[listingId]/page.tsx` | `tests/unit/checkoutAccess.test.ts`, `tests/e2e/confirmReceipt.spec.ts`, `tests/e2e/checkout.spec.ts` |
| 8 | Sell requires login; after login back to the sell flow; "+ Sell" / "Sell for free" in the header | `components/AccountBadge.tsx`, `app/sell/page.tsx`, `lib/rules/login.ts` | `tests/e2e/sell.spec.ts` |
| 8 | Own search screen, same matching; every album opens its list of versions, with its version count | `app/AlbumSearch.tsx`, `app/sell/page.tsx`, `lib/rules/albumSearch.ts` | `tests/e2e/sell.spec.ts` |
| 8 | Pick one version, then "Continue"; "My version isn't here" and unknown versions → "This version isn't in our catalogue yet" | `app/sell/albums/[albumId]/VersionPicker.tsx`, `app/sell/versions/[versionId]/page.tsx`, `lib/db/albums.ts` | `tests/e2e/sell.spec.ts` |
| 8 | "List for sale" disabled until condition, price, cover and record photo and, the first time, the city | `lib/rules/sellForm.ts`, `app/sell/versions/[versionId]/SellForm.tsx` | `tests/unit/sellForm.test.ts`, `tests/e2e/sell.spec.ts` |
| 8 | Price rule: above €0, up to 2 decimals, at most €1000, each with its message | `lib/rules/sellForm.ts`, `supabase/migrations/0003_sell.sql` | `tests/unit/sellForm.test.ts`, `tests/e2e/sell.spec.ts` |
| 8 | Typical range and future label while typing; no range → neither; "No commission: you receive €[price]" | `app/sell/versions/[versionId]/SellForm.tsx`, `lib/rules/fairPrice.ts` | `tests/e2e/sell.spec.ts` |
| 8 | Photos: 5 MB each, reduced in the browser, stored in Supabase Storage | `lib/rules/sellForm.ts`, `app/sell/versions/[versionId]/reducePhoto.ts`, `lib/db/photos.ts` | `tests/unit/sellForm.test.ts`, `tests/e2e/sell.spec.ts` |
| 8 | Publish: listing, three "uncertain" checks and, the first time, city and shop name, all or nothing; appears under the version, yellow | `supabase/migrations/0003_sell.sql`, `lib/db/listings.ts`, `app/sell/versions/[versionId]/actions.ts` | `tests/e2e/sell.spec.ts` |
| 8 | My listings from Your account: "On sale" and "Sold" tabs with status; removed listings not shown; sold ones cannot be edited or removed | `lib/rules/myListings.ts`, `app/my-listings/`, `app/account/page.tsx` | `tests/unit/myListings.test.ts`, `tests/e2e/myListings.spec.ts` |
| 8 | Edit only the price; its label updates; the price rule applies | `app/my-listings/MyListings.tsx`, `app/my-listings/actions.ts`, `lib/db/listings.ts` | `tests/e2e/myListings.spec.ts` |
| 8 | Remove asks first; "Listing removed" with "Undo" for 5 seconds; Undo puts it back as before; a removed listing no longer appears to buyers | `lib/rules/myListings.ts`, `app/my-listings/MyListings.tsx`, `lib/db/listings.ts` | `tests/unit/myListings.test.ts`, `tests/e2e/myListings.spec.ts` |
| 8 | Bought while editing or removing → "This record was just sold" | `lib/db/listings.ts`, `app/my-listings/MyListings.tsx` | `tests/e2e/myListings.spec.ts` |
| 8 | A signed-in seller sees "Your listing" instead of Buy and never reaches the checkout of their own listing (finding #12) | `lib/rules/checkoutAccess.ts`, `components/ListingList.tsx`, `components/YourListing.tsx`, `app/listings/[listingId]/page.tsx`, `app/checkout/[listingId]/page.tsx` | `tests/unit/checkoutAccess.test.ts`, `tests/e2e/sell.spec.ts` |
| 8 | Loading mask and error screen with "Try again"; the sell form keeps what was typed (Shared rules) | `app/sell/albums/[albumId]/loading.tsx`, `app/sell/albums/[albumId]/error.tsx`, `app/sell/versions/[versionId]/loading.tsx`, `app/sell/versions/[versionId]/error.tsx`, `app/my-listings/loading.tsx`, `app/my-listings/error.tsx`, `app/sell/versions/[versionId]/SellForm.tsx` | Not tested automatically: manual tests M7, M8, M9, M12 (`docs/manual-tests.md`); a failed photo upload is tested on desktop only, phone: M11 |
| 4 | 2 versions on a phone, up to 3 on desktop (2 when fewer are on sale) | `lib/rules/compare.ts`, `app/albums/[albumId]/compare/page.tsx` | `tests/unit/compare.test.ts`, `tests/e2e/compare.spec.ts` |
| 4 | First column is the recommended version, the others follow by total score | `lib/rules/compare.ts` | `tests/unit/compare.test.ts`, `tests/e2e/compare.spec.ts` |
| 4 | Versions without active listings are not shown | `lib/rules/compare.ts` | `tests/unit/compare.test.ts` |
| 4 | The buyer's priorities are highlighted (rank labels, not colour alone) and come first in rank order | `lib/rules/compare.ts`, `app/albums/[albumId]/compare/page.tsx` | `tests/unit/compare.test.ts`, `tests/e2e/compare.spec.ts` |
| 4 | One version on sale: "Compare pressings" is not shown | `lib/rules/compare.ts`, `app/albums/[albumId]/recommendation/page.tsx` | `tests/unit/compare.test.ts`, `tests/e2e/compare.spec.ts` |
| 4 | Tapping a version opens its page (fit with the priorities, tracks, listings); "Back to compare" returns | `lib/rules/compare.ts`, `lib/db/recommendation.ts`, `app/versions/[versionId]/page.tsx` | `tests/unit/compare.test.ts`, `tests/e2e/compare.spec.ts` |
| 4 | Loading mask and error screen with "Try again" (Shared rules) | `app/albums/[albumId]/compare/loading.tsx`, `app/albums/[albumId]/compare/error.tsx`, `app/versions/[versionId]/loading.tsx`, `app/versions/[versionId]/error.tsx` | Not tested automatically: manual tests M15 and M16 (`docs/manual-tests.md`) |
| 12 | Home page: title, search, one crate per genre with the real number of albums; genres with no albums are not shown | `lib/rules/home.ts`, `app/page.tsx`, `app/HomeSections.tsx`, `components/Crate.tsx`, `supabase/migrations/0006_genres.sql` | `tests/unit/home.test.ts`, `tests/e2e/home.spec.ts` |
| 12 | Genre screen: only that genre's albums, newest first, rows and taps as in search; an unknown or empty genre is not found | `app/genres/[genre]/page.tsx`, `app/genres/[genre]/GenreAlbums.tsx`, `lib/rules/home.ts` | `tests/unit/home.test.ts`, `tests/e2e/home.spec.ts` |
| 17 | `/search?q=…` shows only the results (no crates, no "This week"); the home page lists no results | `app/search/page.tsx`, `app/search/SearchResults.tsx`, `app/page.tsx`, `components/SearchBox.tsx`, `components/HeaderSearch.tsx` | `tests/e2e/search.spec.ts`, `tests/e2e/home.spec.ts` |
| 17 | Fewer than 3 characters: no search, "Type at least 3 characters to search.", typed text kept | `lib/rules/albumSearch.ts`, `app/search/page.tsx` | `tests/unit/albumSearch.test.ts`, `tests/e2e/search.spec.ts` |
| 17 | Opening the address or reloading gives the same results; "← Back to home"; editing the text and searching again | `app/search/page.tsx`, `components/SearchBox.tsx` | `tests/e2e/search.spec.ts` |
| 17 | Loading mask and error screen with "Try again" (Shared rules) | `app/search/loading.tsx`, `app/search/error.tsx` | Not tested automatically: manual test M14 (`docs/manual-tests.md`) |
| 12 | "This weekend" features the album that opens with the most active listings (the newest on a tie; hidden if none opens); "For sellers" opens selling | `lib/rules/home.ts`, `app/HomeSections.tsx` | `tests/unit/home.test.ts`, `tests/e2e/home.spec.ts` |
| 12 | On desktop the search is in the header of every page (not the sell pages), with the same results as story 1 | `components/HeaderSearch.tsx`, `components/Header.tsx`, `app/page.tsx` | `tests/e2e/home.spec.ts`, `tests/e2e/search.spec.ts` |
| 12 | Loading mask and error screen with "Try again" (home sections, genre screen) | `app/HomeSections.tsx`, `app/genres/[genre]/loading.tsx`, `app/genres/[genre]/error.tsx` | Home sections: `tests/e2e/home.spec.ts`, `tests/e2e/loadingScreens.spec.ts`; genre screen: not tested automatically: manual test M10 (`docs/manual-tests.md`) |
| 1 | Loading mask "Searching…" while the albums load | `app/AlbumSearch.tsx`, `components/LoadingMask.tsx` | `tests/e2e/loadingScreens.spec.ts` |
| 5 | Listings beside the recommendation (desktop): loading mask, and an error screen with "Try again" that recovers while the recommendation stays | `components/ListingsBeside.tsx`, `components/ErrorScreen.tsx` | `tests/e2e/loadingScreens.spec.ts` |
| 14 | | | |
| 15 | | | |
