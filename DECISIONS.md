# Technical decisions — Spindle MVP

> Decided **before the first prompt**, as required by the assignment brief (section 5) and Class 2, slide 11.
> Most recent first.

## 2026-11-07 — Stack, hosting and testing

| Part | Choice | Why |
|---|---|---|
| App (frontend + backend) | **Next.js** (simplest setup) | Very popular → more documentation and better AI output; frontend and backend in one project |
| Hosting | **Vercel** (free plan) | Near-instant start (under 1–2 s), even after being idle → lower risk during the live demo; deploys from GitHub |
| Database | **PostgreSQL on Supabase** (free plan) | Built-in sign-up and login (story 9); built-in file storage for photos (story 8); visual table editor to check the data |
| End-to-end tests | **Playwright** | Simple setup; waits for elements automatically; official Next.js guide |
| Unit tests | **Vitest** | Simple setup; fast |

**Criteria (Class 2, slide 11):** familiarity · ecosystem maturity · hosting target · how well the AI knows the stack
**Priority:** deliver safely

**Familiarity:** reading code will always be hard for me, in any language
→ so I choose among the **most popular stacks in the community**
→ **How I verify:** by behaviour, not by reading code: automated tests for every flow, linked to the acceptance criteria, and evidence (test output or screenshot) before accepting any change (Class 2, slides 27, 28 and 31)

**Accepted risk:** the free Supabase plan pauses a project after 1 week without use
→ open the app at least once a week and always check it before the demo

### Change from Assignment 1
Assignment 1 (p. 12) stated PHP. I changed to Next.js for the reasons above → **to be noted in SPEC.md**
