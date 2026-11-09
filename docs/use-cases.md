# Spindle MVP — Use cases

> Compiled from the "Use cases" of each story in `specs/` (story 14 is outside the MVP). Stories 3, 4 and 6 have no "Use cases" section, so their entries (UC-6, UC-7, UC-10) are taken from the story's Scope and Acceptance criteria. Criteria and edge cases stay in the stories: this file only lists what a user can do and where it is specified. All catalogue data is illustrative.

## Actors
- **Buyer**: a non-specialist who wants the right pressing of a record and a safe purchase. Signed out or signed in.
- **Seller**: a signed-in user (shop or private seller) who lists a record for free.

## Buyer: find an album
| # | Use case | Result | Story |
|---|---|---|---|
| UC-1 | Search for an album by title or artist | List of albums, newest release first | 1, 17 |
| UC-2 | Pick a suggestion while typing | Opens that album, or goes to the results page | 16 |
| UC-3 | Type with a typo | "Did you mean…?" with up to 3 albums, or "No albums found" | 1, 16, 17 |
| UC-4 | Browse the home page by genre (crates) | Genre screen with that genre's albums | 12 |
| UC-5 | Open an album with no active listings | "Nobody is selling this album right now" | 1 |

## Buyer: choose the pressing
| # | Use case | Result | Story |
|---|---|---|---|
| UC-6 | Say what matters (rank up to 4 priorities; unpick; change later) | Ranked list; signed in, it is saved to the account | 2 |
| UC-7 | Get one recommended version | Version, "Matches" tags, reasons, alternative, glossary | 3 |
| UC-8 | Compare pressings | 2 versions on phone, up to 3 on desktop | 4 |

## Buyer: choose the copy
| # | Use case | Result | Story |
|---|---|---|---|
| UC-9 | See verified listings for a version | Green "Match" / yellow "Check" / red "No match", cheapest first | 5 |
| UC-10 | See whether a price is fair | Below / typical / above the pressing's range | 6 |
| UC-11 | Open a listing check | Checklist, photos, condition in plain words | 5 |
| UC-12 | See a red listing | Warning here; also shown yellow under its correct version | 5 |

## Buyer: buy
| # | Use case | Result | Story |
|---|---|---|---|
| UC-13 | Buy a green listing | Checkout | 5, 7 |
| UC-14 | Buy a yellow listing | Warning about what is uncertain, then checkout | 5, 7 |
| UC-15 | Pay (simulated, no card or bank details) | Order "Paid · waiting for the seller", confirmation screen | 7 |
| UC-16 | Confirm receipt of a delivered order | Order becomes "Seller paid" | 7 (step 3) |
| UC-17 | Rate the seller (1 to 5 stars, or "Not now" and rate later) | Seller summary on listings updates | 18 |
| UC-18 | Buy a record that was just sold | "Sorry, this record was just sold", no order | 7 |

## Account (buyer and seller)
| # | Use case | Result | Story |
|---|---|---|---|
| UC-19 | Sign up | Account created, signed in | 9 |
| UC-20 | Log in | Signed in; wrong password shows a message | 9 |
| UC-21 | Log out (from Your account) | Signed out, back to home | 9 |
| UC-22 | Buy or Sell while signed out | Log in or sign up, then back to checkout or to the sell form | 9 |
| UC-23 | Use the menu (Home, Sell, Your account / Log in) | Drawer on phone, row on desktop | 15 |

## Seller
| # | Use case | Result | Story |
|---|---|---|---|
| UC-24 | List a record: search album, pick version, fill the form, publish | Listing appears under that version, yellow | 8 |
| UC-25 | See my listings | "On sale" and "Sold" tabs | 8 |
| UC-26 | Edit the price of a listing on sale | New price saved, label updated | 8 |
| UC-27 | Remove a listing, with confirmation | "Listing removed" | 8 |
| UC-28 | Undo a removal within 5 seconds | Listing on sale again as before | 8 |
| UC-29 | See my own listing as a buyer would | "Your listing" instead of Buy | 8 |

## Errors (every screen)
- Loading or saving fails → error screen with "Try again"; forms keep what was typed (Shared rules in `SPEC.md`).
- A sold or removed listing opened from a link → "This record is no longer available".

## Not in the MVP
- Story 14 (desktop footer); stories 10, 11 and 13.
- Out of scope: artist pages, new (sealed) records, real payments and shipping, automatic photo and matrix checks, AI-written text, Google and Apple sign-in, real catalogue data.
