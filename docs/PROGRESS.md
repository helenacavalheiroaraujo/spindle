<!-- page: https://claude.ai/artifact/W2xGvu3nfNcfcuxAv3hYsn -->
# MVP progress

Updated 2026-11-08 after story 8 · Deadline 15 Nov 2026 · **7 days left**

## Summary
- **Stories:** 7 of 9 MVP stories built (5 with gaps), 0 in progress, 1 not started (4); story 2 "save to account" not started
- **Tests:** unit 298/298 · end-to-end 130/140 (2 skipped: desktop-only tests on the phone run) — **8 failing**: 4 tests × 2 sizes, all on the 1990 Reissue €24 seed listing, which was bought by a manual purchase (order of 2026-11-08 15:02) and is now "sold"
- **Demo:** breaks at the recommendation: with the €24 listing sold, "1. Price, 2. Sound" no longer recommends the 2012 Remaster as in the demo data. Restoring the seed listing fixes it; no code change needed
- **Next:** restore the demo data, then the brief items (demo script, PDF, manual test record). Story 2 "save to account" needs finding #11 decided
- **Risk:** 7 days for the demo script, the submission PDF, the manual test record, the UX findings and push/online check. Story 2 "save to account" and phase 4 (story 4, story 7 step 3, story 9 reviews) are the first things to cut

## Against the brief
| Criterion | Status | Evidence / what is missing |
|---|---|---|
| 1 · Core features work end to end | Partly | Search → priorities → recommendation → listings → checkout → confirmation, and selling (story 8), built and tested. The demo data is broken (see Demo); "save to account" (story 2) not built |
| 2 · Data tables | Done | `0001_core.sql`, `0002_orders.sql`, `0003_sell.sql` committed, applied and described in `docs/database.md` |
| 3 · Testing, automated and manual | Partly | Automated: 298 unit, 130 end-to-end passing; 8 failing on changed demo data. Manual: no record of checking every screen by hand |
| 4 · LLM good practices in the repo | Done | SPEC.md, `specs/`, CLAUDE.md, ARCHITECTURE.md, DECISIONS.md, `docs/AI_USAGE.md`, tests committed |
| 5 · UX and UI quality | Partly | UX review register: 13 open (2 High, 11 Low), 2 resolved. Story 8 screens are not yet in the UX review |
| 6 · App online and reachable | Not checked | The Vercel address is not in the repo; 9 commits (story 8 findings, designs and build) are not pushed |
| 7 · Live demo | Missing | No demo script; not rehearsed |
| S1 · Link to the app | Not checked | Same as criterion 6 |
| S2 · PDF with tables and screenshots | Partly | `docs/database.md` exists; screenshots for stories 7, 8 and 9 only |

### Missing for the brief, by impact on the grade
1. Restore the demo data (the 1990 Reissue €24 listing) so the happy path and all tests pass (criteria 1, 3, 7)
2. Demo script and one rehearsal of the whole path, including selling, with realistic data (criterion 7)
3. Submission PDF: data tables and screenshots of every screen (S2)
4. Manual test record: screen, what was checked, result (criterion 3)
5. Push and confirm the Vercel address runs the latest version; restart with the 4 MB upload limit (criterion 6, S1)
6. UX review of the story 8 screens and decide the open findings, the High ones first (criterion 5)
7. Story 2 "save to account" only if time is left. Phase 4: cut

## Build phases
| Phase | Stories | Status |
|---|---|---|
| 1 · Core | 1, 2, 3, 5, 6 | Done with gaps |
| 2 · Purchase | 9 (sign-up, log in), 7, 2 (save to account) | Sign-up, log in and story 7 built; "save to account" not started |
| 3 · Seller | 8 | Done with gaps |
| 4 · If time allows | 7 step 3, 4, 9 (reviews) | Not started |

## Stories
| Story | Status | Requirements with automated test | Open findings |
|---|---|---|---|
| 1 · Search for an album | Built | 5 of 5 | #42–#45 |
| 2 · Say what matters to me | Built with gaps (phase 1 part) | 4 of 5 | #11, #46, #47 |
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
- Demo data: the 1990 Reissue €24 seed listing is "sold" after a manual purchase; restoring it needs your OK.
- Story 2 "save to account": finding #11 open (does "Change" overwrite the saved ranking?).
- Story 4 (phase 4): findings #14 and #26 open; recommended to cut.
