<!-- page: https://claude.ai/artifact/W2xGvu3nfNcfcuxAv3hYsn -->
# MVP progress

Updated 2026-11-10 after story 19 (menu with chevrons) · Deadline 15 Nov 2026 · **5 days left**

## Summary
- **Stories:** 15 of 15 MVP stories built (9 with gaps), 0 in progress, 0 not started. Story 19 (menu with chevrons, replaces the desktop menu of story 15) is built and tested; its header-search placement change of today is not committed yet
- **Tests:** unit 443/443 · end-to-end 230/244 (12 skipped on purpose) — in the full run 2 phone tests failed (`listingCheck.spec.ts:56`, `sell.spec.ts:181`); both passed when run again on their own, so they are intermittent, not fixed
- **Demo:** every step from the home page to the order confirmation, the rating and selling is covered by a passing test; the whole path in one go has not been run as one test or rehearsed, and the draft script (`docs/demo-script.md`) predates stories 15, 16, 18 and 19. **There is no working online address today**
- **Next:** put the app online (criterion 6 and the link S1 are missing), then the demo script and rehearsal, the submission PDF, the 16 manual checks
- **Risk:** 5 days for a deployment that does not exist yet, the demo rehearsal, the PDF (screenshots must be regenerated after today's layout changes) and the manual checks. Nothing is left in phase 4 to cut. The WebKit phone tests are slow and intermittent in this environment

## Against the brief
| Criterion | Status | Evidence / what is missing |
|---|---|---|
| 1 · Core features work end to end | Partly | Home page → search → priorities → recommendation → compare → listings → checkout → confirmation → rate the seller, selling and "save to account" are built and tested; not rehearsed as one path |
| 2 · Data tables | Done | `0001_core.sql` to `0007_reviews.sql` committed and described in `docs/database.md` |
| 3 · Testing, automated and manual | Partly | Automated: 443 unit and 230 end-to-end tests pass in this run (2 intermittent phone failures, see above). Manual: the record exists (`docs/manual-tests.md`, 16 checks) but every check still says "Not run" |
| 4 · LLM good practices in the repo | Done | SPEC.md, `specs/` (story 19 added today), CLAUDE.md, ARCHITECTURE.md, DECISIONS.md, `docs/AI_USAGE.md`, tests committed |
| 5 · UX and UI quality | Partly | UX review register: 0 open findings (36 resolved or closed, iteration 6, 2026-11-09). The story 19 header and menu and the search moved to the top row were built after that review and not re-reviewed |
| 6 · App online and reachable | Missing | The three Vercel addresses tried (`spindle-bb78`, `spindle-d79u`, `spindle-ifrk`) all answer "DEPLOYMENT_NOT_FOUND": the projects were deleted. A new deployment is being set up; its address is not known. All commits are pushed (`99c18e8` on `origin/main`) |
| 7 · Live demo | Partly | A draft script exists (`docs/demo-script.md`) but it is not rehearsed and does not cover the menu, the suggestions, the rating or the new header |
| S1 · Link to the app | Missing | Same as criterion 6 |
| S2 · PDF with tables and screenshots | Partly | `docs/database.md`, a submission source (`docs/submission/spindle-submission.md`) and screenshots for every built story in `docs/screenshots/`; most of them predate today's layout and header changes; no PDF for this submission yet |

### Missing for the brief, by impact on the grade
1. Put the app online and check it: a working Vercel project with the three variables (`SUPABASE_SECRET_KEY` from line 5 of `.env.local`, not line 3), open it, confirm it runs the latest commit, give me the address (criterion 6, S1)
2. Update the demo script for stories 15, 16, 18 and 19 and rehearse the whole path including selling, with realistic data (criterion 7)
3. Regenerate the screenshots (`npm run screenshots`) and build the submission PDF: data tables and a screenshot of every screen (S2)
4. Run the 16 manual checks in `docs/manual-tests.md` and fill in the results (criterion 3)
5. Re-review the screens changed today (header, menu, search in the top row) with the UX review (criterion 5)

## Build phases
| Phase | Stories | Status |
|---|---|---|
| 1 · Core | 1, 2, 3, 5, 6, 12 | Done with gaps |
| 2 · Purchase | 9 (sign-up, log in), 7, 2 (save to account) | Done with gaps |
| 3 · Seller | 8 | Done with gaps |
| 4 · If time allows | 7 step 3, 17, 4, 18; then 16, 15, 19 | Done with gaps (all built) |

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

## Outside the MVP
Not counted in the figures above.

### Specified, not in the build order
None: story 14 (desktop footer) is outside the MVP (DECISIONS 2026-11-08).

### Not in this MVP
| Story | Spec file | What the repo says |
|---|---|---|
| 14 · Desktop footer | `specs/story-14-footer.md` | Outside the MVP (DECISIONS 2026-11-08); no approved design, links undecided |
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
- There is no next story: phase 4 is closed and story 19 is built. Story 14 is outside the MVP.
- Story 19: today's change (search in the top row between the logo and the menu on every page except the home page; under 1280 px the search keeps its own row) is built and tested but not committed, and its DECISIONS entry waits for the Product Owner's yes.
- Story 4 left open: a listing opened from the version page goes back to the recommendation, not to the version page (DECISIONS 2026-11-09).
