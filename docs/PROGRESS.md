<!-- page: https://claude.ai/artifact/W2xGvu3nfNcfcuxAv3hYsn -->
# MVP progress

Updated 2026-11-08 on request (first report) · Deadline 15 Nov 2026 · **7 days left**

## Summary
- **Stories:** 5 of 9 MVP stories built (3 with gaps), 1 in progress (9), 3 not started (7, 8, 4)
- **Tests:** unit 207/207 · end-to-end 102/104 (2 skipped: desktop-only tests on the phone run) — all pass
- **Demo:** the happy path runs from search to listings; it breaks at **Buy with protection** (story 7 not built)
- **Next:** story 7 · findings decided, both designs approved, orders table and Pay function committed; screens next
- **Risk:** 7 days for story 7, the rest of story 9, story 2 "save to account" and story 8 (which still needs 3 designs). Phase 4 (story 4, story 7 step 3, story 9 reviews) is the first thing to cut.
- **Brief:** 3 of 7 criteria done; missing the core flow end to end, the submission PDF, a manual test record and a demo script

## Against the brief
| Criterion | Status | Evidence / what is missing |
|---|---|---|
| 1 · Core features work end to end | Missing | Flow stops at Buy: no checkout or confirmation (story 7). UX review #1 (Blocker) |
| 2 · Data tables | Done (for stories built and story 7) | `0001_core.sql` and `0002_orders.sql` committed and described in `docs/database.md`; story 8 would need its own |
| 3 · Testing, automated and manual | Partly | Automated: all pass (above). Manual: no record of checking every screen by hand |
| 4 · LLM good practices in the repo | Done | SPEC.md, `specs/`, CLAUDE.md, ARCHITECTURE.md, DECISIONS.md, `docs/AI_USAGE.md`, tests committed. `AGENTS.md` is untracked and holds only the Next.js agent notes |
| 5 · UX and UI quality | Partly | UX review done; 13 findings open, none decided (1 Blocker, 3 High, 9 Low) |
| 6 · App online and reachable | Not checked | Deployed on Vercel (DECISIONS.md), but the address is not in the repo; all commits pushed |
| 7 · Live demo | Missing | No demo script; not rehearsed |
| S1 · Link to the app | Not checked | Same as criterion 6 |
| S2 · PDF with tables and screenshots | Missing | `docs/database.md` exists; screenshots only for story 9 |

### Missing for the brief, by impact on the grade
1. Story 7: checkout and confirmation (criterion 1), including UX review #2 "just sold"
2. Demo script and one rehearsal with realistic data (criterion 7)
3. Submission PDF: data tables and screenshots of every screen (S2)
4. Manual test record: screen, what was checked, result (criterion 3)
5. Decide the UX review findings, the High ones first (criterion 5)
6. Confirm the Vercel address works with the latest version (criterion 6, S1)
7. Only if time is left: story 2 "save to account", story 8. Phase 4: cut

## Build phases
| Phase | Stories | Status |
|---|---|---|
| 1 · Core | 1, 2, 3, 5, 6 | Done with gaps |
| 2 · Purchase | 9 (sign-up, log in), 7, 2 (save to account) | In progress: sign-up and log in built; 7 and "save to account" not started |
| 3 · Seller | 8 | Not started |
| 4 · If time allows | 7 step 3, 4, 9 (reviews) | Not started |

## Stories
| Story | Status | Requirements with automated test | Open findings |
|---|---|---|---|
| 1 · Search for an album | Built | 5 of 5 | #36 |
| 2 · Say what matters to me | Built with gaps (phase 1 part) | 4 of 5 | #11 |
| 3 · Get one recommendation | Built with gaps | 8 of 9 | — |
| 5 · See verified listings | Built with gaps | 9 of 10 | — |
| 6 · Fair price | Built | 4 of 4 | — |
| 9 · Sign up, log in | In progress | 1 of 3 (2 written with stories 7 and 8) | #12 |
| 7 · Buy with protection | Not started | — | #12 (deferred to story 8) |
| 8 · Sell a record for free | Not started | — | #13, #35, #36 |
| 4 · Compare versions | Not started | — | #14, #26 |

## Gaps (not tested automatically)
- Story 2: loading mask and error screen with "Try again"
- Story 3: loading mask and error screen with "Try again"
- Story 5: loading mask and error screen with "Try again" on the listings and listing check screens

## Before the next story can start
- Story 7: nothing blocking. Findings #37–#41 decided; checkout and confirmation designs approved; orders table committed.
- A spec review of the built stories (iteration 5) is in progress: 30 new findings (#42–#71, 6 High) are in `findings.json` but not committed yet, so they are not counted above.
- Story 2 "save to account": finding #11 open (does "Change" overwrite the saved ranking?).
- Story 8: findings #13, #35, #36 open; no design yet for the list of versions, first-time city and shop name, and My listings.
