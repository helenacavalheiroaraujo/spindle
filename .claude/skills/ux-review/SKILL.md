---
name: ux-review
description: Reviews the UX/UI of the Spindle app as built — lists which screens the stories and the Assignment 1 designs need but are still missing, then checks every built screen (screenshots at 375 and 1280 px) against the designs in docs/design, the visual and safety rules in CLAUDE.md, and usability heuristics. Keeps a numbered findings register with a private HTML report. Use whenever the user asks to review, audit, check or validate the screens, the UI, the UX, the look, the layout, "what screens are missing", "does it match the design", "is it ready for the demo", or wants a usability or design pass on the app — even if they don't say "UX". Read-only unless the user confirms a specific change.
---

# UX review (Spindle)

Answer two questions about the app **as built**, in this order:

1. **Which screens are missing?** — screens the stories (`specs/`) and the Assignment 1 designs need, that `app/` does not have yet.
2. **What is wrong with the screens that exist?** — against the designs, the rules in `CLAUDE.md`, and usability heuristics.

The first answer comes first because it decides what gets built before the demo (15 Nov 2026); the second only decides what gets polished. Keep that order in the register, the report and the chat answer.

The user is the Product Owner and verifies by behaviour, not by reading code. Every finding must point at something she can see: a screenshot, a design page, or a quoted rule. A plausible finding without evidence wastes her time; a silent fix takes the decision away from her.

## Fixed rules

1. **Read-only.** Never edit app code, `SPEC.md`, `specs/`, `DECISIONS.md` or any project file unless the user has confirmed *that exact change*. "Fix it" / "corrige" is a request for a **proposal**.
2. **Only findings with evidence.** Each finding has at least one of: a screenshot path (`.ux-review/shots/…`), a design reference (`Spindle_mockups_by_section.pdf · p. N`, `HappyPath.png · screen N`), or a verbatim quote from `CLAUDE.md`, `specs/` or `DECISIONS.md`. No evidence, no finding.
3. **Finding numbers never change.** New findings get the next free number; closed ones keep theirs.
4. **Deliberate differences are not findings.** If the screen differs from the design and `DECISIONS.md` or the story records why, skip it.
5. **Heuristics stay low.** A usability-heuristic finding is `Low` unless it would stop a task in the demo flow (search → priorities → recommendation → listings → check → buy). This keeps generic advice from burying concrete gaps.
6. **The report is rebuilt every time the user decides something**, and republished.

## Inputs

- `specs/story-*.md` and `SPEC.md` (build order, phases, shared rules, traceability) — what screens should exist
- `DECISIONS.md` — deliberate differences from the design
- `CLAUDE.md` — visual direction and rules (see `references/checklist.md`)
- `docs/design/` — `HappyPath.png` (mobile flow), `Spindle_user_flow_desktop.png` (desktop flow), `Spindle_mockups_by_section.pdf` (all screens). Render the PDF once per run:
  `swift .claude/skills/spec-review/scripts/pdf_pages.swift docs/design/Spindle_mockups_by_section.pdf .ux-review/design`
- `app/**/page.tsx`, `loading.tsx`, `error.tsx`, `components/` — what is built
- `supabase/seed.sql` — the IDs used in routes (illustrative data)
- `docs/ux-review/findings.json` — the register (schema: `references/register.md`); create it on the first run

## How to run a review

### 1. Screen inventory (missing screens)

Build or update the `screens` list in the register:

- From each story's Scope, Use cases and Edge cases, list every **screen** and every **visible state** that needs its own look (e.g. "checkout", "order confirmation", "Sorry, this record was just sold", "My listings"). From the design PDF/PNGs, add screens that the stories don't name.
- Match each to a route in `app/`. Status: `built`, `partial` (route exists but a required state or element is missing), `missing`, or `later` (story phase 4 / "if time allows", or not in this MVP per `SPEC.md`).
- Give each built screen a `route` with real seed IDs so it can be captured, and `auth: true` if it needs a signed-in user.
- Every `missing` or `partial` screen in phases 1–3 becomes a finding of type `Missing screen` (severity by phase: the next phase to build → `High`; a demo-flow screen → `Blocker`).

### 2. Capture

With the dev server able to start (`npm run dev`, same as the e2e tests), run:

```bash
npx playwright test -c .claude/skills/ux-review/scripts/capture.config.ts
```

It reads `screens` from the register and saves `.ux-review/shots/<key>-375.png` and `<key>-1280.png` (full page) for each screen with a `route`. For `auth: true` screens it creates a temporary confirmed test account through the Supabase admin key in `.env.local` (as `tests/e2e/login.spec.ts` does), logs in through the UI, and deletes the account afterwards. If capture fails, report the error; do not review from code alone without saying so.

Loading and error states are not captured (they need a slow or failing server). Check them by reading code: each route folder with data should have `loading.tsx` using `LoadingMask` and `error.tsx` using `ErrorScreen`.

### 3. Review each built screen

Look at both screenshots and the matching design page, then go through `references/checklist.md`:

- **Design mismatch** — elements, texts, order and layout that differ from the Assignment 1 screen (minus deliberate differences)
- **Rule broken** — a `CLAUDE.md` rule the screen breaks (traffic-light word, illustrative-data label, 375/1280 layout, shared loading/error, palette and type, tap targets)
- **Usability** — heuristics and basic accessibility

Before adding a finding, check the register: re-check open findings (mark `resolved` only if the new screenshot shows the problem gone) and avoid duplicates.

For each finding write: screen key(s), story, type, severity, one-line title, evidence, and a **proposal** in plain words (what should change, where) — or a **question** if the choice is hers.

### 4. Register, report, publish

- Update `docs/ux-review/findings.json` (bump `meta.iteration`, add an `iterations` entry).
- Build: `python3 .claude/skills/ux-review/scripts/build_report.py` → `.ux-review/report.html`, with the screenshots embedded.
- Publish with the Artifact tool as a **private** artifact. First time: no `url`; save the returned link in `meta.report_url`. Later: same file path in the same conversation, or `meta.report_url` as `url` from another conversation (read it first).

### 5. Answer in the chat

Report in English; chat answer in European Portuguese, short:
- missing screens: how many, by phase, with the demo-flow ones named
- open findings by severity and type; resolved this iteration
- the blockers (number and title)
- what was not checked (e.g. states not captured, capture failures)
- the report link

Then stop and let the user decide. Do not start fixing.

## When the user decides

- **Approved change** → it is a code or spec change: follow `CLAUDE.md` ("How we build a story", "Before I accept any change"). Mark the finding `resolved` only after a new capture shows it fixed.
- **Rejected** → `wont-fix`, with her reason. If it is a product decision, propose a `DECISIONS.md` entry (show the text first).
- **Deferred** → keep it open; add a to-do.
- **Missing screen she drops from the MVP** → `wont-fix`, and propose the `SPEC.md` / story change as current vs. proposed text.

## Histórico
- 2026-11-08 · Skill criada: ecrãs em falta primeiro, depois fidelidade aos mockups, regras do CLAUDE.md e heurísticas (estas sempre Low salvo se bloquearem a demo); screenshots Playwright a 375/1280; registo + relatório HTML privado · a Helena quis validar os ecrãs construídos e saber o que falta antes da entrega
