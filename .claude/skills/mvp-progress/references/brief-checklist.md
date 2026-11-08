# Assignment 2 brief — checklist

Paraphrased from the Assignment 2 brief (ASI, MESG/FEUP; due Sunday 15 Nov 2026, 23:59; live demo 16–20 Nov). The original PDF is not in the repo. Each line says what the brief asks and where to look for evidence.

Status per line: **Done** / **Partly** / **Missing** / **Not checked** (say why it could not be checked).

## Assessment criteria (brief, section 6)

| # | Criterion | Where to look |
|---|---|---|
| 1 | Core features work from start to finish | Demo happy path (search → priorities → recommendation → listings → checkout → confirmation); stories in phases 1–2 built; UX review Blocker findings |
| 2 | Data tables: quality and coherence (attributes, primary and foreign keys) | `supabase/migrations/` committed; `docs/database.md` matches the migrations |
| 3 | Testing evidence, automated **and** manual | Test runs of this report; rows "Not tested automatically"; a record of the manual check of every screen (`docs/manual-tests.md` if it exists) |
| 4 | LLM good practices visible in the repo | SPEC.md, `specs/`, CLAUDE.md or AGENTS.md, ARCHITECTURE.md, DECISIONS.md, `docs/AI_USAGE.md`, tests — all committed |
| 5 | UX and UI quality, reviewed with the LLM and compared with the Assignment 1 mockups | `docs/ux-review/findings.json`: open findings by severity |
| 6 | App online and reachable at the address given | Open the Vercel address in the browser; the latest commit is pushed (`git log origin/main..main`) |
| 7 | Live demo: clear and focused, 5 minutes, realistic data | A demo script exists and has been rehearsed |

## What to submit on Moodle (brief, section 4)

| # | Item | Where to look |
|---|---|---|
| S1 | Link to the running app | The Vercel address, checked online |
| S2 | PDF with the data tables and screenshots of the web app | The PDF file, or its source in `docs/` |

## Rule from the brief to apply when judging risk
The brief says a small product that works and looks good is worth more than a large one half finished. When time is short, recommend cutting secondary stories before leaving the core flow, the PDF, the demo script or the manual check incomplete.
