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
app/                                  ← screens (one folder per route), with their server actions
  page.tsx                            ← home: crates by genre, "This week at the shop" (stories 12, 24)
  genres/[genre]/                     ← genre screen (story 12)
  search/                             ← results page /search?q=… (story 17)
  albums/[albumId]/                   ← album page: facts, tracks, 30-second previews (stories 21, 28, 34)
  albums/[albumId]/priorities/        ← story 2
  albums/[albumId]/recommendation/    ← story 3 (+ listings beside it on desktop)
  albums/[albumId]/compare/           ← story 4
  versions/[versionId]/               ← version page (story 4)
  versions/[versionId]/listings/      ← verified listings, phone screen (stories 5, 33)
  listings/[listingId]/               ← listing check (story 5)
  checkout/[listingId]/               ← story 7
  cart/ · cart/checkout/ · cart/add/  ← story 20 (cart/add/[listingId] adds after a log-in)
  orders/[id]/ · orders/placed/       ← "Order placed" for one record, or for a cart (stories 7, 30)
  account/                            ← Your account: Orders, For sale, Account details tabs (stories 31, 23, 26; bugs 8, 9)
  sell/                               ← sell search → pick the version → sell form (story 8)
  my-listings/                        ← old address: opens the For sale tab (story 31)
  login/ · signup/                    ← the home page with the log-in window open (story 29)
components/                           ← shared UI. Among them:
  Header · MainMenu · AccountMenu · CartLink · Footer          ← header, menu, account pill, cart icon (stories 14, 15, 19, 20, 22, 32)
  LoadingMask · ErrorScreen                                    ← the only loading and error screens (Shared rules)
  LoginWindow · LoginWindowLink · LoginGate · SignInRequired   ← every log-in in one window; pages that need an account (stories 27, 29)
  PageTrail                                                    ← the previous page in the tab, for closing the log-in window (story 29)
  TrafficLight · PressingCheck · ListingList · ListingsBeside  ← listings (stories 5, 33)
  BuyButton · AddToCart · OrderProgress · OrderPlacedActions   ← buying (stories 7, 20, 30)
lib/rules/                            ← business rules: pure functions, no database, no screens (one unit test file each)
  recommendation.ts · compare.ts      ← scores, weights, tie, alternative (stories 3, 4)
  trafficLight.ts · listingCheck.ts   ← checklist → green / yellow / red (story 5)
  fairPrice.ts                        ← below / typical / above (story 6)
  checkoutTotal.ts · cartTotal.ts     ← record + €4.90 + €2.00; the cart total (stories 7, 20)
  albumSearch.ts · searchSuggestions.ts ← title/artist match, newest first; close titles (stories 1, 16)
  loginWindow.ts · login.ts · signUp.ts ← window titles, where to go after logging in, sign-up rules (stories 9, 27, 29)
  … one file per rule; the SPEC's Traceability table names each one
lib/db/                               ← all database access (Supabase), one file per entity; server only
lib/external/                         ← outside services, server only: albumDetails.ts (MusicBrainz, Wikipedia), itunes.ts (previews); answers kept for one day
supabase/migrations/                  ← tables, 0001–0012 (described in docs/database.md)
supabase/seed.sql                     ← illustrative data (albums, versions, listings)
tests/unit/                           ← Vitest: decision tables for lib/rules
tests/e2e/                            ← Playwright: critical flows, each at 375 px (phone) and 1280 px (desktop)
specs/stories/ · specs/bugs/          ← one file per story and per bug (index in SPEC.md)
docs/                                 ← database.md, use-cases.md, app-flowchart, design/, manual-tests.md, reviews, screenshots
```

## Rules live in one place

Every rule the SPEC marks "in one function, covered by unit tests" is a pure function in `lib/rules/`: same input, same output, no database. Screens call these functions; they never re-implement a rule.

## Example: what happens on a search

1. The buyer types "zig" → the search screen asks the server for albums
2. The server (`lib/db/albums`) reads every album with its number of versions and its listings; `lib/rules/albumSearch` keeps those whose title or artist contains the typed text, ignoring case and accents
3. If nothing matches, `lib/rules/searchSuggestions` picks up to 3 close titles
4. The screen shows the albums (newest first) or the suggestions

## Next delivery — noted, not in the MVP

- **Public API.** The next assignments will need the app to be reachable by other applications. The API is built when that brief is known. Keeping every rule in `lib/rules/` means the API can reuse them without reorganising the code.
- **Guard the server-only code.** `lib/db/` and `lib/external/` must never reach the browser. Today this holds by convention (the secret key has no `NEXT_PUBLIC_` prefix, so it is never sent), but a wrong import would only show when the app runs. Next delivery: mark these folders as server only, so the build itself refuses such an import (needs one small package, `server-only`; ask before installing).
- **Split the largest screens.** `components/LoginWindow.tsx` (~370 lines) into the left panel, the log-in form and the sign-up form; `app/my-listings/MyListings.tsx` (~400 lines) into the listing row, edit price and remove with Undo. Same behaviour, smaller files with one job each.
- **Polish the phone layout.** For the MVP delivery desktop is the reference (DECISIONS 2026-11-14); the phone visual bugs logged in `specs/bugs/` are fixed in the next delivery, keeping the phone-first principle.
- **Check the session once.** About 24 pages each ask "is someone signed in?" at their top. Group the pages that need an account under one route group (e.g. `app/(signed-in)/`) whose layout checks the session once and returns `SignInRequired`, so a new page cannot forget it.

## Testing

- **Unit (Vitest):** one test file per rule in `lib/rules/`, written as decision tables from the SPEC's acceptance criteria and example data
- **End-to-end (Playwright):** search → priorities → recommendation → listing → checkout; log in from Buy goes on to the checkout; sell and see the listing; cart; Your account. Every spec runs twice, at 375 px and at 1280 px
- **One suite at a time:** the end-to-end tests share one database and port 3000, so two runs at once fail at random. Stop any other development server first
- **Manual checks:** what the automated tests cannot see (loading masks, error screens, live outside services) is in `docs/manual-tests.md`
- Every story's tests are listed in the SPEC's Traceability table

## Conventions

- Language: **TypeScript**
- Styling: **Tailwind CSS**, colours and fonts from the Assignment 1 designs
- Shared rules (loading mask, error screen) come from `components/`, never rebuilt per screen
- A page that needs an account checks the session at its top and, signed out, returns `SignInRequired` (story 29); it never redirects to a log-in page
