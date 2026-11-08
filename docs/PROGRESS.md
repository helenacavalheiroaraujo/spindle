<!-- page: https://claude.ai/artifact/W2xGvu3nfNcfcuxAv3hYsn -->
# MVP progress

Updated 2026-11-08 after story 2 "save to account" · Deadline 15 Nov 2026 · **7 days left**

## Summary
- **Stories:** 7 of 9 MVP stories built (5 with gaps), 0 in progress, 1 not started (4); story 2 "save to account" built
- **Tests:** unit 298/298 · end-to-end 142/144 (2 skipped: desktop-only tests on the phone run) — all pass
- **Demo:** every step from search to the order confirmation, and selling, is covered by a passing test; the whole path in one go has not been run as one test or rehearsed. The demo data was restored (the 1990 Reissue €24 listing is on sale again)
- **Next:** Playwright tests for the loading and error screens (stories 2, 3, 5, 7, 8), then the brief items: demo script, submission PDF, manual test record, push
- **Risk:** 7 days for the demo script, the submission PDF, the manual test record, the UX findings and push/online check. Phase 4 (story 4, story 7 step 3, story 9 reviews) are the first things to cut

## Against the brief
| Criterion | Status | Evidence / what is missing |
|---|---|---|
| 1 · Core features work end to end | Partly | Search → priorities → recommendation → listings → checkout → confirmation, and selling (story 8), and "save to account" (story 2), built and tested |
| 2 · Data tables | Done | `0001_core.sql`, `0002_orders.sql`, `0003_sell.sql`, `0004_preferences.sql` (not committed yet), applied and described in `docs/database.md` |
| 3 · Testing, automated and manual | Partly | Automated: 298 unit and 142 end-to-end, all pass. Manual: no record of checking every screen by hand |
| 4 · LLM good practices in the repo | Done | SPEC.md, `specs/`, CLAUDE.md, ARCHITECTURE.md, DECISIONS.md, `docs/AI_USAGE.md`, tests committed |
| 5 · UX and UI quality | Partly | UX review register: 13 open (2 High, 11 Low), 2 resolved. Story 8 screens are not yet in the UX review |
| 6 · App online and reachable | Not checked | The Vercel address is not in the repo; 11 commits are not pushed, plus story 2 "save to account" (not committed yet) |
| 7 · Live demo | Missing | No demo script; not rehearsed |
| S1 · Link to the app | Not checked | Same as criterion 6 |
| S2 · PDF with tables and screenshots | Partly | `docs/database.md` exists; screenshots for stories 2 (saved ranking only), 7, 8 and 9 |

### Missing for the brief, by impact on the grade
1. Demo script and one rehearsal of the whole path, including selling, with realistic data (criterion 7)
2. Submission PDF: data tables and screenshots of every screen (S2)
3. Manual test record: screen, what was checked, result (criterion 3)
4. Push and confirm the Vercel address runs the latest version; restart with the 4 MB upload limit (criterion 6, S1)
5. UX review of the story 8 screens and decide the open findings, the High ones first (criterion 5)
6. Phase 4: cut

## Build phases
| Phase | Stories | Status |
|---|---|---|
| 1 · Core | 1, 2, 3, 5, 6 | Done with gaps |
| 2 · Purchase | 9 (sign-up, log in), 7, 2 (save to account) | Done with gaps |
| 3 · Seller | 8 | Done with gaps |
| 4 · If time allows | 7 step 3, 4, 9 (reviews) | Not started |

## Stories
| Story | Status | Requirements with automated test | Open findings |
|---|---|---|---|
| 1 · Search for an album | Built | 5 of 5 | #42–#45 |
| 2 · Say what matters to me | Built with gaps | 6 of 7 | #46, #47 |
| 3 · Get one recommendation | Built with gaps | 8 of 9 | #47, #51–#54, #56 |
| 5 · See verified listings | Built with gaps | 9 of 10 | #47, #59–#62, #83 |
| 6 · Fair price | Built | 4 of 4 | #63 |
| 9 · Sign up, log in | Built | 4 of 4 | #65, #67–#69 |
| 7 · Buy with protection | Built with gaps | 7 of 8 | #61, #83 |
| 8 · Sell a record for free | Built with gaps | 13 of 14 | — |
| 4 · Compare versions | Not started | — | #14, #26 |

## Gaps (not tested automatically)
- Story 2: loading mask and error screen with "Try again"
- Story 3: loading mask and error screen with "Try again"
- Story 5: loading mask and error screen with "Try again" on the listings and listing check screens
- Story 7: loading mask and error screen on the checkout and the confirmation
- Story 8: loading mask and error screen with "Try again"; the sell form keeps what was typed
- Story 8 (noted in the build, not a Traceability row): a failed photo upload; "Your listing" beside the recommendation on desktop

## Before the next story can start
- Story 4 (phase 4): findings #14 and #26 open; recommended to cut.
