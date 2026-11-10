<!-- page: https://claude.ai/artifact/W2xGvu3nfNcfcuxAv3hYsn -->
# MVP progress

Updated 2026-11-10 after the 7 bug fixes (specs/bugs) · Deadline 15 Nov 2026 · **5 days left**

## Summary
- **Stories:** 15 of 16 MVP stories built (9 with gaps), 0 in progress, 1 not started (story 20, cart: no approved design yet). The 7 bugs in `specs/bugs/` are fixed in the code but not committed yet
- **Tests:** unit 453/453 · end-to-end 232/244 (12 skipped on purpose) — all pass. Before the demo data was reset, 52 end-to-end tests failed because the Supabase data had drifted from `supabase/seed.sql`; after running the seed again they passed. One phone test (`sell.spec.ts:181`) failed once and passed on its own, so it is intermittent
- **Demo:** every step from the home page to the order confirmation, the rating and selling is covered by a passing test; the whole path in one go has not been run as one test or rehearsed, and the draft script (`docs/demo-script.md`) predates stories 15, 16, 18 and 19 and the bug fixes. The checkout address is now pre-filled from the last order (bug 6), which has no automated test
- **Next:** commit the bug fixes, then the demo script and rehearsal, the submission PDF and the 16 manual checks; story 20 needs an approved design before it can start
- **Risk:** 5 days for the demo rehearsal, the PDF (screenshots must be regenerated after the layout changes) and the manual checks. If time is short, story 20 (last in phase 4) is cut first. The WebKit phone tests are slow and intermittent in this environment

