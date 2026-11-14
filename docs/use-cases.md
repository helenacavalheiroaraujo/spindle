# Spindle MVP — Use cases

> Compiled from the "Use cases" of each story in `specs/`. Stories 3, 4, 6, 21 and 23 have no "Use cases" section, so their entries (UC-6, UC-7, UC-10, UC-30, UC-33) are taken from the story's Scope and Acceptance criteria. Stories 22 and 25 only change how pages look and add no use case. Story 28 changes where an album tap leads: every album opens its album page first (UC-35). Story 29 moves every log-in into one window (UC-22, UC-41); stories 30–32 change what follows a payment and how Your account is reached (UC-15, UC-21, UC-25, UC-32c, UC-36, UC-37); story 33 only adds a "Pressing check" line to each listing (UC-9). Bugs 8 and 9 added UC-39 and UC-40. Criteria and edge cases stay in the stories: this file only lists what a user can do and where it is specified. All catalogue data is illustrative.

## Actors
- **Buyer**: a non-specialist who wants the right pressing of a record and a safe purchase. Signed out or signed in.
- **Seller**: a signed-in user (shop or private seller) who lists a record for free.

## Buyer: find an album
| # | Use case | Result | Story |
|---|---|---|---|
| UC-1 | Search for an album by title or artist | List of albums, newest release first | 1, 17 |
| UC-2 | Pick a suggestion while typing | Opens that album's page, or goes to the results page | 16, 28 |
| UC-3 | Type with a typo | "Did you mean…?" with up to 3 albums, or "No albums found" | 1, 16, 17 |
| UC-4 | Browse the home page by genre (crates; a scrollable row when there are 7 or more genres) | Genre screen with that genre's albums | 12, 24 |
| UC-5 | Open an album with no active listings | Its album page with "Nobody is selling this album right now" | 1, 28 |
| UC-30 | Open an album with no listings and read about it | Release date, label, track list and "About [musician]" with a Wikipedia link; "Nobody is selling this album right now" stays | 21 |
| UC-31 | Scroll to the bottom of any page on desktop | Footer with the basics about Spindle | 14 |
| UC-35 | Open an album on sale and decide how to go on | Album page with cover, facts and tracks; "Help me choose a version" (priorities), or "See your recommendation · Based on: … · Change" with a saved ranking | 28 |
| UC-38 | Listen to a track on the album page | 30 seconds play; playing another track stops the first; no previews when none is found | 34 |

## Buyer: choose the pressing
| # | Use case | Result | Story |
|---|---|---|---|
| UC-6 | Say what matters (rank up to 4 priorities; unpick; change later) | Ranked list; signed in, it is saved to the account | 2 |
| UC-7 | Get one recommended version | Version, "Matches" tags, reasons, alternative, glossary | 3 |
| UC-8 | Compare pressings | 2 versions on phone, up to 3 on desktop | 4 |

## Buyer: choose the copy
| # | Use case | Result | Story |
|---|---|---|---|
| UC-9 | See verified listings for a version | Green "Match" / yellow "Check" / red "No match", cheapest first; each card says its "Pressing check" result | 5, 33 |
| UC-10 | See whether a price is fair | Below / typical / above the pressing's range | 6 |
| UC-11 | Open a listing check | Checklist, photos, condition in plain words | 5 |
| UC-12 | See a red listing | Warning here; also shown yellow under its correct version | 5 |

## Buyer: buy
| # | Use case | Result | Story |
|---|---|---|---|
| UC-13 | Buy a green listing | Checkout | 5, 7 |
| UC-14 | Buy a yellow listing | Warning about what is uncertain, then checkout | 5, 7 |
| UC-15 | Pay (simulated, no card or bank details) | Order "Paid · waiting for the seller"; "Order placed" with See my orders and Back to the home page | 7, 30 |
| UC-16 | Confirm receipt of a delivered order | Order becomes "Seller paid" | 7 (step 3) |
| UC-17 | Rate the seller (1 to 5 stars, or "Not now" and rate later) | Seller summary on listings updates | 18 |
| UC-18 | Buy a record that was just sold | "Sorry, this record was just sold", no order | 7 |
| UC-39 | Message the seller about a paid order (one message) | "You wrote" on the order; the seller reads it under the sold record | bug 8 |

