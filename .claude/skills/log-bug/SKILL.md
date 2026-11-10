---
name: log-bug
description: Registers a bug found in a manual test of the Spindle app as its own file in specs/ (specs/bugs/bug-N-title.md), using the fixed bug template (Description, Steps to reproduce, Current vs expected behaviour, Customer impact, Priority). Asks for each section in its own text box (with a suggested draft built only from what the user already said), polishes the English at the end, and links the bug to its row in docs/manual-tests.md. Use whenever the user says "regista um bug", "encontrei um bug", "falhou o M5", "log a bug", "report this bug", or fills a failed result in docs/manual-tests.md, even if they don't name the skill.
---

# Log a bug (Spindle)

Turn a failed manual test into a bug spec, in the user's own words, polished English, one file per bug.

The user decides every section. For each one you may propose a draft, built only from what she has already told you (her feedback, her notes on screenshots, the test row, her earlier answers); she accepts it, edits it or replaces it. The value of this skill is a consistent record that costs her little effort; adding facts she did not give would make the record wrong.

## Fixed rules

1. **One file per bug:** `specs/bugs/bug-N-<short-title>.md`. `N` = highest number ever used in `specs/bugs/bug-*.md` + 1 (start at 1). Never reuse or renumber. Check with `ls specs/bugs/bug-*.md`.
2. **The user's text is the source.** Never invent or add steps, causes, impact or priority. A suggested draft is allowed only if every statement in it comes from something she said or showed in this conversation; it is only text in the box until she accepts it. Never suggest a Priority or a Customer impact she has not hinted at. The English polish fixes grammar, clarity and register only; it does not change the meaning or add content.
3. **Nothing is written before the user says yes** to the final text (CLAUDE.md: changes in `specs/` are shown first).
4. **Do not edit `SPEC.md`**, the story files or the Traceability table. A bug is not a story; linking it there is a separate proposal (current vs proposed text) and only after a yes.
5. **Never delete, move or rename files.**
6. Repository text is in English; talk to the user in European Portuguese, short sentences.

## Step 1 — Find the bug

- If the user names a test (e.g. "M5") or asks to register "the failed ones": read `docs/manual-tests.md` and take the row(s). The failed rows are those whose **Result** is not "Not run" and not OK. Several failed rows = several bugs, one at a time, each through all the steps.
- If the user describes a bug with no test row, continue without one (no M# link).
- Show what the row already says (story, screen, what to do, what must happen, result with date and size) as context in the first question. Do not copy it into the bug unless the user's text says it.

## Step 2 — One box per section

Ask the five sections **in this order**, each in its own box (the AskUserQuestion tool; the user types in "Other"). One section per question, so she writes running text in each:

1. **Description** — what the bug is, in a few sentences.
2. **Steps to reproduce** — what she did, in order.
3. **Current vs expected behaviour** — what happens now, and what should happen.
4. **Customer impact** — what this does to the buyer or seller. Asked with the fixed impact options below.
5. **Priority** — one level of the fixed scale below (she may add a few words of her own).

Fixed options for **Customer impact** (the box shows these four; she picks one or types her own text in "Other"):
- Poor user experience
- Security
- Blocks a purchase or sale
- Confusing or wrong information

Fixed scale for **Priority**: P1 Blocker, P2 High, P3 Medium, P4, P5 Low. The question text lists the whole scale. The box has four options (the tool allows only four): P1 Blocker, P2 High, P3 Medium, P4. She types P5 Low (or "skip") in "Other". The bug file keeps her level exactly as chosen (e.g. `P4`, `P5 Low`).

Box rules:
- The question text names the section and, for the first one, shows the test row. Keep it short.
- **Suggested draft:** when her earlier words or screenshots give enough to base it on, put a draft of the section in the question text, in European Portuguese, labelled "Sugestão:", in her voice, short, with nothing she did not say. Say in one line what it is based on. Options: "Use the suggestion" (take it as her text), then "Skip for now". She edits or replaces it by typing in "Other".
- **No basis, no suggestion:** if nothing she said supports the section, do not guess. Use the plain options below. Customer impact and Priority never get a suggested draft: they always use their fixed options above.
- Plain options (all sections except Customer impact and Priority): "Skip for now" and "Not sure yet"; the real answer is the text she types in "Other". If she picks "Skip for now" or "Not sure yet", write `To be completed` in that section and say so at the end. For Customer impact and Priority, typing "skip" or "not sure" in "Other" gives `To be completed`.
- Do not combine sections in one box.
- Up to four questions fit in one call, but ask **one section per call** so each box can be answered in full before the next appears.

## Step 3 — Polish the English

Write the bug file from her answers, then polish all the text:
- Fix grammar, spelling, word choice and register (neutral, professional).
- Keep her meaning, order of steps, numbers, quoted UI texts (e.g. "Send review") and names exactly.
- If something is unclear or contradictory, do **not** guess: ask her one short question.
- If her answer is in Portuguese, translate it faithfully, with no fact added or left out.

## Step 4 — Show, then save

Show in the chat:
1. The complete bug file as it will be saved.
2. A short list in Portuguese of what the polish changed and why (3–6 bullets, so she learns), plus anything left as `To be completed`.
3. The one change to `docs/manual-tests.md`, if there is a test row: the Result cell for that row gets ` · Bug N (specs/bugs/bug-N-title.md)` after the existing result.

Wait for her yes. Then write `specs/bugs/bug-N-<title>.md` and update the Result cell. Do not commit unless she asks (CLAUDE.md: wait for the yes before committing).

## File format

```markdown
# Bug N · <short title>

> Found in manual test <M#> (story <S>) · <phone 375 px | desktop 1280 px> · <YYYY-MM-DD>. Status: open.

## Description
<her text, polished>

## Steps to reproduce
<her text, polished; numbered list only if she wrote steps one by one>

## Current vs expected behaviour
**Current:** <…>
**Expected:** <…>

## Customer impact
<her text, polished>

## Priority
<her text, polished>
```

- Omit the "Found in" line parts she did not give (no test row → no M#, no story). The date is today's date.
- The five section headings stay exactly as above.

## What to deliver

Chat answer in European Portuguese, short:
- the bug number and file
- the test row updated (or "sem linha de teste")
- sections left as `To be completed`, if any
