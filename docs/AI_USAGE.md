# AI usage log — Spindle MVP

> One row per working session with an AI agent (most recent first). Shows how the LLM was used and what I decided and verified.

| Date | Tool | Phase | What the AI did | What I did / verified | Kept? |
|---|---|---|---|---|---|
| 2026-11-07 | Claude Code (Opus 5.5) | Spec review iterations 2–3 · Project setup | Found 9 new findings (#28–#36), including a suggestion rule that failed its own example (#29); checked the brief and Class 2 slides on styling; installed the approved packages; configured Next.js, Tailwind, Vitest, Playwright and the Supabase CLI | Decided #19, #29 and #30; questioned Tailwind and kept it after checking the brief; approved the packages and the Supabase setup; approved every text before it was saved | Yes |
| 2026-11-07 | Claude Code (Opus 5.5) | Database | Drafted docs/database.md and the phase 1 tables; ran them in Supabase and checked the result; explained responsive testing | Approved the condition grade texts and the database decisions; asked for plain-language explanations and for product decisions to be separated from technical ones; added the phone and desktop check rule | Yes |
| 2026-11-07 | Claude Code (Opus 5.5) | CLAUDE.md | Drafted CLAUDE.md from SPEC, ARCHITECTURE, DECISIONS, the brief and the Assignment 1 designs; flagged that `.env.local` was not ignored by git | Set the rules (simplicity, tests in every flow, plain-language explanation before accepting, visual direction); removed terms I could not explain; approved every text | Yes |
| 2026-11-06/07 | Claude Code (Opus 5.5) | Stack and architecture · SPEC.md · Hosting | Compared stacks and hosting options; installed tools and created the repository; interviewed me story by story and drafted SPEC.md; created the spec-review skill, which found 27 findings; drafted ARCHITECTURE.md | Made every decision (stack, story rules, fixes to the findings, TypeScript, Tailwind, no API); reviewed and approved every text before it was saved | Yes |
