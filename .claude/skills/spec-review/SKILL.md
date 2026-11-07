---
name: spec-review
description: Reviews the Spindle user stories in SPEC.md for gaps, inconsistencies and ambiguities, including mismatches with the Assignment 1 designs in docs/design, and keeps a numbered findings register with a private HTML report. Use whenever the user asks to review, check, validate or "find problems in" the user stories, the SPEC, the acceptance criteria, or asks whether stories contradict each other or the design — and also when the user asks to "fix" or "correct" a story (that is a request for a proposal, not a change). Read-only unless the user confirms a specific change.
---

# Spec review (Spindle)

Find what is missing, contradictory or unclear in the Spindle user stories **before** they are built, and help the user close each point with an explicit decision.

The user is the Product Owner. The value of this review is that every finding is backed by evidence and every change is the user's decision. A plausible-sounding finding without evidence wastes their time; a silent edit takes the decision away from them.

## Fixed rules

1. **Read-only.** Never edit `SPEC.md`, `DECISIONS.md` or any other project file unless the user has confirmed *that exact change*. "Fix the story" / "corrige a US" is a request for a **proposal**, not a confirmation.
2. **Every change is proposed as a table** — current text vs. proposed text, with the file and section — and written only after the user says yes to it. Approval of one change never covers another.
3. **No changes to tested stories.** A story is *tested* when its row in the `## Traceability` table of `SPEC.md` has the "Covered by test" column filled in. For a tested story, do not propose edits: propose a **new user story** that carries the decision instead.
4. **The report is updated every time the user decides something** (approves, rejects, defers, or turns a finding into a new story): update the register, rebuild the report, republish it.
5. **Only findings with evidence.** Each finding quotes the exact text (from `SPEC.md`, `DECISIONS.md`, the Assignment 1 brief/report, or a named design screen) that shows the problem. No quote, no finding.
6. **Finding numbers (#) never change.** New findings get the next free number; resolved or rejected findings keep theirs. Never renumber, never reuse a number.

## Inputs

- `SPEC.md` — the stories (source of truth for *what*)
- `DECISIONS.md` — decisions and their reasons (source of truth for *why*)
- `docs/design/` — Assignment 1 designs: `HappyPath.png` (mobile flow), `Spindle_user_flow_desktop.png` (desktop flow), `Spindle_mockups_by_section.pdf` (all screens)
  - To look at the PDF pages, render them to PNG first:
    `swift .claude/skills/spec-review/scripts/pdf_pages.swift docs/design/Spindle_mockups_by_section.pdf .spec-review/design`
    then read the PNGs.
- `docs/spec-review/findings.json` — the findings register (create it on the first run; see `references/register.md`)

## What to check

Check every story in `SPEC.md`, then the stories against each other, then against the design.

**1. Template** — each story has:
- *As a / I want / So I* (the story sentence)
- *Scope*
- *Acceptance criteria*

(No Pre-condition section: dropped on purpose to keep the stories simple. What must be true before a story starts is described in its Scope.)

**2. Quality of the criteria**
- **Vague terms** with no measurable meaning ("fast", "clear", "easy", "some", "relevant", "similar")
- **Missing values** (limits, numbers, texts, orders, formats that a test would need)
- **Testability** — can each criterion be written as a test that passes or fails? (The user was a QA engineer: this is the bar.)
- **Missing states**: empty, error, loading, logged-out, no permission, already sold / removed, first-time use
- **Data**: every field a criterion or screen uses appears in "Data used"; each attribute sits on the right entity (e.g. something that varies per copy belongs to the listing, not to the version); stored values that should be derived (and would go stale)

**3. Across stories**
- The same thing described differently in two stories (texts, rules, where the user lands after an action)
- A rule in one story that breaks a rule in another
- Counting rules: which records count for totals, labels and "has listings"
- Flows that lead to a dead end or a screen no story defines
- Roles and permissions (e.g. can a user act on their own items)

**4. Story vs. design** (the Assignment 1 screens)
- Elements on a screen that no story mentions, or story elements missing from the screen
- Texts that differ (button labels, headings, messages)
- States the design shows that the story lacks, or the reverse
- Flow order (which screen follows which)
- If a story deliberately differs from the design and `DECISIONS.md` records why, it is **not** a finding.

## How to classify

**Type**
- **Gap** — something needed is missing (a section, a state, a value, a rule)
- **Inconsistency** — two sources say different things (story vs. story, story vs. design, story vs. Assignment 1, story vs. DECISIONS)
- **Ambiguity** — the text allows more than one reading, so two developers could build different things

**Severity**
- **Blocker** — only when the story **cannot be started** without an answer
- **High** — building it as written risks rework
- **Low** — details

## How to run a review

1. Read `SPEC.md`, `DECISIONS.md` and the register (if it exists). Look at the design images.
2. Re-check the open findings: if the text that caused one has changed, mark it resolved (with the iteration) only if the problem is really gone.
3. Look for new findings with the checklist above. Before adding one, check that it is not already in the register (open or resolved).
4. For each finding, write: stories, type, severity, a one-line title, the evidence (quotes with their location), and a proposal (current vs. proposed text). If the decision is the user's to make, add a **question** instead of guessing.
5. Update the register, build the report, publish it (see below).
6. Answer in the chat — short (see "What to deliver").

## When the user decides

For each decision:
- **Approved change** → show the exact table once more only if the text changed since it was proposed; write the change; add the decision and its reason to `DECISIONS.md` (most recent first) if it is a product decision; mark the finding **resolved**; commit both files together.
- **Rejected** → mark the finding **won't fix**, with the user's reason.
- **Deferred** → keep it open; add a to-do.
- **Tested story** → draft the new story, propose it as a table, write it only after a yes; mark the finding **moved to new story**.

Then rebuild and republish the report.

## Report

- Register: `docs/spec-review/findings.json` (schema in `references/register.md`) — committed with the project.
- Build: `python3 .claude/skills/spec-review/scripts/build_report.py` → writes `.spec-review/report.html` (git-ignored).
- Publish the HTML with the Artifact tool as a **private** artifact. First time: publish without `url` and save the returned link in `meta.report_url` of the register. Later: publish the same file path in the same conversation, or pass `meta.report_url` as `url` from another conversation (read the artifact first, as the Artifact tool requires).
- The report shows: summary, filters (type, severity, story, status), open findings, resolved findings, coverage, questions to close, to-do.

## What to deliver

Report in English (like the rest of the project). Chat answer in the user's language (European Portuguese), short:
- counts: open by severity and by type; resolved
- what was resolved in this iteration
- the blockers (number and title)
- the report link

Then stop and let the user decide. Do not start editing.

## Histórico
- 2026-11-07 · Retirada a secção Pre-condition do template verificado · a Helena quis reduzir a complexidade das stories nesta fase
- 2026-11-07 · Skill criada a partir das regras definidas pela Helena (só leitura, propostas em tabela, achados numerados com evidência, relatório HTML privado) · para rever as US do Spindle de forma repetível antes da arquitetura
