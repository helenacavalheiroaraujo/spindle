# Spindle MVP — Architecture

> Defined before the first prompt (assignment brief, section 5). What the app does: `SPEC.md`. Why: `DECISIONS.md`.

## The parts and how they talk

```
Browser (phone or desktop)
  → Next.js app on Vercel: screens + server code + business rules
    → Supabase: PostgreSQL database · Auth (sign-up, login) · Storage (listing photos)
```

- The browser never talks to the database directly: all reads and writes go through the app's server code (`lib/db`).
- Passwords are handled by Supabase Auth only.
- Keys live in environment variables (Vercel settings and a local `.env.local` that is never committed).

## Folder structure

```
app/                                ← screens (one folder per route)
  page.tsx                          ← home (story 12)
  search/                           ← results page /search?q=… (story 17)
  albums/[albumId]/priorities/      ← story 2
  albums/[albumId]/recommendation/  ← story 3 (+ listings beside it on desktop)
  versions/[versionId]/listings/    ← story 5, phone screen
  listings/[listingId]/             ← listing check (story 5)
  checkout/[listingId]/             ← story 7
  orders/[orderId]/                 ← order confirmation (story 7)
  cart/ · cart/checkout/            ← story 20 (cart/add/[listingId] adds after a log-in)
  login/                            ← sign in / create account (story 9)
  sell/ · my-listings/              ← story 8 (phase 3)
  compare/[albumId]/                ← story 4 (phase 4)
components/                         ← shared UI: Header, LoadingMask, ErrorScreen, TrafficLight, PriceLabel,
                                      ListingList, ListingsBeside, BuyButton, AddToCart, CartLink
lib/rules/                          ← business rules, pure functions, no database
  recommendation.ts                 ← scores, weights, tie, alternative, ideal (story 3)
  trafficLight.ts                   ← checklist → green / yellow / red (story 5)
  fairPrice.ts                      ← below / typical / above (story 6)
  checkoutTotal.ts                  ← record + €4.90 + €2.00 (story 7)
  cartTotal.ts · cartAccess.ts      ← the cart total; who can add, which records stay (story 20)
  albumSearch.ts                    ← title/artist match, newest first (story 1)
  searchSuggestions.ts              ← up to 3 albums, tolerance by typed length (story 1)
  activeListings.ts                 ← which listings count (Shared rules)
lib/db/                             ← all database access (Supabase), one file per entity
supabase/migrations/                ← tables (next step: docs/database.md)
supabase/seed.sql                   ← illustrative data (albums, versions, listings)
tests/unit/                         ← Vitest: decision tables for lib/rules
tests/e2e/                          ← Playwright: critical flows
docs/design/ · docs/spec-review/
```

## Rules live in one place

Every rule the SPEC marks "in one function, covered by unit tests" is a pure function in `lib/rules/`: same input, same output, no database. Screens call these functions; they never re-implement a rule.

## Example: what happens on a search

1. The buyer types "zig" → the search screen asks the server for albums
2. The server (`lib/db/albums`) reads every album with its number of versions and its listings; `lib/rules/albumSearch` keeps those whose title or artist contains the typed text, ignoring case and accents
3. If nothing matches, `lib/rules/searchSuggestions` picks up to 3 close titles
4. The screen shows the albums (newest first) or the suggestions

## Public API — later, not in the MVP

The next assignments will need the app to be reachable by other applications. The API is built when that brief is known. Keeping every rule in `lib/rules/` means the API can reuse them without reorganising the code.

## Testing

- **Unit (Vitest):** one test file per rule in `lib/rules/`, written as decision tables from the SPEC's acceptance criteria and example data
- **End-to-end (Playwright):** search → priorities → recommendation → listing → checkout; login from Buy returns to the checkout; (phase 3) sell and see the listing
- Every story's tests are listed in the SPEC's Traceability table

## Conventions

- Language: **TypeScript**
- Styling: **Tailwind CSS**, colours and fonts from the Assignment 1 designs
- Shared rules (loading mask, error screen) come from `components/`, never rebuilt per screen