## Buyer: cart
| # | Use case | Result | Story |
|---|---|---|---|
| UC-32a | Add a green or yellow listing to the cart (signed out → the log-in window first) | Record in the cart | 20, 27 |
| UC-32b | Open the cart from the cart icon in the header; remove a record | Records, total, "Remove"; total recalculated. Signed out: the window "Log in to see your cart", then the cart | 20, bug 32 |
| UC-32c | Go to checkout and pay the total | One order per record, each "Paid · waiting for the seller"; "Order placed" with one card per record and the total | 20, 30 |
| UC-32d | A record in the cart is sold to someone else | It leaves the cart with a message; total recalculated | 20 |

## Account (buyer and seller)
| # | Use case | Result | Story |
|---|---|---|---|
| UC-19 | Sign up (in the log-in window, "Create one") | Account created, signed in | 9, 29 |
| UC-20 | Log in (in the log-in window; `/login` opens the home page with it) | Signed in, on the same page; wrong password shows a message | 9, 27, 29 |
| UC-21 | Log out (from the account menu, or Account details) | Signed out on the same page; a page that needs an account goes home | 9, 31, 32 |
| UC-22 | Buy, Add to cart, Sell or open the cart while signed out | The log-in window (with the record when there is one); after logging in the action goes on | 27, 29 |
| UC-41 | Open a page that needs an account by its address while signed out (checkout, cart, sell, Your account, orders) | Only the header, with the log-in window on top; after logging in the page shows; closing goes back, or home | 29 |
| UC-42 | The session ends during a checkout | The log-in window opens on the checkout; the address typed is kept | 29 |
| UC-23 | Use the menu (Home, Sell, Your account / Log in, Cart) | Drawer on phone, row on desktop | 15, 19, 20 |
| UC-36 | Open Your account | Profile header and three tabs: Orders, For sale, Account details | 31 |
| UC-37 | Open the account menu (the initials pill) | Name, email, Orders, For sale, Account details, Log out | 32 |
| UC-40 | Change my password; save a delivery address | Saved on Account details; the checkout starts with the saved address | bug 9 |
| UC-33 | See my buying priorities on Your account (Account details) | Saved order, numbered from 1; no section if nothing is saved | 23 |
| UC-34 | Change my buying priorities from Your account | New order shown; the next recommendation uses it | 26 |

## Seller
| # | Use case | Result | Story |
|---|---|---|---|
| UC-24 | List a record: search album, pick version, fill the form, publish | Listing appears under that version, yellow | 8 |
| UC-25 | See my listings (Your account, For sale tab; `/my-listings` opens it) | "On sale" and "Sold"; buyers' messages under sold records | 8, 31, bug 8 |
| UC-26 | Edit the price of a listing on sale | New price saved, label updated | 8 |
| UC-27 | Remove a listing, with confirmation | "Listing removed" | 8 |
| UC-28 | Undo a removal within 5 seconds | Listing on sale again as before | 8 |
| UC-29 | See my own listing as a buyer would | "Your listing" instead of Buy | 8 |

## Errors (every screen)
- Loading or saving fails → error screen with "Try again"; forms keep what was typed (Shared rules in `SPEC.md`).
- A sold or removed listing opened from a link → "This record is no longer available".

## Not in the MVP
- Stories 10, 11 (except its previews, now story 34) and 13.
- Out of scope: artist pages, new (sealed) records, real payments and shipping, automatic photo and matrix checks, AI-written text, Google and Apple sign-in, real catalogue data.
