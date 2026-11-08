---
name: mvp-progress
description: Reports how far the Spindle MVP is from done — status of every story and build phase, test results, open findings, days to the deadline and what is left for the 5-minute demo — and writes it to docs/PROGRESS.md plus a private progress page. Use at the end of every story (step 6 of "How we build a story" in CLAUDE.md), and whenever the user asks "where are we", "how much is left", "progress", "overview", "status of the MVP", "o que falta", "ponto de situação", even if they don't name the skill.
---

# MVP progress (Spindle)

Give the user an honest overview of what is done and what is left for the MVP, from evidence in the repo. The user is the Product Owner and verifies by behaviour: every status must come from the Traceability table and real test runs, never from memory of what was built.

## Fixed rules

1. **One source.** `docs/PROGRESS.md` is the record (kept in git). The progress page is a view of the same content, built in the same run. Never show a figure on the page that is not in the file.
2. **Evidence only.** Story status comes from the script below; test numbers from the test runs of *this* run. If a test run could not happen, write "Not run" and why. Never guess a count.
3. **Writes only `docs/PROGRESS.md` and the page.** Never edit SPEC.md, `specs/`, DECISIONS.md or `findings.json` from this skill. Commit only with the user's yes, together with the story.
4. **English in the repo and on the page.** The chat summary to the user follows their language rules (CLAUDE.local.md).

## Steps

1. **Count:** `python3 .claude/skills/mvp-progress/scripts/progress.py` → JSON with the build phases, each story's status, Traceability rows tested / total, rows "Not tested automatically", rows still pending, open findings, days left.
   Each story has a `scope`: `mvp` (in a build phase), `specified_not_scheduled` (has a spec file and a row in the Stories table, but is in no phase and not in "Not in this MVP"), or `outside_mvp` (named in SPEC.md's "Not in this MVP" line; may have no spec file). The headline counts ("N of N MVP stories") use `mvp` stories only. `outside_mvp` and `specified_not_scheduled` stories go in their own section, never in the MVP counts or the risk line.
   Story status:
   - *Not started* — no Traceability rows with a requirement
   - *In progress* — some rows have no test yet, or say "Written with story N"
   - *Built with gaps* — every row has a test or says "Not tested automatically"
   - *Built* — every row has an automated test
2. **Run the tests:** `npm test` (Vitest) and `npm run test:e2e` (Playwright, phone and desktop; run it in the background, it takes ~30 s). Record passed / failed / skipped for each. Any failure is the first line of the report.
2b. **Outside the MVP section:** for every story with scope `outside_mvp` or `specified_not_scheduled`, give: number, title (or "No title in the repo" when `title` is empty), whether a spec file exists, status, and where it is mentioned (`mentioned_in`). Do not invent titles or content for stories without a spec file; say "No story file yet". For `specified_not_scheduled`, add one line: it needs a place in the build order (the user decides).
3. **Judge what the numbers cannot see**, reading SPEC.md's build order:
   - Partial parts of a phase written in brackets (e.g. "2 (save to account)", "7 step 3", "9 (reviews)"): say whether that part is done, from the Traceability rows.
   - Open findings that block a story not yet built (they must be decided before it starts — CLAUDE.md step 1).
   - New screens a not-started story needs that still have no approved design (CLAUDE.md step 1b; check the story's "Designs" section).
   - **Demo readiness:** can the 5-minute happy path (search → priorities → recommendation → listings → checkout) run end to end today? Name the first step that breaks.
   - **Next step:** one line: the next story in build order and what must happen before it starts.
3b. **Check against the brief:** go through every line of `references/brief-checklist.md` (7 assessment criteria + 2 submission items) and give each a status with its evidence. Open the Vercel address in the browser to check criterion 6; if the address is not known, write "Not checked" and ask the user for it. Then list **what is missing for the brief**, ordered by impact on the grade (core flow first).
   - **Risk:** compare days left with stories left. If they do not fit, say what would be cut first (phase 4 "If time allows" before anything else). Do not soften it.
4. **Write `docs/PROGRESS.md`** using `references/template.md`. Overwrite the whole file each run (git keeps the history).
5. **Build and publish the page** from the same content: copy `assets/progress-page.html` to the scratchpad, replace the `DATA` object at the top of its script with this run's figures, and publish it with the Artifact tool. Republish to the URL in the `<!-- page: … -->` line at the top of `docs/PROGRESS.md` when there is one (read it first); otherwise publish a new page and write its URL into that line.
6. **Tell the user** in chat: 3–5 short lines (stories built / left, tests, demo readiness, the top missing brief items, next step, risk) plus the page link. Then propose the commit; wait for their yes.
