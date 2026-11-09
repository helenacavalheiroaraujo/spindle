<!-- page: https://claude.ai/artifact/W2xGvu3nfNcfcuxAv3hYsn -->
# MVP progress

Updated 2026-11-09 on request · Deadline 15 Nov 2026 · **6 days left**

## Summary
- **Stories:** 11 of 13 MVP stories built (8 with gaps), 0 in progress, 2 not started (15 and 16, only if time is left). Story 9 "reviews" is not built and has no story text yet
- **Tests:** unit 369/369 · end-to-end 191/196 in the last clean run (5 skipped: 4 desktop-only tests on the phone run, and the failed-upload test, which WebKit cannot run). The runs of this report were not all clean: of the last two full runs after restarting the dev server, one passed 191 and one had 5 time-outs (30 s) on the phone in unrelated tests; those 27 tests pass when run alone. Earlier today, left-over test data in the database (1 test user, 1 listing) also broke tests; it was removed
- **Demo:** every step from the home page, through the search results page and the comparison, to the order confirmation, and selling, is covered by a passing test; the whole path in one go has not been run as one test or rehearsed
- **Next:** story 9 (reviews) has no story text, no criteria and no design, so it cannot start; stories 16 and 15 are "only if time is left". The brief items (demo script, submission PDF, manual test run, push and online check) come first by impact on the grade
- **Risk:** 6 days for the demo script, the submission PDF, the 16 manual checks, the open UX findings and the online check. What is left in phase 4 (story 9 reviews) and stories 16 and 15 are the first things to cut. The end-to-end suite is intermittently slow on the phone (time-outs in unrelated tests, one full run in two); it needs a look before the demo

## Against the brief
| Criterion | Status | Evidence / what is missing |
|---|---|---|
| 1 · Core features work end to end | Partly | Home page → search results page (story 17) or crate → priorities → recommendation → compare (story 4) → listings → checkout → confirmation, selling (story 8) and "save to account" (story 2) built and tested; not rehearsed as one path |
| 2 · Data tables | Done | `0001_core.sql` to `0006_genres.sql` committed and described in `docs/database.md`; story 4 needed no new table |
| 3 · Testing, automated and manual | Partly | Automated: 369 unit pass; 191 end-to-end pass in a clean run, but not in every run (see Summary). Manual: the record exists (`docs/manual-tests.md`, 16 checks) but every check still says "Not run" |
| 4 · LLM good practices in the repo | Done | SPEC.md, `specs/`, CLAUDE.md, ARCHITECTURE.md, DECISIONS.md, `docs/AI_USAGE.md`, tests committed |
| 5 · UX and UI quality | Partly | UX review register: 17 open (all Low, none High or Blocker), 6 resolved (1 Blocker, 4 High, 1 Low). The story 4 screens (comparison and version page) and story 17 results page were not part of the last review |
| 6 · App online and reachable | Not checked | The Vercel address is not in the repo, so the page was not opened. all commits are pushed (`origin/main` = `main` since 2026-11-09) |
| 7 · Live demo | Missing | No demo script in the repo; not rehearsed |
| S1 · Link to the app | Not checked | Same as criterion 6 |
| S2 · PDF with tables and screenshots | Partly | `docs/database.md` exists; screenshots in `docs/screenshots/` for stories 2, 4, 7, 8, 9, 12 and 17 only; none for stories 1, 3, 5, 6; no PDF for this submission yet (`docs/design/Spindle_mockups_by_section.pdf` is Assignment 1) |

### Missing for the brief, by impact on the grade
1. Demo script and one rehearsal of the whole path, including selling, with realistic data (criterion 7)
2. Submission PDF: data tables and screenshots of every screen, including stories 1, 3, 5, 6 (S2)
3. Run the 16 manual checks in `docs/manual-tests.md` and fill in the results (criterion 3)
4. Give me the Vercel address and confirm it runs the latest version; everything is pushed (criterion 6, S1)
5. UX review of the story 4, 8, 12 and 17 screens and decide the 17 open Low findings (criterion 5)
6. Phase 4: story 9 reviews (needs story text and a design first) and stories 16 and 15: cut