## Against the brief
| Criterion | Status | Evidence / what is missing |
|---|---|---|
| 1 · Core features work end to end | Partly | Home page → search → priorities → recommendation → compare → listings → checkout → confirmation → rate the seller, selling and "save to account" are built and tested; not rehearsed as one path |
| 2 · Data tables | Done | `0001_core.sql` to `0007_reviews.sql` committed and described in `docs/database.md` |
| 3 · Testing, automated and manual | Partly | Automated: 453 unit and 232 end-to-end tests pass in this run (one intermittent phone failure, see above). Manual: the record exists (`docs/manual-tests.md`, 16 checks) but every check still says "Not run" |
| 4 · LLM good practices in the repo | Done | SPEC.md, `specs/` (story 19 added today), CLAUDE.md, ARCHITECTURE.md, DECISIONS.md, `docs/AI_USAGE.md`, tests committed |
| 5 · UX and UI quality | Partly | UX review register: 1 open finding (Low, #37: 'Soul and funk' on the phone crate) and 1 won't-fix (#35); 35 resolved or closed. The story 19 header and menu, the search in the top row and the 7 bug fixes (hover states, whole-card links, loading under the header, the legend, the wider list) were built after the last review and not re-reviewed |
| 6 · App online and reachable | Not checked | The address is not known. Three earlier Vercel addresses answered "DEPLOYMENT_NOT_FOUND". 1 commit is not pushed (`74e29e8`) |
| 7 · Live demo | Partly | A draft script exists (`docs/demo-script.md`) but it is not rehearsed and does not cover the menu, the suggestions, the rating or the new header |
| S1 · Link to the app | Not checked | Same as criterion 6 |
| S2 · PDF with tables and screenshots | Partly | `docs/database.md`, a submission source (`docs/submission/spindle-submission.md`) and screenshots for every built story in `docs/screenshots/`; most of them predate today's layout and header changes; no PDF for this submission yet |

### Missing for the brief, by impact on the grade
1. Give the Vercel address and check it runs the latest commit (criterion 6, S1)
2. Update the demo script for stories 15, 16, 18 and 19 and the bug fixes and rehearse the whole path including selling, with realistic data (criterion 7)
3. Regenerate the screenshots (`npm run screenshots`) and build the submission PDF: data tables and a screenshot of every screen (S2)
4. Run the 16 manual checks in `docs/manual-tests.md` and fill in the results (criterion 3)
5. Re-review the screens changed today (header, menu, search in the top row, hover states, loading, listings list) with the UX review (criterion 5)

## Build phases
| Phase | Stories | Status |
|---|---|---|
| 1 · Core | 1, 2, 3, 5, 6, 12 | Done with gaps |
| 2 · Purchase | 9 (sign-up, log in), 7, 2 (save to account) | Done with gaps |
| 3 · Seller | 8 | Done with gaps |
| 4 · If time allows | 7 step 3, 17, 4, 18; then 16, 15, 19, 20 | Done with gaps (all built except story 20, not started) |

## Stories
| Story | Status | Requirements with automated test | Open findings |
|---|---|---|---|
| 1 · Search for an album | Built | 6 of 6 | — |
| 2 · Say what matters to me | Built with gaps | 6 of 7 | #46, #47 |
| 3 · Get one recommendation | Built with gaps | 8 of 9 | #47, #51, #52, #53, #56 |
| 5 · See verified listings | Built with gaps | 10 of 11 | #47, #60, #61, #62 |
| 6 · Fair price | Built | 4 of 4 | #63 |
| 9 · Sign up, log in | Built | 4 of 4 | — |
| 7 · Buy with protection | Built with gaps | 9 of 11 | #61 |
| 8 · Sell a record for free | Built with gaps | 13 of 14 | — |
| 12 · Home page | Built with gaps | 4 of 5 | — |
| 17 · Search results page | Built with gaps | 3 of 4 | — |
| 4 · Compare versions | Built with gaps | 6 of 7 | — |
| 16 · Search suggestions | Built with gaps | 4 of 5 | — |
| 15 · Menu | Built | 3 of 3 | — (desktop part replaced by story 19) |
| 18 · Rate the seller | Built | 4 of 4 | — |
| 19 · Menu with chevrons | Built | 4 of 4 | — |
| 20 · Cart | Not started | 0 of 0 | — |

## Outside the MVP
Not counted in the figures above.

### Specified, not in the build order
None: story 14 (desktop footer) is outside the MVP (DECISIONS 2026-11-08).

### Not in this MVP
| Story | Spec file | What the repo says |
|---|---|---|
| 14 · Desktop footer | `specs/stories/story-14-footer.md` | Outside the MVP (DECISIONS 2026-11-08); no approved design, links undecided |
| 10 · No title in the repo | None | Filters (story 1, out of scope); "All genres and formats" (story 12, out of scope; the menu shows it as "Soon"); "Ask the seller" messaging (story 5, out of scope) |
| 11 · No title in the repo | None | 30-second previews (story 3, out of scope); "Spindle Pro" paid plans for shops (story 9, out of scope) |
| 13 · No title in the repo | None | "Because you like…" with a wishlist (story 12, out of scope) |

Stories 10 and 11 are each mentioned with two different meanings; Assignment 1 is the only source for what they are. The menu's "Artists" is a future feature with no story number.

## Gaps (not tested automatically)
Every gap below points to a manual check in `docs/manual-tests.md` (none has been run yet). Gaps stay listed here because they are not automated.
- Story 2: loading mask and error screen of the priorities screen (M1)
- Story 3: loading mask and error screen of the recommendation (M2)
- Story 4: loading masks and error screens of the comparison and the version page (M15, M16)
- Story 5: loading masks and error screens of the listings and listing check screens (M3, M4)
- Story 7: loading masks and error screens of the checkout and the confirmation (M5, M6); step 3 "Confirming…" mask and the Your account screen (M13)
- Story 8: loading masks and error screens of the sell screens and My listings (M7, M8, M9); the sell form keeps what was typed after a failed publish (M12); a failed photo upload on a phone (M11)
- Story 12: loading mask and error screen of the genre screen (M10)
- Story 16: the loading mask "Searching…" of the suggestion box (too short to catch automatically); the error screen is tested
- Story 17: loading mask and error screen of the results page (M14)
- Story 4: "exactly one version on sale" is tested by a unit test only

## Before the next story can start
- Story 20 (cart) is the only story left: its screens (the cart, the "Cart" cell in the menu and "Add to cart" next to "Buy") have no approved design (CLAUDE.md step 1b).
- The 7 bug fixes are built and tested but not committed; their DECISIONS entries and the `docs/AI_USAGE.md` row are written and wait for the commit.
- Bug 6 (checkout address pre-filled from the last order) has no automated test.
- Story 4 left open: a listing opened from the version page goes back to the recommendation, not to the version page (DECISIONS 2026-11-09).
