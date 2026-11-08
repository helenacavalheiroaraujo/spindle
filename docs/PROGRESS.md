<!-- page: https://claude.ai/artifact/W2xGvu3nfNcfcuxAv3hYsn -->
# MVP progress

Updated 2026-11-08 on request · Deadline 15 Nov 2026 · **7 days left**

## Summary
- **Stories:** 9 of 10 MVP stories built (6 with gaps), 0 in progress, 1 not started (4, phase 4)
- **Tests:** unit 313/313 · end-to-end 163/168 (5 skipped: 4 desktop-only tests on the phone run, and the failed-upload test, which WebKit cannot run) — all pass in this run
- **Demo:** every step from the home page to the order confirmation, and selling, is covered by a passing test; the whole path in one go has not been run as one test or rehearsed
- **Next:** the brief items: demo script, submission PDF, manual test run, push and online check
- **Risk:** 7 days for the demo script, the submission PDF, the 12 manual checks, the open UX findings and the online check. Phase 4 (story 4, story 7 step 3, story 9 reviews) is the first thing to cut

## Against the brief
| Criterion | Status | Evidence / what is missing |
|---|---|---|
| 1 · Core features work end to end | Partly | Home page → search or crate → priorities → recommendation → listings → checkout → confirmation, selling (story 8) and "save to account" (story 2) built and tested; not rehearsed as one path |
| 2 · Data tables | Done | `0001_core.sql` to `0006_genres.sql` committed and described in `docs/database.md` |
| 3 · Testing, automated and manual | Partly | Automated: 313 unit and 163 end-to-end, all pass in this run. Manual: the record exists (`docs/manual-tests.md`, 12 checks M1–M12) but every check still says "Not run" |
| 4 · LLM good practices in the repo | Done | SPEC.md, `specs/`, CLAUDE.md, ARCHITECTURE.md, DECISIONS.md, `docs/AI_USAGE.md`, tests committed |
| 5 · UX and UI quality | Partly | UX review register: 15 open (all Low, none High or Blocker), 5 resolved (1 Blocker, 4 High). Story 8 and story 12 screens were not part of the last review |
| 6 · App online and reachable | Not checked | The Vercel address is not in the repo, so the page was not opened. 1 commit is not pushed (`git log origin/main..main`) |
| 7 · Live demo | Missing | No demo script in the repo; not rehearsed |
| S1 · Link to the app | Not checked | Same as criterion 6 |
| S2 · PDF with tables and screenshots | Partly | `docs/database.md` exists; screenshots in `docs/screenshots/` for stories 2, 7, 8, 9 and 12 only; no PDF for this submission yet (`docs/design/Spindle_mockups_by_section.pdf` is Assignment 1) |

### Missing for the brief, by impact on the grade
1. Demo script and one rehearsal of the whole path, including selling, with realistic data (criterion 7)
2. Submission PDF: data tables and screenshots of every screen, including stories 1, 3, 5, 6 (S2)
3. Run the 12 manual checks in `docs/manual-tests.md` and fill in the results (criterion 3)
4. Push, give me the Vercel address and confirm it runs the latest version (criterion 6, S1)
5. UX review of the story 8 and story 12 screens and decide the 15 open Low findings (criterion 5)
6. Phase 4 (story 4, story 7 step 3, story 9 reviews): cut

## Build phases
| Phase | Stories | Status |
|---|---|---|
| 1 · Core | 1, 2, 3, 5, 6, 12 | Done with gaps |
| 2 · Purchase | 9 (sign-up, log in), 7, 2 (save to account) | Done with gaps |
| 3 · Seller | 8 | Done with gaps |
| 4 · If time allows | 7 step 3, 4, 9 (reviews) | Not started |

## Stories
| Story | Status | Requirements with automated test | Open findings |
|---|---|---|---|
| 1 · Search for an album | Built | 6 of 6 | #42–#45 |
| 2 · Say what matters to me | Built with gaps | 6 of 7 | #46, #47 |
| 3 · Get one recommendation | Built with gaps | 8 of 9 | #47, #51–#54, #56 |
| 5 · See verified listings | Built with gaps | 10 of 11 | #47, #60–#62 |
| 6 · Fair price | Built | 4 of 4 | #63 |
| 9 · Sign up, log in | Built | 4 of 4 | #65, #67–#69 |
| 7 · Buy with protection | Built with gaps | 7 of 8 | #61 |
| 8 · Sell a record for free | Built with gaps | 13 of 14 | — |
| 12 · Home page | Built with gaps | 4 of 5 | — |
| 4 · Compare versions | Not started | — | #14, #26 |

## Gaps (not tested automatically)
Every gap below points to a manual check in `docs/manual-tests.md` (none has been run yet). Gaps stay listed here because they are not automated.
- Story 2: loading mask and error screen of the priorities screen (M1)
- Story 3: loading mask and error screen of the recommendation (M2)
- Story 5: loading masks and error screens of the listings and listing check screens (M3, M4)
- Story 7: loading masks and error screens of the checkout and the confirmation (M5, M6)
- Story 8: loading masks and error screens of the sell screens and My listings (M7, M8, M9); the sell form keeps what was typed after a failed publish (M12); a failed photo upload on a phone (M11)
- Story 12: loading mask and error screen of the genre screen (M10)

## Before the next story can start
- Story 4 (phase 4): findings #14 and #26 open; recommended to cut.
