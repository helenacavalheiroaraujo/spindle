# Technical decisions — Spindle MVP

> Decided **before the first prompt**, as required by the assignment brief (section 5) and Class 2, slide 11.
> Most recent first.

## 2026-11-07 — Decisions from spec review (iteration 1)

### Condition grades use the buyer's language: Near mint, Very good, Good, Fair (stories 3, 5, 8 · finding #8)
- **Why:** Spindle's buyers are not specialists; plain names follow Assignment 1's plain-language rule and the designs. The collector code (NM, VG+, VG, G) stays beside each name for sellers who know the Goldmine scale.
- **Trade-off accepted:** "Good" here means VG on the collector scale. New (sealed) records are left out of the MVP.

### Search suggestions: up to 3 titles at most 2 letters away (story 1 · finding #7)
- **Why:** "similar to the typed text" could not be tested; a fixed limit makes the criterion pass or fail, and still catches common typos.

### A moved listing is yellow under its correct version (story 5 · finding #6)
- **Why:** its checklist was made against the version the seller claimed, so nobody has checked it against the correct one; Assignment 1 says "uncertain check: show yellow, never green".

### An album with no listings shows the message straight away (story 1 · finding #5)
- **Why:** sending the buyer through the priorities screen only to say nobody is selling wastes two screens.

### Only active listings count (Shared rules · finding #4)
- **Why:** several stories count listings or show the lowest price; without one rule, sold, removed or wrong-version listings could inflate counts or show a price nobody can pay. Active = on sale and green or yellow; a red listing counts for its actual version.

### Reasons follow the buyer's priorities (story 3 · finding #3)
- **Why:** Assignment 1 asks for "reasons tied to my priorities"; one fixed text per version says the same to every buyer. One sentence per criterion, shown in the buyer's rank order, with prices taken from the listings so they never go stale.

### The price score is calculated from the listings, not stored (story 3 · finding #2)
- **Why:** prices change with the listings, so a stored score would go stale and contradict the prices the buyer sees.
- **Formula:** 5 × (cheapest lowest price ÷ this version's lowest price), rounded, minimum 1 — a version that is only slightly dearer keeps a good score; a much dearer one drops to 1.

### The condition score of a version is calculated from its best listing (story 3 · finding #1)
- **Why:** condition belongs to each copy, not to the version; a version with a near-mint copy and a worn copy has no single condition. The best copy on sale is what the buyer can get.

## 2026-11-07 — Process decisions

### User stories are reviewed with a project skill before they are built (spec-review)
- **Why:** the first manual review found contradictions between stories and with the designs (e.g. story 1 vs the designed flow). A skill makes the same review repeatable after every change to SPEC.md, with numbered findings, evidence and a report.
- **Rules:** read-only; every change proposed as current vs proposed text and written only after my yes; tested stories are not edited (a new story carries the decision); finding numbers never change.
- Skill: `.claude/skills/spec-review/` · register: `docs/spec-review/findings.json`

## 2026-11-07 — Product decisions (SPEC.md, story 4)

### The comparison picks versions automatically, by total score (story 4)
- **Why:** consistent with the recommendation and with Spindle's promise to do the work for the buyer; choosing versions by hand would bring back the "hundreds of versions" problem.

## 2026-11-07 — Product decisions (SPEC.md, story 8)

### Sellers pick the exact version from a list of versions (story 8)
- **Why:** unlike buyers, sellers already know which pressing they own; picking from the catalogue is what lets Spindle check the listing later.

### New listings are always yellow in the MVP (story 8)
- **Why:** automatic photo and matrix checks are out of scope, so the check is uncertain; Assignment 1 says "uncertain check: show yellow, never green".

### Cover and record photos required; matrix optional (story 8)
- **Why:** buyers need to see what they are buying; a missing matrix photo already keeps the listing yellow.

### Sellers can see, edit and remove their listings (story 8)
- **Why:** sellers need to correct prices and withdraw records sold elsewhere (they may also sell on other platforms). If time is short, editing is the first part to drop.

## 2026-11-07 — Product decisions (SPEC.md, story 7)

### Payment is simulated; only step 1 of the protection flow works in the MVP (story 7)
- **Why:** keeps phase 2 (the safe demo) small. The four steps are explained on screen; buyer confirmation (step 3) is the first item of phase 4.
- **Trade-off accepted:** "Seller is paid only after I confirm" (Assignment 1) is explained, not yet working.

### Buyer protection is a fixed €2 per order (story 7)
- **Why:** it is the assumption Assignment 1 wants to test ("about €2 per order"), easy to understand, and simple to calculate.

### The app never asks for card or bank details, not even simulated ones (story 7)
- **Why:** there is no real payment, so there is no reason to collect sensitive data.

## 2026-11-07 — Product decisions (SPEC.md, story 9)

### One account for buying and selling (story 9)
- **Why:** two account types would confuse users; paid professional accounts for shops can come after the MVP.

### No public profile page in the MVP; listings show "Shop" or "Private seller" and the city (story 9)
- **Why:** reviews come later, so a profile would be empty or need invented ratings, which would contradict "only verified buyers can review" in a product built on trust. Trust in the MVP comes from listing verification and buyer protection.

### Login only when buying or selling, returning to the same place (story 9)
- **Why:** visitors see the value (recommendation, verified listings) before being asked to sign up.

### No email confirmation or password reset in the MVP (story 9)
- **Why:** keeps the live demo independent of email delivery; not needed to show the core flow.

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
