<!-- page: https://claude.ai/artifact/W2xGvu3nfNcfcuxAv3hYsn -->
# MVP progress

Updated 2026-11-10 after story 23 built, SPEC traceability added · Deadline 15 Nov 2026 · **5 days left**

## Summary
- **Stories:** 9 of 19 MVP stories built (9 with gaps), 0 in progress, 1 not started (story 24: uncommitted work in progress, no Traceability rows yet)
- **Tests:** unit 614/614 · end-to-end 310 passed, 4 failed, 22 skipped — **4 failing** (all on the home page, story 24 work)
- **Demo:** not verified end to end in this run; the home page tests fail
- **Next:** story 24 · finish or cut it; commit and push stories 22 and 23 so the live site matches the code
- **Risk:** 5 days left, 1 MVP story not built. Cut first: story 24, then the "If time allows" items from the end of that list (22, 14, 20, 19, 15, 16). The core flow and the manual check come before any of them.

## Against the brief
| Criterion | Status | Evidence / what is missing |
|---|---|---|
| 1 · Core features work end to end | Partly | Home page tests fail; the 5-minute path was not run end to end in this report |
| 2 · Data tables | Not checked | Migrations up to 0012 (0012 not committed); not compared with `docs/database.md` |
| 3 · Testing, automated and manual | Partly | Automated: unit 614/614, end-to-end 4 failing. Manual: rows in `docs/manual-tests.md` still "Not run" |
| 4 · LLM good practices in the repo | Partly | SPEC, specs, CLAUDE.md, DECISIONS, AI_USAGE and tests exist; this session's changes are not committed |
| 5 · UX and UI quality | Not checked | `docs/ux-review/findings.json` has 37 entries; open count not checked in this run |
| 6 · App online and reachable | Partly | `spindle-three.vercel.app` opens (title "Spindle"); commit c9f726b is not pushed, so the live site may lack story 22 |
| 7 · Live demo | Partly | `docs/demo-script.md` exists; no rehearsal recorded |
| S1 · Link to the running app | Partly | Link opens; same caveat as criterion 6 |
| S2 · PDF with data tables and screenshots | Not checked | `docs/submission` exists and was not inspected; no PDF in `docs/` |

### Missing for the brief, by impact on the grade
1. Story 24: finish or cut it; fix the 4 failing home page tests.
2. Run the 5-minute path end to end on the live site.
3. Commit and push stories 22, 23 and 24, so the live site matches the code.
4. Submission PDF: data tables and screenshots of the web app.
5. Manual test record: work through the rows in `docs/manual-tests.md`.
6. Rehearse the demo script once.

## Build phases
| Phase | Stories | Status |
|---|---|---|
| 1 · Core | 1, 2, 3, 5, 6, 12 | Done with gaps |
| 2 · Purchase | 9 (sign-up, log in), 7, 2 (save to account) | Done with gaps |
| 3 · Seller | 8 | Done with gaps |
| 4 · If time allows | 7 step 3, 17, 4, 18, 16, 15, 19, 20, 14, 22, 24 | In progress (24 not started) |

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
| 9 · Sign up, log in | Built | 4 of 4 | — |
| 12 · Home page | Built with gaps | 4 of 5 | — |
| 14 · Desktop footer | Built | 2 of 2 | — |
| 15 · Menu | Built | 3 of 3 | — |
| 16 · Search suggestions | Built with gaps | 4 of 5 | — |
| 17 · Search results page | Built with gaps | 3 of 4 | — |
| 18 · Rate the seller | Built | 4 of 4 | — |
| 19 · Menu with chevrons | Built | 4 of 4 | — |
| 20 · Cart | Built | 7 of 7 | — |
| 22 · Navy header (desktop) | Built | 2 of 2 | — |
| 24 · More genres and a crate row | Not started | 0 of 0 | — (in progress in the working tree, uncommitted) |

## Outside the MVP
Not counted in the figures above.

### Specified, not in the build order
| Story | Spec file | Status | Note |
|---|---|---|---|
| 21 · Album details without listings | `specs/stories/story-21-album-details.md` | Built with gaps (3 of 4 tested) | Needs a place in the build order (your decision) |
| 23 · Buying priorities on the account page | `specs/stories/story-23-account-priorities.md` | Built with gaps (3 of 4 tested) | Needs a place in the build order (your decision) |

### Not in this MVP
| Story | Spec file | What the repo says |
|---|---|---|
| 10 · No title in the repo | None | Filters (stories 1, 5, 12 and 24 mention it) |
| 11 · No title in the repo | None | Spindle Pro paid plans; 30-second previews (stories 3 and 9 mention it) |
| 13 · No title in the repo | None | Wishlist (story 12 mentions it) |

## Gaps (not tested automatically)
- Story 2: loading mask and error screen with "Try again"
- Story 3: loading mask and error screen with "Try again"
- Story 4: loading mask and error screen with "Try again"
- Story 5: loading mask and error screen on listings and listing check
- Story 7: loading mask and error screen on checkout and confirmation; "Confirming…" mask on the card step
- Story 8: loading mask and error screen; the sell form keeps what was typed
- Story 12: loading mask and error screen on home sections and genre screen
- Story 16: "Searching…" mask and error screen that keeps the typed text
- Story 17: loading mask and error screen with "Try again"
- Story 21: "The details of this album are not available right now." when no source answers
- Story 23: signed-out visit to the account page redirects to log in

## Before the next story can start
- Story 24: uncommitted files; the 4 home page tests fail
- Stories 21 and 23: decide their place in the build order
- Open findings in built stories (all Low): #46, #47, #51, #52, #53, #56, #60, #62, #63
