# Technical decisions — Spindle MVP

> Decided **before the first prompt**, as required by the assignment brief (section 5) and Class 2, slide 11.
> Most recent first.

## 2026-11-07 — Product decisions (SPEC.md, phase 1)

### Tapping an album opens the priorities screen, not a list of versions (stories 1–2)
- **Why:** this is the flow in my Assignment 1 designs, and Spindle's value is to *reduce* hundreds of versions to one pick. Showing every version is what existing marketplaces already do.

### Priorities are chosen for each album; signed-in buyers with saved priorities skip the screen (story 2)
- **Why:** visitors without an account still see the recommendation before being asked to sign up; frequent buyers are not slowed down; priorities can change from one record to another ("Change" on the recommendation).

### Buyers rank their priorities by tap order (story 2)
- **Why:** different buyers value different things (price for some, sound for others), so a fixed order would be wrong for many of them.

### The recommendation uses weights, not strict order (story 3)
- **Why:** Assignment 1 asks for "the best balance" when priorities conflict; strict order would let a small saving beat a much better sound. Fixed weights (3 / 2 / 1 / 0.5) keep it predictable and testable with decision tables.

### The main recommendation is always a version on sale; the ideal one, if unavailable, is shown as a note (story 3)
- **Why:** the story promises "so I don't get lost", so the main pick must be something the buyer can buy; the note keeps Spindle transparent, which builds trust.

### Listings: green and yellow mixed by price, red at the end (story 5)
- **Why:** buyer protection covers green and yellow, so both are safe to buy; red cannot be bought, so it never comes first. Clarity to be checked in the UX/UI review.

### The traffic light is calculated from a three-item checklist (story 5)
- **Why:** one rule gives consistent results and follows Assignment 1 ("uncertain check: show yellow, never green"); it can be unit tested.

### The typical price is a stored range per version, not calculated from current listings (story 6)
- **Why:** an average of current listings depends on the listings it is judging: one listing is always "typical", and one overpriced listing changes everyone else's label. A stored range stands for past sales.

### Left out of the MVP
- Search by artist with an artist page; messaging the seller; 30-second previews; social proof; "Compare pressings" (phase 4 if time allows)
- **Why:** deadline and focus on the main buyer flow (search → priorities → recommendation → verified listings → buy).

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
