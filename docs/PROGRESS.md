<!-- page: https://claude.ai/artifact/W2xGvu3nfNcfcuxAv3hYsn -->
# MVP progress

Updated 2026-11-13 on request · Deadline 23 Nov 2026 (moved from 15 Nov) · **10 days left**

## Summary
- **Stories:** 24 MVP stories: 10 built, 13 built with gaps, 0 in progress, 1 not started (story 27: spec and design committed, no code)
- **Tests:** unit 635/635 · end-to-end 336/360 (24 skipped) — all pass (full suite, phone and desktop, 12.6 min). The 57 failures of the earlier run on 2026-11-13 no longer appear; their cause was not diagnosed
- **Demo:** the happy path (search → priorities → recommendation → listings → checkout → confirmation) passes its end-to-end tests on phone and desktop. Not rehearsed live. A hand purchase on a seed listing can break the same tests again (it happened on 2026-11-08)
- **Next:** the brief items (PDF, manual checks, online check, rehearsal). Story 27 only after them
- **Risk:** 10 days. Story 27 is the last in "If time allows" and is cut first. The PDF, the manual checks, the online check and the rehearsal come before it

## Against the brief
| Criterion | Status | Evidence / what is missing |
|---|---|---|
| 1 · Core features work end to end | Done | Phases 1–3 built; the full end-to-end suite passes, including search, recommendation, listings, checkout and confirmation, on phone and desktop. Not rehearsed live |
| 2 · Data tables | Partly | `supabase/migrations/` is committed. `docs/database.md` does not mention migration 0012 (Classical genre). Story 26 adds no table |
| 3 · Testing, automated and manual | Partly | Automated: unit 635/635; end-to-end 336/360 (24 skipped), all pass. Manual: 21 "Not run" entries in `docs/manual-tests.md` |
| 4 · LLM good practices in the repo | Done | SPEC.md, `specs/`, CLAUDE.md, ARCHITECTURE.md, DECISIONS.md, `docs/AI_USAGE.md` and the tests are committed |
| 5 · UX and UI quality | Partly | `docs/ux-review/findings.json`: 6 open (2 Medium: #38, #39; 4 Low: #37, #40, #42, #43). No High or Blocker. Story 25 covers #38–#43 with tests, but the entries are still marked open |
| 6 · App online and reachable | Not checked | Vercel address not known to this run. All commits are pushed (`git log origin/main..main` is empty) |
| 7 · Live demo | Partly | `docs/demo-script.md` exists, marked DRAFT, not rehearsed, address still a placeholder |
| S1 · Link to the running app | Not checked | Same as criterion 6 |
| S2 · PDF with data tables and screenshots | Missing | No PDF. `docs/submission/spindle-submission.md` is marked DRAFT (address missing, screenshots to retake) |

### Missing for the brief, by impact on the grade
1. Submission PDF (S2): data tables and screenshots, after the final changes.
2. Manual test record: 21 entries "Not run".
3. Online check (criterion 6, S1): give the address, open it.
4. Demo: rehearse `docs/demo-script.md` once; add the address.
5. `docs/database.md`: add migration 0012.
6. Close the UX entries that story 25 already fixed (#38–#43), if the user agrees.

## Build phases
| Phase | Stories | Status |
|---|---|---|
| 1 · Core | 1, 2, 3, 5, 6, 12 | Done with gaps (manual checks not run) |
| 2 · Purchase | 9, 7, 2 (save to account) | Done with gaps. Save to account: rows tested |
| 3 · Seller | 8 | Done with gaps (manual checks not run) |
| 4 · If time allows | 7 step 3, 17, 4, 18, 16, 15, 19, 20, 14, 22, 24, 21, 23, 25, 26, 27 | 15 of 16 built (7 step 3, 18, 15, 19, 20, 14, 22, 24 fully; 17, 4, 16, 21, 23, 25, 26 with gaps); story 27 not started |

## Stories
| Story | Status | Requirements with automated test | Open findings |
|---|---|---|---|
| 1 · Search for an album | Built | 6 of 6 | — |
| 2 · Say what matters to me | Built with gaps | 6 of 7 | — |
| 3 · Get one recommendation | Built with gaps | 8 of 9 | — |
| 4 · Compare versions | Built with gaps | 6 of 7 | — |
| 5 · See verified listings | Built with gaps | 10 of 11 | — |
| 6 · Fair price | Built | 4 of 4 | — |
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
| 21 · Album details without listings | Built with gaps | 3 of 4 | — |
| 22 · Navy header (desktop) | Built | 2 of 2 | — |
| 23 · Buying priorities on the account page | Built with gaps | 3 of 4 | — |
| 24 · More genres and a crate row | Built | 6 of 6 | — |
| 25 · Recommendation page polish | Built with gaps | 5 of 6 | UX #38, #39, #40, #42, #43 (marked open, covered by this story) |
| 26 · Change buying priorities | Built with gaps | 5 of 6 | — |
| 27 · Log in without leaving the page | Not started | 0 of 0 | — |

The spec-review register has 0 open findings (81 resolved, 2 won't fix).

## Outside the MVP
Not counted in the figures above.

### Specified, not in the build order
None. Every story with a spec file is now in the build order.

### Not in this MVP
| Story | Spec file | What the repo says |
|---|---|---|
| 10 · No title in the repo | None | Filters (story 1), "All genres and formats" (stories 12, 24), "Ask the seller" (story 5) |
| 11 · No title in the repo | None | 30-second previews (story 3); "Spindle Pro" for shops (story 9) |
| 13 · No title in the repo | None | "Because you like…" with a wishlist (story 12) |

## Gaps (not tested automatically)
- Stories 2, 3, 4, 5, 7, 8, 12, 17: loading mask and error screen with "Try again" (manual tests)
- Story 7: "Confirming…" mask and error screen on the order card; Your account page
- Story 16: loading mask "Searching…"
- Story 21: "The details of this album are not available right now."
- Story 23: signed out, the account page redirects to log in
- Story 25: visible space between "Buy" and "Add to cart"
- Story 26: loading mask "Saving…" and error screen with "Try again"

## Before the next story can start
- Story 27: no open findings. Design (option A) and spec are committed
- The brief items come first (PDF, manual checks, online check, rehearsal)
- Not committed and not to commit: `tests/e2e/tmp-bug26/shot.spec.ts` (temporary screenshot test; the full suite picks it up until the owner removes it: it ran and passed in this report)
- Bug 27 (the checkout asks for the name twice) is logged and open
