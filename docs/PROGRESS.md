<!-- page: https://claude.ai/artifact/W2xGvu3nfNcfcuxAv3hYsn -->
# MVP progress

Updated 2026-11-08 after story 7 · Deadline 15 Nov 2026 · **7 days left**

## Summary
- **Stories:** 6 of 9 MVP stories built (4 with gaps), 1 in progress (9), 2 not started (8, 4)
- **Tests:** unit 253/253 · end-to-end 118/120 (2 skipped: desktop-only tests on the phone run) — all pass
- **Demo:** every step from search to the order confirmation is covered by a passing test; the whole path in one go has not been run as one test or rehearsed
- **Next:** story 8 (sell) · its 3 designs (version list, first-time city and shop name, My listings) must exist and findings #13, #35, #36 must be decided before it starts. Story 2 "save to account" needs finding #11 decided.
- **Risk:** 7 days for story 8, story 2 "save to account", the submission PDF, the demo script and the manual test record. Phase 4 (story 4, story 7 step 3, story 9 reviews) is the first thing to cut.
- **Brief:** core flow now works end to end; still missing the submission PDF, a manual test record and a demo script

## Against the brief
| Criterion | Status | Evidence / what is missing |
|---|---|---|
| 1 · Core features work end to end | Partly | Search → priorities → recommendation → listings → checkout → confirmation all built and tested. Not yet: "save to account" (story 2), selling (story 8) |
| 2 · Data tables | Done (for stories built) | `0001_core.sql` and `0002_orders.sql` committed and described in `docs/database.md`; story 8 would need its own |
| 3 · Testing, automated and manual | Partly | Automated: all pass (above). Manual: no record of checking every screen by hand |
| 4 · LLM good practices in the repo | Done | SPEC.md, `specs/`, CLAUDE.md, ARCHITECTURE.md, DECISIONS.md, `docs/AI_USAGE.md`, tests committed |
| 5 · UX and UI quality | Partly | UX review done; 13 findings open, none decided (1 Blocker, 3 High, 9 Low). #1 (no checkout or confirmation) and #2 (no "just sold" screen) are now built; the register was not updated by this skill |
| 6 · App online and reachable | Not checked | Deployed on Vercel (DECISIONS.md), but the address is not in the repo; 2 commits (story 7, flows 1–2) are not pushed yet |
| 7 · Live demo | Missing | No demo script; not rehearsed |
| S1 · Link to the app | Not checked | Same as criterion 6 |
| S2 · PDF with tables and screenshots | Partly | `docs/database.md` exists; screenshots for stories 7 and 9 only |

### Missing for the brief, by impact on the grade
1. Demo script and one rehearsal of the whole path with realistic data (criterion 7)
2. Submission PDF: data tables and screenshots of every screen (S2)
3. Manual test record: screen, what was checked, result (criterion 3)
4. Decide the UX review findings, the High ones first (criterion 5)
5. Push and confirm the Vercel address runs the latest version (criterion 6, S1)
6. Story 2 "save to account" and story 8 (criterion 1), only if time is left. Phase 4: cut

## Build phases
| Phase | Stories | Status |
|---|---|---|
| 1 · Core | 1, 2, 3, 5, 6 | Done with gaps |
| 2 · Purchase | 9 (sign-up, log in), 7, 2 (save to account) | In progress: sign-up, log in and story 7 built; "save to account" not started |
| 3 · Seller | 8 | Not started |
| 4 · If time allows | 7 step 3, 4, 9 (reviews) | Not started |

## Stories
| Story | Status | Requirements with automated test | Open findings |
|---|---|---|---|
| 1 · Search for an album | Built | 5 of 5 | #36, #42–#45 |
| 2 · Say what matters to me | Built with gaps (phase 1 part) | 4 of 5 | #11, #46, #47 |
| 3 · Get one recommendation | Built with gaps | 8 of 9 | #47, #51–#54, #56 |
| 5 · See verified listings | Built with gaps | 9 of 10 | #47, #57 (High), #59–#62 |
| 6 · Fair price | Built | 4 of 4 | #63 |
| 7 · Buy with protection | Built with gaps | 7 of 8 | #12, #57 (High), #61 |
| 9 · Sign up, log in | In progress | 2 of 4 (2 rows say "written with story 7 / 8") | #12, #65, #67–#69 |
| 8 · Sell a record for free | Not started | — | #13, #35, #36 |
| 4 · Compare versions | Not started | — | #14, #26 |

## Gaps (not tested automatically)
- Story 2: loading mask and error screen with "Try again"
- Story 3: loading mask and error screen with "Try again"
- Story 5: loading mask and error screen with "Try again" on the listings and listing check screens
- Story 7: loading mask and error screen on the checkout and the confirmation

## Before the next story can start
- Story 9 row "Tap Buy while signed out → … → checkout" still says "Built with story 7 / Written with story 7", but it is built and tested in `tests/e2e/checkout.spec.ts`; the row needs your OK to be updated.
- Finding #57 (High) is still open although the checkout now exists: confirm it can be closed.
- Story 8: findings #13, #35, #36 open; no design yet for the list of versions, first-time city and shop name, and My listings.
- Story 2 "save to account": finding #11 open (does "Change" overwrite the saved ranking?).
