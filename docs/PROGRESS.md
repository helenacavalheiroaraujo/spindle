<!-- page: https://claude.ai/artifact/W2xGvu3nfNcfcuxAv3hYsn -->
# MVP progress

Updated 2026-11-11 on request · Deadline 15 Nov 2026 · **4 days left**

## Summary
- **Stories:** 9 of 19 MVP stories built (9 with gaps), 0 in progress, 1 not started (story 24: code is committed, but it has no Traceability rows yet)
- **Tests:** unit 614/614 · end-to-end **not run** (the run could not start, see below). Last recorded run, 10 Nov: 310 passed, 4 failed, 22 skipped
- **Demo:** not verified in this run. The last recorded run failed on the home page (story 24 tests). The first step at risk is step 1, home page
- **Next:** story 24 · finish or cut. Its design is approved (option C) and its code is committed; the Traceability rows and a passing home-page test run are missing
- **Risk:** 4 days left, with 1 MVP story not started, 16 manual test rows not run, the submission PDF not made and the demo not rehearsed. The "If time allows" list is cut first, from the end: story 24, then 22, 14, 20, 19, 15, 16. The manual checks, the PDF and the rehearsal come before any story

## Against the brief
| Criterion | Status | Evidence / what is missing |
|---|---|---|
| 1 · Core features work end to end | Partly | Unit tests pass. End-to-end not run in this report (it could not start). Last recorded run had 4 failing home-page tests. Phase 1 and 2 stories are built with gaps |
| 2 · Data tables | Partly | `supabase/migrations/` 0001–0012 are committed. `docs/database.md` covers up to 0011; migration 0012 (story 24, Classical) is not in it, though its header says it is described there. Keys not checked in this run |
| 3 · Testing, automated and manual | Partly | Automated: unit 614/614; end-to-end not run in this report. Manual: all 16 rows (M1–M16) in `docs/manual-tests.md` are "Not run" |
| 4 · LLM good practices in the repo | Partly | SPEC.md, `specs/`, CLAUDE.md, DECISIONS.md, `docs/AI_USAGE.md` and the tests exist. Uncommitted at this run: DECISIONS.md, `docs/AI_USAGE.md`, the story 25 file and three design files |
| 5 · UX and UI quality | Partly | `docs/ux-review/findings.json`: 43 entries, 7 open (2 Medium: #38, #39; 5 Low: #37, #40, #41, #42, #43). No open High or Blocker |
| 6 · App online and reachable | Not checked | Online address not opened in this run |
| 7 · Live demo | Partly | `docs/demo-script.md` exists, marked DRAFT. Not rehearsed. Address still a placeholder |
| S1 · Link to the running app | Not checked | Same as criterion 6 |
| S2 · PDF with data tables and screenshots | Missing | No PDF in the repo. `docs/submission/spindle-submission.md` (Markdown, with sections for data tables and screenshots) exists; its content was not checked in this run |

### Missing for the brief, by impact on the grade
1. Run the end-to-end suite and the 5-minute path on one dev server. Fix the home-page tests if they still fail (story 24 work).
2. Submission PDF (S2): data tables and screenshots of the web app. None exists yet.
3. Manual test record: rows M1–M16 in `docs/manual-tests.md` are "Not run".
4. Demo: rehearse `docs/demo-script.md` once; add the address when it is known.
5. Story 24: decide finish or cut; add its Traceability rows.
6. `docs/database.md`: add migration 0012 before the PDF is made.
7. Criteria 6 and S1: online check of the latest version.

## Build phases
| Phase | Stories | Status |
|---|---|---|
| 1 · Core | 1, 2, 3, 5, 6, 12 | Done with gaps (manual checks M1–M4, M10 not run) |
| 2 · Purchase | 9 (sign-up, log in), 7, 2 (save to account) | Done with gaps (manual checks M5, M6, M13 not run). Save to account: its rows are tested |
| 3 · Seller | 8 | Done with gaps (manual checks M7–M9, M11, M12 not run) |
| 4 · If time allows | 7 step 3, 17, 4, 18, 16, 15, 19, 20, 14, 22, 24 | In progress: 7 built (7 step 3, 18, 15, 19, 20, 14, 22), 3 with gaps (17, 4, 16), 1 not started (24) |

## Stories
| Story | Status | Requirements with automated test | Open findings |
|---|---|---|---|
| 1 · Search for an album | Built | 6 of 6 | — |
| 2 · Say what matters to me | Built with gaps | 6 of 7 | #46, #47 |
| 3 · Get one recommendation | Built with gaps | 8 of 9 | #47, #51, #52, #53, #56 |
| 4 · Compare versions (phase 4) | Built with gaps | 6 of 7 | — |
| 5 · See verified listings | Built with gaps | 10 of 11 | #47, #60, #62 |
| 6 · Fair price | Built | 4 of 4 | #63 |
| 7 · Buy with protection | Built with gaps | 9 of 11 | — |
| 8 · Sell a record for free (phase 3) | Built with gaps | 13 of 14 | — |
| 9 · Sign up, log in (reviews in phase 4) | Built | 4 of 4 | — |
| 12 · Home page | Built with gaps | 4 of 5 | — |
| 14 · Desktop footer | Built | 2 of 2 | — |
| 15 · Menu | Built | 3 of 3 | — |
| 16 · Search suggestions | Built with gaps | 4 of 5 | — |
| 17 · Search results page | Built with gaps | 3 of 4 | — |
| 18 · Rate the seller (phase 4) | Built | 4 of 4 | — |
| 19 · Menu with chevrons | Built | 4 of 4 | — |
| 20 · Cart | Built | 7 of 7 | — |
| 22 · Navy header (desktop) | Built | 2 of 2 | — |
| 24 · More genres and a crate row | Not started | 0 of 0 | — |

Story 24 is "Not started" by the rule (no Traceability rows). Its code is in commit `8481447`, with migration `0012_classical_genre.sql` and the approved crate-row design.

## Outside the MVP
Not counted in the figures above.

### Specified, not in the build order
| Story | Spec file | Status | Note |
|---|---|---|---|
| 21 · Album details without listings | `specs/stories/story-21-album-details.md` | Built with gaps (3 of 4 tested) | Needs a place in the build order (the user decides) |
| 23 · Buying priorities on the account page | `specs/stories/story-23-account-priorities.md` | Built with gaps (3 of 4 tested) | Needs a place in the build order (the user decides) |
| 25 · Recommendation page polish | `specs/stories/story-25-recommendation-polish.md` | Not started | Design approved 11 Nov (option A4). Story file and design files are uncommitted. Needs a place in the build order (the user decides) |

### Not in this MVP
| Story | Spec file | What the repo says |
|---|---|---|
| 10 · No title in the repo | None (no story file yet) | Filters (story 1); "All genres and formats" (stories 12, 24); "Ask the seller" (story 5) |
| 11 · No title in the repo | None (no story file yet) | 30-second previews (story 3); Spindle Pro paid plans (story 9) |
| 13 · No title in the repo | None (no story file yet) | Wishlist, "Because you like…" (story 12) |

## Gaps (not tested automatically)
- Story 2: loading mask and error screen with "Try again" (M1)
- Story 3: loading mask and error screen with "Try again" (M2)
- Story 4: loading mask and error screen with "Try again" (M15, M16)
- Story 5: loading mask and error screen on the listings and the listing check (M3, M4)
- Story 7: loading mask and error screen on the checkout and the confirmation (M5, M6); "Confirming…" mask and the Your account loading and error screens (M13)
- Story 8: loading mask and error screens; the sell form keeps what was typed (M7, M8, M9, M11, M12). The photo upload failure is tested on desktop only (M11, phone)
- Story 12: loading mask and error screen on the genre screen (M10)
- Story 16: "Searching…" mask and error screen that keeps the typed text
- Story 17: loading mask and error screen with "Try again" (M14)
- Story 20: the row for the error screens says "not run automatically in this run", but the script counts the row as tested. Check the row
- Story 19: the phone drawer chevrons were checked by hand in Chromium at 375 px; the row says so, but the script counts it as tested
- Story 21: "The details of this album are not available right now." when no source answers (needs the services down)
- Story 23: signed-out visit to the account page redirects to log in (existing behaviour, not tested)

## Before the next story can start
- Story 24: decide finish or cut. No open findings are linked to it. Its design is approved. Add its Traceability rows once its tests exist.
- Stories 21, 23 and 25: decide their place in the build order.
- Story 15: the Traceability table in SPEC.md has an empty row for story 15 (`| 15 | | | |`). Remove it or fill it.
- Open findings in built stories (all Low): #46, #47, #51, #52, #53, #56, #60, #62, #63.
- Open UX findings on the recommendation page (story 25 area): #38 and #39 (Medium).
