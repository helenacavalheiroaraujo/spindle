<!-- page: https://claude.ai/artifact/W2xGvu3nfNcfcuxAv3hYsn -->
# MVP progress

Updated 2026-11-14 after story 29 and bugs 27, 32 · Deadline 23 Nov 2026 (moved from 15 Nov) · **9 days left**

## Summary
- **Stories:** 31 of 31 MVP stories built (18 with gaps), 0 in progress, 0 not started. Feature freeze: nothing new after story 29 (DECISIONS 2026-11-14)
- **Tests:** unit 805/805 · end-to-end 404/439 (28 skipped), **7 failing** in the full run (19.8 min, phone and desktop). Re-run of those 6 files after a test fix: 54 passed, **2 failing** (`reviews.spec.ts:108`, phone and desktop). Cause: a purchase made by hand on seed listing …0036 (Helena's account, 14 Nov) added a second review to seller João Pinto; the test expects one. Not a code defect; the data needs the owner's decision. The other 5 failures were slow-run timing (crate drag, home sections, and the log-in click on phone, now sent with Enter in the test helper)
- **Demo:** the happy path (search → album page → priorities → recommendation → listings → checkout → confirmation) passes its end-to-end tests on phone and desktop. Not rehearsed live
- **Next:** no story left. Brief items: 26 manual checks (planned for 15 Nov), submission PDF, demo rehearsal, `docs/database.md` migration 0012
- **Risk:** 9 days and no story left; the risk is in the brief items, not the code. The PDF is the largest one: its draft still lists 6 of 12 migrations and has screenshots only for stories 1–9, 12 and 17

## Against the brief
| Criterion | Status | Evidence / what is missing |
|---|---|---|
| 1 · Core features work end to end | Done | Phases 1–3 built; the full end-to-end suite passes the core flow on phone and desktop (search, recommendation, listings, checkout, confirmation). Not rehearsed live |
| 2 · Data tables | Partly | `supabase/migrations/` 0001–0012 committed. `docs/database.md` does not mention migration 0012 (Classical genre); the PDF draft lists only 0001–0006 |
| 3 · Testing, automated and manual | Partly | Automated: unit 805/805; end-to-end 404/439 (28 skipped, 7 failing; 2 still failing after re-run, caused by data, see Summary). Manual: all 26 entries in `docs/manual-tests.md` are "Not run" |
| 4 · LLM good practices in the repo | Done | SPEC.md, `specs/`, CLAUDE.md, ARCHITECTURE.md (updated 14 Nov to the final structure), DECISIONS.md, `docs/AI_USAGE.md`, use cases and flowchart (updated 14 Nov) and the tests |
| 5 · UX and UI quality | Partly | `docs/ux-review/findings.json`: 6 open (2 Medium: #38, #39; 4 Low: #37, #40, #42, #43). No High or Blocker. Story 25 covers #38–#43 with tests, but the entries are still marked open |
| 6 · App online and reachable | Done | https://spindle-three.vercel.app checked on 14 Nov after a881f52: `/login` opens the home page with the two-panel window, `/cart` signed out shows "Log in to see your cart" (story 29, bug 32) |
| 7 · Live demo | Partly | `docs/demo-script.md` exists, marked DRAFT, not rehearsed; it still says "due 15 Nov" |
| S1 · Link to the running app | Done | https://spindle-three.vercel.app, checked online |
| S2 · PDF with data tables and screenshots | Missing | No PDF. `docs/submission/spindle-submission.md` is a DRAFT: no address, migrations 0007–0012 missing, stories 14–34 missing, story 9 shows the old log-in page |

### Missing for the brief, by impact on the grade
1. Submission PDF (S2): migrations 0007–0012, screenshots of stories 14–34 and the new story 9 window, the Vercel address; retake screenshots after the manual checks.
2. Manual test record: 26 entries "Not run" in `docs/manual-tests.md` (planned for 15 Nov).
3. Demo: rehearse `docs/demo-script.md` once; update the date (23 Nov) and the address.
4. `docs/database.md`: add migration 0012.
5. Decide the hand purchase on seed listing …0036 (it breaks `reviews.spec.ts:108`).
6. Close the UX entries that story 25 already fixed (#38–#43), if the owner agrees.

## Build phases
| Phase | Stories | Status |
|---|---|---|
| 1 · Core | 1, 2, 3, 5, 6, 12 | Done with gaps (manual checks not run) |
| 2 · Purchase | 9, 7, 2 (save to account) | Done with gaps. Save to account: rows tested |
| 3 · Seller | 8 | Done with gaps (manual checks not run) |
| 4 · If time allows | 7 step 3, 17, 4, 18, 16, 15, 19, 20, 14, 22, 24, 21, 23, 25, 26, 27, 28, 31, 30, 32, 33, 29, 34 | All 23 built (7 step 3, 18, 15, 19, 20, 14, 22, 24, 32, 33, 34 fully; 17, 4, 16, 21, 23, 25, 26, 27, 28, 29, 30, 31 with gaps) |

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
| 27 · Log in without leaving the page | Built with gaps | 5 of 6 | — |
| 28 · One album page for every album | Built with gaps | 4 of 5 | — |
| 29 · A larger log-in window, used for every log-in | Built with gaps | 5 of 6 | — |
| 30 · Next steps after "Order placed" | Built with gaps | 4 of 5 | — |
| 31 · Your account in tabs | Built with gaps | 4 of 5 | — |
| 32 · Account button and menu | Built | 4 of 4 | — |
| 33 · "Pressing check" on every listing | Built | 4 of 4 | — |
| 34 · Listen to the album | Built | 3 of 3 | — |

The spec-review register has 0 open findings (81 resolved, 2 won't fix).

## Outside the MVP
Not counted in the figures above.

### Specified, not in the build order
None. Every story with a spec file is in the build order.

### Not in this MVP
| Story | Spec file | What the repo says |
|---|---|---|
| 10 · No title in the repo | None | Filters (story 1), "All genres and formats" (stories 12, 24), "Ask the seller" (story 5) |
| 11 · No title in the repo | None | "Spindle Pro" for shops (story 9). Its 30-second previews are now story 34 (DECISIONS 2026-11-14) |
| 13 · No title in the repo | None | "Because you like…" with a wishlist (story 12) |

## Gaps (not tested automatically)
- Stories 2, 3, 4, 5, 7, 8, 12, 17: loading mask and error screen with "Try again" (manual tests)
- Story 7: "Confirming…" mask and error screen on the order card; Your account page
- Story 16: loading mask "Searching…"
- Story 21: "The details of this album are not available right now."
- Story 23: signed out, the account page asks to log in (now the window of story 29)
- Story 25: visible space between "Buy" and "Add to cart"
- Story 26: loading mask "Saving…" and error screen with "Try again"
- Story 27: loading mask and error screen with "Try again" in the log-in window (typing kept is tested)
- Story 29: session ended during the cart checkout (the one-record checkout is tested)
- Story 28: loading mask and error screen on the album page (manual test M24)
- Bug 29: album details from live MusicBrainz (manual test M25; the automated tests use a local stub)
- Story 30: loading mask and error screen on the cart's "Order placed" page
- Story 31: loading mask and error screen with "Try again" per tab
- Story 34: previews from live iTunes (the automated tests use a local stub)
- Bug 30: real browser or password-manager autofill (the test sets the value without an event; check on the device where it was seen)

## Before the next step
- Only one session at a time runs end-to-end tests (one shared database, port 3000); no hand purchases on seed listings (one on …0036 now breaks `reviews.spec.ts:108`)
- Feature freeze: no new stories. A problem found in the manual checks becomes a bug (`/log-bug`)
- Bugs 27 and 32 fixed (a881f52). Bug 29 fixed in part: dates wrong in MusicBrainz itself stay wrong
- Unused since story 29: `app/login/LoginForm.tsx`, `app/signup/SignUpForm.tsx` and the `logIn` / `signUp` actions (removal waits for the owner's OK)
- Next delivery notes are in ARCHITECTURE.md ("Next delivery"): server-only guard, split the largest screens, one session check
- Parked by the owner on 14 Nov, not logged yet: signed out, the buyer only learns at "Buy" that an account is needed. With the freeze, a candidate for the next delivery
