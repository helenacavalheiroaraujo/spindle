<!-- page: https://claude.ai/artifact/W2xGvu3nfNcfcuxAv3hYsn -->
# MVP progress

Updated 2026-11-09 after story 18 (phase 4 closed) · Deadline 15 Nov 2026 · **6 days left**

## Summary
- **Stories:** 14 of 14 MVP stories built (9 with gaps), 0 in progress, 0 not started. Phase 4 is closed: stories 7 (step 3), 17, 4, 16, 15 and 18 are built
- **Tests:** unit 435/435 · end-to-end 229/238 (9 skipped on purpose: tests that only apply to one screen size, and the failed-upload test, which WebKit cannot run) · all pass in this run
- **Demo:** every step from the home page, through the search results page and the comparison, to the order confirmation, the rating and selling, is covered by a passing test; the whole path in one go has not been run as one test or rehearsed, and the draft script (`docs/demo-script.md`) predates stories 15, 16 and 18
- **Next:** the brief items: rehearse and update the demo script, the submission PDF, the 16 manual checks, the push and the online check
- **Risk:** 6 days for the demo rehearsal, the submission PDF, the 16 manual checks, the 12 open UX findings and the online check. Nothing is left in phase 4 to cut. The end-to-end suite passed cleanly in this run (1.5 min); the earlier slowness on the phone was traced to forms filled before the page was ready, fixed in `tests/e2e/checkout.spec.ts` (2026-11-09), but other specs may still show it

## Against the brief
| Criterion | Status | Evidence / what is missing |
|---|---|---|
| 1 · Core features work end to end | Partly | Home page → search (stories 1, 16, 17) or crate → priorities → recommendation → compare → listings → checkout → confirmation → rate the seller, selling and "save to account" are built and tested; not rehearsed as one path |
| 2 · Data tables | Done | `0001_core.sql` to `0007_reviews.sql` committed and described in `docs/database.md` (applied to the cloud database; `reviews` added today) |
| 3 · Testing, automated and manual | Partly | Automated: 435 unit and 229 end-to-end tests pass in this run. Manual: the record exists (`docs/manual-tests.md`, 16 checks) but every check still says "Not run" |
| 4 · LLM good practices in the repo | Done | SPEC.md, `specs/`, CLAUDE.md, ARCHITECTURE.md, DECISIONS.md, `docs/AI_USAGE.md`, tests committed |
| 5 · UX and UI quality | Partly | UX review register: 12 open (all Low, none High or Blocker), 19 resolved. The screens of stories 15, 16 and 18 are new and were not UX-reviewed; the story 4 and 17 screens were not in the last review either |
| 6 · App online and reachable | Not checked | The Vercel address is not in the repo, so the page was not opened. 3 commits are not pushed (`origin/main` is behind `main`) |
| 7 · Live demo | Partly | A draft script exists (`docs/demo-script.md`) but it is not rehearsed and does not cover the menu, the suggestions or the rating |
| S1 · Link to the app | Not checked | Same as criterion 6 |
| S2 · PDF with tables and screenshots | Partly | `docs/database.md`, a submission source (`docs/submission/spindle-submission.md`) and screenshots for every built story in `docs/screenshots/` (regenerated today, with the new header); no PDF for this submission yet (`docs/design/Spindle_mockups_by_section.pdf` is Assignment 1) |

### Missing for the brief, by impact on the grade
1. Update the demo script for stories 15, 16 and 18, and rehearse the whole path including selling, with realistic data (criterion 7)
2. Submission PDF: data tables and screenshots of every screen (S2)
3. Run the 16 manual checks in `docs/manual-tests.md` and fill in the results (criterion 3)
4. Push, give me the Vercel address and confirm it runs the latest version (criterion 6, S1)
5. UX review of the story 4, 15, 16, 17 and 18 screens and decide the open Low findings (criterion 5)

## Build phases
| Phase | Stories | Status |
|---|---|---|
| 1 · Core | 1, 2, 3, 5, 6, 12 | Done with gaps |
| 2 · Purchase | 9 (sign-up, log in), 7, 2 (save to account) | Done with gaps |
| 3 · Seller | 8 | Done with gaps |
| 4 · If time allows | 7 step 3, 17, 4, 18 (rate the seller; replaces the reviews of story 9); then 16, 15 | Done with gaps (all built; 16, 15 and 18 added today) |

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
| 15 · Menu | Built | 3 of 3 | — |
| 18 · Rate the seller | Built | 4 of 4 | — |

## Outside the MVP
Not counted in the figures above.

### Specified, not in the build order
None: story 14 (desktop footer) is outside the MVP (DECISIONS 2026-11-08).

### Not in this MVP
| Story | Spec file | What the repo says |
|---|---|---|
| 14 · Desktop footer | `specs/story-14-footer.md` | Outside the MVP (DECISIONS 2026-11-08); no approved design, links undecided |
| 10 · No title in the repo | None | Filters (story 1, out of scope); "All genres and formats" (story 12, out of scope; the menu of story 15 shows it as "Coming soon"); "Ask the seller" messaging (story 5, out of scope) |
| 11 · No title in the repo | None | 30-second previews (story 3, out of scope); "Spindle Pro" paid plans for shops (story 9, out of scope) |
| 13 · No title in the repo | None | "Because you like…" with a wishlist (story 12, out of scope) |

Stories 10 and 11 are each mentioned with two different meanings; Assignment 1 is the only source for what they are. Story 15's menu also shows "Artists", a future feature with no story number.

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
- Story 4: "exactly one version on sale" is tested by a unit test only; the end-to-end test uses an album with no listings, because the albums with one version are changed by the sell and checkout tests while it runs

## Before the next story can start
- There is no next story: phase 4 is closed. Story 14 is outside the MVP.
- Story 4 left open: a listing opened from the version page goes back to the recommendation, not to the version page (DECISIONS 2026-11-09).
- The manual checks M1–M16 in `docs/manual-tests.md` should be added for stories 15, 16 and 18 if any of their screens cannot be automated (none was found: the menu and the rating are automated).
