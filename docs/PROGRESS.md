<!-- page: https://claude.ai/artifact/W2xGvu3nfNcfcuxAv3hYsn -->
# MVP progress

Updated 2026-11-10 after story 14 (desktop footer) · Deadline 15 Nov 2026 · **5 days left**

## Summary
- **Stories:** 17 of 17 MVP stories built: 8 built, 9 built with gaps, 0 in progress, 0 not started. Story 14 (desktop footer) is built and its tests pass at both sizes. Story 21 (album details) is outside the MVP counts (see below)
- **Tests:** unit 604/604 (33 files) · end-to-end (full run) 291 passed, **11 failed**, 4 did not run, 18 skipped. Rerun of the 8 files with failures, one worker at a time: 90 passed, 2 failed, 8 skipped. The 2 that still fail are phone tests (see Gaps). **Not all green.**
- **Demo:** the path from the home page to the order confirmation is covered by tests, but it is not green on every run. The home page's "This weekend" album changes with the data other tests create on the shared database, so "See which to buy" can open a different album than the test expects. The whole path has not been run as one rehearsed walk-through
- **Next:** make the shared-data tests stable (home "This weekend", sell price test selector), then rehearse the demo path once end to end
- **Risk:** 5 days for test stability, the rehearsal, the PDF and the manual checks. Nothing built is cut: all MVP stories are in. If the time runs out, the first thing to drop is a secondary test fix, not a story; the demo path must be green before the PDF

## Against the brief
| Criterion | Status | Evidence / what is missing |
|---|---|---|
| 1 · Core features work end to end | Partly | Every step of the path has a passing test in some runs; the path is not stable on the shared database (see Summary) |
| 2 · Data tables | Not checked this run | Last report: migrations `0001_core.sql` to `0009_cart.sql` committed and described in `docs/database.md`. Not re-read in this run |
| 3 · Testing, automated and manual | Partly | Automated: unit 604/604; end-to-end not all green (see Summary). Manual: `docs/manual-tests.md` exists; its results were not re-checked in this run |
| 4 · LLM good practices in the repo | Not checked this run | Last report: SPEC.md, `specs/`, CLAUDE.md, ARCHITECTURE.md, DECISIONS.md, `docs/AI_USAGE.md`, tests, all committed |
| 5 · UX and UI quality | Not checked this run | The UX register was not re-read in this run. The phone home screenshot shows "Soul and funk" over the record graphic in the crate |
| 6 · App online and reachable | Done | `https://spindle-three.vercel.app` opened without a login on 2026-11-10; it shows the home page and the story 14 footer, so the commit with the footer is deployed |
| 7 · Live demo | Partly | The draft script in `docs/demo-script.md` predates stories 14–20 and the bug fixes; no rehearsal recorded |
| S1 · Link to the app | Done | `https://spindle-three.vercel.app`; confirm it is the Production address in Vercel before submitting |
| S2 · PDF with tables and screenshots | Partly | Screenshots exist for built stories, including `docs/screenshots/story-14/`; some predate recent layout changes; no PDF yet |

### Missing for the brief, by impact on the grade
1. Make the end-to-end path reliable on the shared database, and fix the phone test that matches Next.js's route announcer (criterion 1, 3)
2. Rehearse the demo once, from the home page to the confirmation, with the updated script (criterion 7)
3. Build the submission PDF with the data tables and screenshots of each screen (S2)
4. Run the manual checks in `docs/manual-tests.md` and record the results (criterion 3)
5. Check the data tables and the LLM practices files were not changed since the last report (criteria 2, 4)
6. Re-review the screens changed since the last UX review (criterion 5)

## Build phases
| Phase | Stories | Status |
|---|---|---|
| 1 · Core | 1, 2, 3, 5, 6, 12 | Done with gaps |
| 2 · Purchase | 9 (sign-up, log in), 7, 2 (save to account) | Done with gaps |
| 3 · Seller | 8 | Done with gaps |
| 4 · If time allows | 7 step 3, 17, 4, 18; then 16, 15, 19, 20, 14 | Done with gaps (all built) |

## Stories
| Story | Status | Requirements with automated test | Open findings |
|---|---|---|---|
| 1 · Search for an album | Built | 6 of 6 | — |
| 2 · Say what matters to me | Built with gaps | 6 of 7 | #46, #47 |
| 3 · Get one recommendation | Built with gaps | 8 of 9 | #47, #51, #52, #53, #56 |
| 4 · Compare versions | Built with gaps | 6 of 7 | — |
| 5 · See verified listings | Built with gaps | 10 of 11 | #47, #60, #62 |
| 6 · Fair price | Built | 4 of 4 | #63 |
| 7 · Buy with protection | Built with gaps | 9 of 11 | — |
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

## Outside the MVP
Not counted in the figures above.

### Specified, not in the build order
| Story | Spec file | Status | Note |
|---|---|---|---|
| 21 · Album details without listings | `specs/stories/story-21-album-details.md` | Built with gaps (3 of 4) | Needs a place in the build order; you decide. Its "details not available" message is not tested automatically |

### Not in this MVP
| Story | Spec file | What the repo says |
|---|---|---|
| 10 · No title in the repo | None | Filters (story 1, out of scope); "All genres and formats" (story 12, out of scope; the menu shows it as "Soon"); "Ask the seller" messaging (story 5, out of scope) |
| 11 · No title in the repo | None | 30-second previews (story 3, out of scope); "Spindle Pro" paid plans for shops (story 9, out of scope) |
| 13 · No title in the repo | None | "Because you like…" with a wishlist (story 12, out of scope) |

## Tests in this run (2026-11-10)
- **Unit (Vitest):** 604 passed, 0 failed (33 files)
- **End-to-end, full run:** 291 passed, 11 failed, 4 did not run, 18 skipped (the skips are the tests that run only on one size)
- **End-to-end, the 8 files with failures, one worker:** 90 passed, 2 failed, 8 skipped
- **Footer (story 14):** 4 passed at each size (the other 4 are skipped on each size by design)

## Gaps (not tested automatically)
- Story 2: loading mask and error screen with "Try again" (shared rules)
- Story 3: loading mask and error screen with "Try again" (shared rules)
- Story 4: loading mask and error screen with "Try again" (shared rules)
- Story 5: loading mask and error screen with "Try again" on the listings and listing check screens
- Story 7: loading mask and error screen on checkout and confirmation; "Confirming…" mask and error screen on the card; Your account loading and error screens
- Story 8: loading mask and error screen with "Try again"; the sell form keeps what was typed
- Story 12: loading mask and error screen with "Try again" (genre screen)
- Story 16: "Searching…" mask and error screen that keeps the typed text
- Story 17: loading mask and error screen with "Try again"
- Story 21: "The details of this album are not available right now." when no source answers

## Failing tests (this run)
- `tests/e2e/home.spec.ts`: "This weekend" and "showcase genres" tests: depend on which album the home page features, which other tests change on the shared database
- `tests/e2e/checkout.spec.ts`, `tests/e2e/cart.spec.ts`: "Pay" tests: the full run failed; not reproduced in the one-worker rerun
- `tests/e2e/sell.spec.ts`: "price: typical range" (phone): `getByRole("alert")` also matches Next.js's route announcer, so the strict locator fails. A test-selector fix, not a product bug
- Other failures in the full run (account, login, menu, my listings, sell place) did not reproduce in the one-worker rerun

## Before the next story can start
- Story 21 needs a place in the build order (your decision)
- Open findings to decide: none for the MVP stories beyond those listed in the Stories table
- Pending: stabilise the shared-data tests before the demo rehearsal
