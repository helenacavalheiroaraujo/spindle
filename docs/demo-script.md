# Spindle — 5-minute demo script

> **DRAFT** — not rehearsed yet. Timings, wording and steps will change after the rehearsals.

Assignment 2 · live demo · due 23 Nov 2026 (moved from 15 Nov). Shown on desktop at 1280 px, the reference layout for this delivery (DECISIONS 2026-11-14).
App address: **`<VERCEL ADDRESS — to be added>`** (fallback: `http://localhost:3000`).

All records, prices, sellers, checks and payments in the app are **illustrative** (Assignment 1, p. 12). Say so once, early.

**Story in one line:** "A buyer who knows nothing about pressings searches for *Ziggy Stardust*, says what matters, gets one recommendation, buys a verified copy safely, and then sells a record."

Use a **desktop browser at 1280 px** for the main path (listings sit beside the recommendation). Show the phone view only if time allows (see "Optional").

---

## Timeline

| Time | Step | Click / type | Say |
|---|---|---|---|
| 0:00–0:25 | **1. Home** (story 12) | Open the app. Point at the crates and "This weekend". | "Spindle helps people who are not vinyl experts pick the right pressing and buy a verified copy safely. The data here is illustrative." |
| 0:25–0:55 | **2. Search** (stories 1, 17) | Type `zigy` in the search box, press Enter → "Did you mean…?". Click the suggested title's search (or retype `ziggy`, Enter). | "A typo still finds the album. Results show cover, artist, year and how many versions exist. Blackstar says *No listings*: only active listings count." |
| 0:55–1:15 | **3. Priorities** (story 2) | Tap the *Ziggy Stardust* result. Tap **Price**, then **Sound**. Point at the numbers 1 and 2. Tap **See recommendation**. | "Three pressings is too many to choose from. I only say what matters: 1. Price, 2. Sound." |
| 1:15–2:00 | **4. Recommendation** (story 3) | Show **2012 Remaster**, the "Matches: price / sound" tags, the two reasons, "Cheapest option: 1990 Reissue, €24". Tap the underlined word *remaster*. Open **Track list** (the bonus tracks show "Bonus"). | "One pick, and why, in plain words. Technical terms explain themselves. The source line says it is based on collector ratings." |
| 2:00–2:25 | **5. Compare** (story 4) | Tap **Compare pressings**. Point at ★ Recommended, the rows that follow my priorities (price first, then sound). Tap the 1990 column → version page. Tap **Back to compare**, then back to the recommendation. | "If I want to double-check, two pressings side by side, my priorities first. No scores, just words." |
| 2:25–3:05 | **6. Verified listings and fair price** (stories 5, 6) | On the recommendation (desktop) look at the list on the right: green **Match** €32, yellow **Check** €36, red **No match** €29 last. Point at the labels *Typical* / *Above typical* and "Typical price for this pressing: €28–€36". Tap **See the checks** on the €36 listing → "Is it really this one?" with the checklist and photos. **Back to the recommendation.** | "Every listing is checked against the pressing. The light always shows its word, not only a colour. The red one is a different pressing: it moved to 1990 Reissue and cannot be bought here. Each price is compared with a typical range." |
| 3:05–3:25 | **7. Buy, signed out** (stories 5, 9) | Tap **Buy** on the yellow €36. A warning appears ("The matrix photo isn't sharp…"). Tap **Continue to checkout** → the login page opens. Log in with the **prepared demo account**. | "Yellow means one check is uncertain, so Spindle tells me before I continue. I have to be logged in to buy, and I land on the same listing afterwards." |
| 3:25–4:00 | **8. Checkout and confirmation** (story 7) | Fill the address: Rui Costa · Rua do Almada 120 · 4050-031 · Porto. Show the price breakdown (€36 + €4.90 + €2.00). Tap **Pay €…**. On the confirmation show "Order placed", the status and the four steps (1 done). | "Protection: I pay Spindle, the seller ships, I confirm, then the seller is paid. There are no card or bank fields anywhere; the payment is simulated." |
| 4:00–4:15 | **9. Confirm receipt** (story 7, step 3) | Open **Your account** → the order is "On its way" → **It arrived, all good** → "Are you sure? The money is released to the seller." → confirm → "Delivered". | "Only when I confirm does the money go to the seller." |
| 4:15–5:00 | **10. Selling** (story 8) | Tap **+ Sell**. Type `homo` → **Homogenic** → pick **1997 UK original** → **Continue**. Choose a condition, add the two photos, type a price (e.g. 38). Point at "No commission: you receive €38". Add city (first time only) → **List for sale**. The list shows the new listing yellow with "Your listing". Open **Your account → My listings**. | "Selling is free, no commission. The listing starts yellow until it is checked. I see it under My listings and can edit the price or remove it with Undo." |

**Total: 5:00.** If behind schedule, cut in this order: (a) glossary and track list in step 4, (b) the version page in step 5, (c) step 9, (d) editing/removing in step 10.

### Closing line (last 10 s, do not add time)
"Every step you saw is covered by an automated test, and every data table is in the PDF."

---

## Optional (only if the demo is shorter than 5 min)
- **Phone view (375 px):** open the browser's device mode on the recommendation; show the **See verified listings** button (on a phone the list opens on its own screen).
- **Sign up** (story 9): instead of the prepared account, tap **Sign up** on the login page, use a new email, a password of 8+ characters. Do not do this live unless it is rehearsed: the email must be new.
- **Saved ranking** (story 2): when logged in, the next album skips the priorities screen and shows "Based on: Price, Sound · Change".
- **Genre crate** (story 12): tap *Rock* on the home page.

