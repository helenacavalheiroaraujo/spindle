<!-- page: https://claude.ai/artifact/W2xGvu3nfNcfcuxAv3hYsn -->
# MVP progress

Updated 2026-11-21 on request, after story 39 (cancel order) · Deadline 23 Nov 2026 · **2 days left**

## Summary
- **Stories:** 31 of 31 MVP stories built (15 with gaps), 0 in progress, 0 not started; user-test stories 35–39 also built, all rows tested; stories 35–39 and the 21 Nov changes are committed and pushed
- **Tests:** Unit 852/852 · end-to-end 447 passed, 0 failed, 35 skipped (a full run of 17.8 min, the first clean one: earlier runs on 21 Nov had failures from a slow or dropped dev server, all green on re-run)
- **Demo:** The happy path passes its end-to-end tests on phone and desktop. Not rehearsed live
- **Next:** Brief items: review and attach the submission PDF (47 pages, built, kept out of git) and run the 35 manual checks
- **Risk:** 2 days left. The code is done and the tests are green; the risk is the 35 manual checks (none run) and the review of the PDF. Nothing in the code is cut
- **Brief:** 4 of 7 criteria done, 3 partly; S1 done, S2 (PDF) partly

## Against the brief
| Criterion | Status | Evidence / what is missing |
|---|---|---|
| 1 · Core features end to end | Done | Core flow passes end to end on phone and desktop (search, recommendation, listings, checkout, confirmation). Not rehearsed live |
| 2 · Data tables | Done | Migrations 0001–0013 committed; 0013 confirmed in Supabase on 21 Nov (function cancel_order and value cancelled found); `docs/database.md` and the PDF describe all 15 tables and 13 migrations |
| 3 · Testing, automated and manual | Partly | Unit 852/852; end-to-end 447 passed, 35 skipped, none failed (clean full run, 21 Nov); manual: all 35 entries in `docs/manual-tests.md` Not run |
| 4 · LLM good practices in the repo | Done | SPEC, `specs/`, CLAUDE.md, ARCHITECTURE, DECISIONS, `docs/AI_USAGE.md`, use cases, flowchart, tests |
| 5 · UX and UI quality | Partly | `docs/ux-review/findings.json`: 5 open (Medium #38, #39; Low #40, #42, #43), no High; story 25 covers them but they are still marked open |
| 6 · App online and reachable | Done | https://spindle-three.vercel.app answers 200 (21 Nov) and serves the code of stories 36 and 39; all commits are pushed |
| 7 · Live demo | Partly | `docs/demo-script.md` is a DRAFT, not rehearsed, no address |
| S1 · Link to the app | Done | https://spindle-three.vercel.app, checked online |
| S2 · PDF with tables and screenshots | Partly | PDF built: cover, contents, 15 tables with diagram, 89 figures, 47 pages. Kept out of git; not yet reviewed page by page by the owner; to attach on Moodle |

### Missing for the brief, by impact on the grade
1. Submission PDF (S2): review it page by page, then attach it on Moodle with the link (the file is docs/submission/spindle-submission.pdf; rebuild with python3 docs/submission/build/build.py).
2. Manual test record: 35 entries "Not run" in `docs/manual-tests.md` (run them in the manual test plan page).
3. Demo script: add the address and remove DRAFT (not part of the submission).
4. Close the UX entries that story 25 already fixed (#38–#43), if the owner agrees.

## Build phases
| Phase | Stories | Status |
|---|---|---|
| 1 · Core | Stories 1, 2, 3, 5, 6, 12 | Done with gaps |
| 2 · Purchase | 9, 7, 2 (save to account) | Done with gaps |
| 3 · Seller | Story 8 | Done with gaps |
| 4 · If time allows | 7 step 3, 17, 4, 18, 16, 15, 19, 20, 14, 22, 24, 21, 23, 25, 26, 27, 28, 31, 30, 32, 33, 29, 34 | Done with gaps |

## Stories
| Story | Status | Requirements with automated test | Open findings |
|---|---|---|---|
| 1 · Search for an album | Built | 6 of 6 | — |
| 2 · Say what matters to me | Built with gaps | 6 of 7 | — |
| 3 · Get one recommendation | Built with gaps | 8 of 9 | — |
| 4 · Compare versions | Built with gaps | 6 of 7 | — |
| 5 · See verified listings | Built with gaps | 10 of 11 | — |
| 6 · Fair price | Built | 4 of 4 | — |
| 7 · Buy with protection | Built with gaps | 10 of 12 | — |
| 8 · Sell a record for free | Built with gaps | 13 of 14 | — |
| 9 · Sign up, log in | Built | 4 of 4 | — |
| 12 · Home page | Built with gaps | 4 of 5 | — |
| 14 · Desktop footer | Built | 2 of 2 | — |
| 15 · Menu | Built | 3 of 3 | — |
| 16 · Search suggestions | Built with gaps | 4 of 5 | — |
| 17 · Search results page | Built with gaps | 3 of 4 | — |
| 18 · Rate the seller | Built | 4 of 4 | — |
| 19 · Menu with chevrons | Built | 4 of 4 | — |
| 20 · Cart | Built | 7 of 7 | — |
| 21 · Album details without listings | Built with gaps | 3 of 4 | — |
| 22 · Navy header (desktop) | Built | 2 of 2 | — |
| 23 · Buying priorities on the account page | Built | 4 of 4 | — |
| 24 · More genres and a crate row | Built | 6 of 6 | — |
| 25 · Recommendation page polish | Built | 6 of 6 | UX #38, #39, #40, #42, #43 |
| 26 · Change buying priorities | Built with gaps | 5 of 6 | — |
| 27 · Log in without leaving the page | Built with gaps | 5 of 6 | — |
| 28 · One album page for every album | Built with gaps | 4 of 5 | — |
| 29 · A larger log-in window, used for every log-in | Built | 6 of 6 | — |
| 30 · Next steps after "Order placed" | Built with gaps | 4 of 5 | — |
| 31 · Your account in tabs | Built with gaps | 4 of 5 | — |
| 32 · Account button and menu | Built | 4 of 4 | — |
| 33 · "Pressing check" on every listing | Built | 4 of 4 | — |
| 34 · Listen to the album | Built | 3 of 3 | — |

The spec-review register has 0 open findings.

## Outside the MVP
Not counted in the figures above.

### Specified, not in the build order
| Story | Spec file | Status | Note |
|---|---|---|---|
| 35 · A sold record stays in the cart | `specs/stories/story-35-sold-record-stays-in-cart.md` | Built (4 of 4) | Needs a place in the build order (owner decides) |
| 36 · Arrows on the genre row (desktop) | `specs/stories/story-36-genre-row-arrows.md` | Built (3 of 3) | Needs a place in the build order (owner decides) |
| 37 · The header stays on screen while scrolling (desktop) | `specs/stories/story-37-fixed-header.md` | Built (3 of 3) | Needs a place in the build order (owner decides) |
| 38 · No search bar on the purchase and account pages | `specs/stories/story-38-no-search-on-purchase-pages.md` | Built (2 of 2) | Needs a place in the build order (owner decides) |
| 39 · Cancel an order while it is "Paid" | `specs/stories/story-39-cancel-order.md` | Built (5 of 5) | Needs a place in the build order (owner decides) |

### Not in this MVP
| Story | Spec file | What the repo says |
|---|---|---|
| 10 · No title in the repo | None | story-1-search.md: Filters (story 10); story-12-home.md: "All genres and formats" (needs filters, story 10); story-24-genres-crate-row.md: "All genres and formats" (story 10); story-5-listings.md: Messaging the seller ("Ask the seller", story 10) |
| 11 · No title in the repo | None | story-3-recommendation.md: 30-second previews (story 11); story-9-accounts.md: Separate professional accounts / paid plans for shops (after the MVP; "Spindle Pro", story 11) |
| 13 · No title in the repo | None | "Because you like…" with a wishlist (story 12) |

## Gaps (not tested automatically)
- Story 2: Loading mask and error screen with "Try again" (Shared rules)
- Story 3: Loading mask and error screen with "Try again" (Shared rules)
- Story 4: Loading mask and error screen with "Try again" (Shared rules)
- Story 5: Loading mask and error screen with "Try again" on the listings and listing check screens (Shared rules)
- Story 7: Loading mask and error screen on the checkout and the confirmation (Shared rules)
- Story 7: Your account: loading mask and error screen
- Story 8: Loading mask and error screen with "Try again"; the sell form keeps what was typed (Shared rules)
- Story 12: Loading mask and error screen with "Try again" (home sections, genre screen)
- Story 16: Loading mask "Searching…" and an error screen with "Try again" that keeps the typed text (Shared rules)
- Story 17: Loading mask and error screen with "Try again" (Shared rules)
- Story 21: "The details of this album are not available right now." when no source answers
- Story 26: Checked at 375 px and 1280 px; loading mask "Saving…" and error screen with "Try again"
- Story 27: Loading mask and error screen with "Try again"; typing kept
- Story 28: Loading mask and error screen with "Try again" (Shared rules)
- Story 30: Loading mask and error screen with "Try again"; 375 px and 1280 px
- Story 31: Loading mask and error screen with "Try again" per tab
- Bug 29: album details from live MusicBrainz (manual test M25; the automated tests use a local stub)
- Story 34: previews from live iTunes (the automated tests use a local stub)
- Bug 30: real browser or password-manager autofill (the test sets the value without an event; check on the device where it was seen)

## Before the next step
- Only one session at a time runs end-to-end tests (one shared database, port 3000); the 21 Nov full run broke when the dev server dropped
- Feature freeze lifted on 21 Nov only for the user-test feedback (DECISIONS 2026-11-21): all four groups are built. Otherwise no new stories; a problem found in the manual checks becomes a bug (`/log-bug`)
- Bug 29 fixed in part: dates wrong in MusicBrainz itself stay wrong
- Next delivery notes are in ARCHITECTURE.md ("Next delivery")
- Parked by the owner on 14 Nov, not logged yet: signed out, the buyer only learns at "Buy" that an account is needed
