# CLAUDE.md — Spindle MVP

Spindle helps non-specialist buyers pick the right pressing of a vinyl record and buy a verified copy safely. MVP for Assignment 2 (ASI, MESG/FEUP): due 15 Nov 2026, 5-minute live demo.

## Read first
- `SPEC.md` — what to build: build order, out of scope, shared rules, traceability, and links to each story
- `specs/story-*.md` — one file per story. The source of truth for scope and acceptance criteria.
- `ARCHITECTURE.md` — parts, folder structure, where each kind of code goes
- `DECISIONS.md` — why things are as they are. Never reverse a decision without asking me.
- `docs/spec-review/findings.json` — review findings still open

## Keep it simple
- The simplest version that passes the acceptance criteria. Nothing that is not in SPEC.md; if something seems missing, ask.
- No ready-made component libraries (packages of pre-built buttons, cards and forms with their own look): screens are built with Next.js and styled with Tailwind only.
- Ask me before installing any new package, and say why.
- Rules are pure functions in `lib/rules/`; database access only in `lib/db/`; screens never re-implement a rule.
- Loading and errors always use the shared `LoadingMask` and `ErrorScreen`.

## How we build a story
1. Before starting: list the open findings for this story in `findings.json` and ask me to decide each one. Do not build until they are decided.
2. Data tables before screens (`supabase/migrations/`, described in `docs/database.md`).
3. One flow at a time, in small changes.
4. Tests in every flow, written with the code: a Vitest decision table for each rule (from the SPEC's acceptance criteria and example data); a Playwright test for each critical flow.
5. Fill in the story's rows in the SPEC's Traceability table.

## Before I accept any change
Explain it in plain language, without jargon. I verify by behaviour, not by reading code:
- **What** changed (2–3 bullets) and in which files
- **Why**: which acceptance criterion or decision it serves
- **Evidence**: test output or a screenshot. If something was not tested, say so.
- **Screens**: a change to a screen shows a phone (375 px) and a desktop (1280 px) screenshot; Playwright runs every critical flow at both sizes.
- **Doubts**: anything you were unsure of, or anything that differs from SPEC.md

Wait for my yes before committing.

## Record as we go
- Every new decision and its reason go in `DECISIONS.md` (most recent first), in the same commit. Show me the text first.
- SPEC.md and `specs/` changes are shown as current vs proposed text, and saved only after my yes.
- At the end of each session, propose a row for `docs/AI_USAGE.md`.

## Visual direction (Assignment 1 designs, `docs/design/`)
- Warm cream background; dark navy for primary buttons and selected states; dark brown for emphasis cards. Rounded cards with thin borders; pill-shaped buttons and tags.
- Headings in a bold condensed sans-serif; body text in a plain, readable sans-serif.
- The traffic light always shows its word (Match / Check / No match), never colour alone; illustrative data is always labelled.
- Phone first: one column, large tap targets. On desktop, listings sit beside the recommendation.

## Safety
- Keys only in `.env.local` and Vercel settings: never commit them or print them.
- No card or bank details anywhere, not even fake ones.
- Everything in the repo (code, UI text, docs) is in English.