## Build phases
| Phase | Stories | Status |
|---|---|---|
| 1 · Core | 1, 2, 3, 5, 6, 12 | Done with gaps |
| 2 · Purchase | 9 (sign-up, log in), 7, 2 (save to account) | Done with gaps |
| 3 · Seller | 8 | Done with gaps |
| 4 · If time allows | 7 step 3, 17, 4, 9 (reviews); then 16, 15 only if time is left | In progress (7 step 3, 17 and 4 built; 9 reviews not specified; 16 and 15 not started) |

## Stories
| Story | Status | Requirements with automated test | Open findings |
|---|---|---|---|
| 1 · Search for an album | Built | 6 of 6 | — |
| 2 · Say what matters to me | Built with gaps | 6 of 7 | #46, #47 |
| 3 · Get one recommendation | Built with gaps | 8 of 9 | #47, #51–#53, #56 |
| 4 · Compare versions | Built with gaps | 6 of 7 | — |
| 5 · See verified listings | Built with gaps | 10 of 11 | #47, #60–#62 |
| 6 · Fair price | Built | 4 of 4 | #63 |
| 9 · Sign up, log in | Built (reviews not built) | 4 of 4 | #65, #67–#69 |
| 7 · Buy with protection | Built with gaps | 9 of 11 | #61 |
| 8 · Sell a record for free | Built with gaps | 13 of 14 | — |
| 12 · Home page | Built with gaps | 4 of 5 | — |
| 17 · Search results page | Built with gaps | 3 of 4 | — |
| 16 · Search suggestions | Not started | — | — |
| 15 · Menu | Not started | — | — |

## Outside the MVP
Not counted in the figures above.

### Specified, not in the build order
None: story 14 (desktop footer) is outside the MVP (DECISIONS 2026-11-08); stories 15 and 16 are in phase 4, "only if time is left".

### Not in this MVP
| Story | Spec file | What the repo says |
|---|---|---|
| 14 · Desktop footer | `specs/story-14-footer.md` | Outside the MVP (DECISIONS 2026-11-08); no approved design, links undecided |
| 10 · No title in the repo | None | Filters (story 1, out of scope); "All genres and formats" (story 12, out of scope); "Ask the seller" messaging (story 5, out of scope) |
| 11 · No title in the repo | None | 30-second previews (story 3, out of scope); "Spindle Pro" paid plans for shops (story 9, out of scope) |
| 13 · No title in the repo | None | "Because you like…" with a wishlist (story 12, out of scope) |

Stories 10 and 11 are each mentioned with two different meanings; Assignment 1 is the only source for what they are.

## Gaps (not tested automatically)
Every gap below points to a manual check in `docs/manual-tests.md` (none has been run yet). Gaps stay listed here because they are not automated.
- Story 2: loading mask and error screen of the priorities screen (M1)
- Story 3: loading mask and error screen of the recommendation (M2)
- Story 4: loading masks and error screens of the comparison and the version page (M15, M16)
- Story 5: loading masks and error screens of the listings and listing check screens (M3, M4)
- Story 7: loading masks and error screens of the checkout and the confirmation (M5, M6); step 3 "Confirming…" mask and the Your account screen (M13)
- Story 8: loading masks and error screens of the sell screens and My listings (M7, M8, M9); the sell form keeps what was typed after a failed publish (M12); a failed photo upload on a phone (M11)
- Story 12: loading mask and error screen of the genre screen (M10)
- Story 17: loading mask and error screen of the results page (M14)
- Story 4: "exactly one version on sale" is tested by a unit test only; the end-to-end test uses an album with no listings, because the albums with one version are changed by the sell and checkout tests while it runs

## Before the next story can start
- Story 9 (reviews): there is no story text, no acceptance criteria and no design; it needs a new story file (a built story's file is not changed) before it can start. Recommended to cut for time.
- Story 16: needs its own findings listed and decided before it starts; story 15 has no approved design.
- Story 4 left open: a listing opened from the version page goes back to the recommendation, not to the version page (DECISIONS 2026-11-09); the story 4 screens still need the UX review.