---

## Data state to have before starting

Seed = `supabase/seed.sql` (illustrative data).

- [ ] The app opens at the demo address and the home page shows the crates (Rock 4 albums, etc.).
- [ ] **Ziggy Stardust:** 2012 Remaster has the green €32, yellow €36 and red €29 listings, all on sale. 1990 Reissue has its on-sale listings. (Check: `1. Price, 2. Sound` recommends **2012 Remaster**.)
- [ ] **Do not use the green €32 listing for the purchase.** If it is sold, the 2012 Remaster's lowest price becomes €36 and, with 1. Price, 2. Sound, the two pressings tie at 19 points; the tie rule picks the cheaper one, so the app would recommend the **1990 Reissue** and the script breaks. Buy the **yellow €36**, as in the script.
- [ ] The yellow €36 listing is still on sale (a rehearsal that completed the purchase has used it up).
- [ ] **Homogenic · 1997 UK original** has no listings (the selling step uses it).
- [ ] A **prepared demo account** exists (email and password written on paper, not in the repo). Log out before starting.
- [ ] If the demo account has already sold something, the "add your city" step does not appear: that is fine, just skip it in the script.
- [ ] Two small photo files (JPEG or PNG, under 5 MB) saved on the desktop for the sell form: one cover, one record.
- [ ] The browser is at 1280 px wide, zoom 100%, no other tabs, notifications off.
- [ ] The demo account's "Your account" shows no leftover orders other than the ones you expect.
- [ ] Open the app once 5 minutes before (the first visit after a pause is slower).

### After a rehearsal
A completed rehearsal changes the data: the €36 listing is sold, there is an order, and a Homogenic 1997 listing exists. Put the data back before the real demo. The seed file says that running it again resets the demo data, **but it does not empty the `orders` table**, so it may refuse to run once an order exists. Check this with a test run in a spare database before relying on it, or ask for help to remove the rehearsal rows by hand.

---

## Backup plan

| If this fails live | Do this |
|---|---|
| The online app is slow or down | Switch to `http://localhost:3000` (start it before the demo: `npm run dev`). Say nothing more than "I'll use the local copy". |
| Search or any screen shows an error screen | Tap **Try again** once. The error screen with "Try again" is part of the design: say so. If it fails again, go to the next step by typing the address directly (below). |
| Typing in the search box is slow | Skip the typo, search `ziggy` directly. |
| Login fails | Check the prepared account; if it still fails, use **Sign up** with a new email and a password of 8+ characters. |
| Purchase fails ("Sorry, this record was just sold") | Say "that is the protection working: nobody can buy a sold record", go back and buy another listing, or skip to the account step with a screenshot. |
| Photos will not upload when selling | Show the screenshots `docs/screenshots/story-8/sell-form-1280.png` and `sell-listed-1280.png` and say what happens. |
| Anything else breaks | Show the screenshots of the step from the PDF (`docs/screenshots/story-<n>/…`) and carry on with the next step. Never debug live. |

**Direct addresses** (add after the app address; these ids come from the seed):

- Priorities: `/albums/10000000-0000-0000-0000-000000000001/priorities`
- Recommendation: `/albums/10000000-0000-0000-0000-000000000001/recommendation?priorities=price,sound`
- Compare: `/albums/10000000-0000-0000-0000-000000000001/compare?priorities=price,sound`
- 2012 Remaster listings: `/versions/20000000-0000-0000-0000-000000000003/listings?priorities=price,sound`
- Sell: `/sell`
- Your account: `/account`

---

## What each step is covered by (so you can say "tested")

| Step | Automated test (`tests/e2e/`) | Unit test (`tests/unit/`) |
|---|---|---|
| 1 Home | `home.spec.ts` | `home.test.ts` |
| 2 Search | `search.spec.ts`, `loadingScreens.spec.ts` | `albumSearch`, `searchSuggestions`, `albumAccess`, `activeListings` |
| 3 Priorities | `priorities.spec.ts`, `savedPriorities.spec.ts` | `priorities.test.ts` |
| 4 Recommendation | `recommendation.spec.ts` | `recommendation`, `glossary` |
| 5 Compare | `compare.spec.ts` | `compare.test.ts` |
| 6 Listings, checks, fair price | `listings.spec.ts`, `listingCheck.spec.ts`, `fairPrice.spec.ts` | `trafficLight`, `listingOrder`, `listingCheck`, `fairPrice`, `yellowWarning`, `seller` |
| 7 Buy, login | `login.spec.ts`, `signup.spec.ts`, `checkout.spec.ts` | `login`, `signUp`, `checkoutAccess` |
| 8 Checkout, confirmation | `checkout.spec.ts` | `checkoutTotal`, `shippingAddress` |
| 9 Confirm receipt | `confirmReceipt.spec.ts` | `orderProgress.test.ts` |
| 10 Selling, My listings | `sell.spec.ts`, `sellEdgeCases.spec.ts`, `myListings.spec.ts` | `sellForm`, `myListings` |

Not covered by an automated test: the loading masks and error screens of the server screens (manual checks M1–M16 in `docs/manual-tests.md`, **not run yet**). The whole path in one go has not been run or rehearsed as one test (`docs/PROGRESS.md`).
