# Technical decisions — Spindle MVP

> Decided **before the first prompt**, as required by the assignment brief (section 5) and Class 2, slide 11.
> Most recent first.

## 2026-11-08 — Story 9 · Log in and log out

### Log out lives on a "Your account" page opened from the initials (story 9)
- **Why:** one page with name, email and Log out is simple to build and test, and keeps the corner as in the designs.
- **Trade-off accepted:** a page the SPEC did not list; it is private and is not the public profile (still out of scope).

### Log in and sign-up are two linked pages, not one page with tabs (story 9)
- **Why:** sign-up was already built and tested; two links keep it as it is, and the return address (`?next=`) travels in each link.
- **Trade-off accepted:** the return address must be carried between the two pages; only addresses inside Spindle are followed, anything else goes to the home page.

## 2026-11-08 — Process (push)

### Commits are pushed to GitHub at the end of every work session, after asking me (process)
- **Why:** 31 commits had piled up only on the laptop. A lost or broken laptop would have lost most of the MVP, and the Vercel version was out of date for testing and the demo. Asking first keeps a last check on what goes to GitHub and Vercel.
- **Trade-off accepted:** the published Vercel version shows unfinished flows between sessions (for example, sign-up before log in exists); if a session ends abruptly, the push can be missed.

## 2026-11-07 — Process (screenshots)

### Screenshots for the final PDF are saved by the Playwright tests, only on request (process)
- **Why:** the PDF needs current screens at 375 and 1280 px. The tests already open every screen, so they take the pictures. They are saved in `docs/screenshots/story-<n>/` only with `npm run screenshots` (`SCREENSHOTS=1`), because saving on every run would change the images in git each time, even with no visible change.
- **Trade-off accepted:** the images can fall behind the app between runs; `npm run screenshots` is run before the PDF. Test coverage metrics wait until after stories 7 and 8 (no new package now).

## 2026-11-07 — Story 9 · Accounts (sign-up)

### Sessions are kept in cookies with @supabase/ssr (story 9)
- **Why:** the server must know who is signed in, to check the profile before Buy / Sell and, later, to protect checkout (story 7) and selling (story 8). The package renews the session in cookies on its own (`proxy.ts`), so the app has no hand-written token refresh code, where errors are hard to catch in tests.
- **Trade-off accepted:** one more package (`@supabase/ssr`) and a `proxy.ts` file that runs before every page.

### Email confirmation is off in Supabase Auth (story 9)
- **Why:** the story asks that a new user is signed in straight after sign-up, and the demo must not depend on email delivery (the free plan limits emails per hour).
- **Trade-off accepted:** nobody checks that the email belongs to the person: someone can sign up with another person's address, a typo cannot be fixed (no password reset in the MVP), and "This email already has an account" shows which emails are registered. The setting applies to the whole Supabase project, including the Vercel version.

## 2026-11-07 — Story 9 · Accounts (database)

### The app's server code creates the profile at sign-up, not a database trigger (story 9)
- **Why:** a trigger hides the logic in SQL, where Vitest cannot test it and errors reach the user as a generic Supabase message. Keeping it in `lib/db/profiles.ts` keeps it visible and testable like every other flow. Story 9 needs no new migration: `profiles` already has `user_id`, `name`, `city` and `shop_name`.
- **Trade-off accepted:** sign-up becomes two steps (account, then profile). If the second fails, the account has no profile; the server checks for the profile at login and before Buy / Sell and creates it if missing.

### Phase 2 tables are created with their own story (process)
- **Why:** `orders` waits for story 7 and `user_preferences` for story 2, so their open findings (e.g. #12) are decided before the columns exist, and no correcting migration is needed.
- **Trade-off accepted:** more, smaller migrations instead of one for phase 2.

## 2026-11-07 — Process

### Options are shown without the AI's recommendation; I choose first (process)
- **Why:** a recommendation shown first anchors the choice. In stories 3, 5, 6 and 9 every finding was decided as the AI recommended, so the log could not show my own reasoning. Choosing first and then comparing with the AI keeps the decision, and its justification, mine.
- **Trade-off accepted:** each decision takes slightly longer.

## 2026-11-07 — Story 9 · Accounts (findings)

### After login from Buy, the user goes to the checkout (story 9 · finding #9)
- **Why:** tapping Buy already says what the user wants; sending them back to the listing makes them tap Buy twice. Matches story 7's edge case.
- **Trade-off accepted:** the checkout is built in story 7, so the Playwright test for this return is finished there; story 9 tests the return to the page the user came from.

### Sign-up has no "I also want to sell" box and no terms line (story 9 · finding #23)
- **Why:** there is one account for buying and selling, and seller details (city, shop name) are asked when selling (story 8). There are no terms or privacy pages, so the line would point to documents that do not exist. Differs from the Assignment 1 design on purpose.

## 2026-11-07 — Story 6 · Fair price (findings)

### The typical price is shown as a range, not one value (story 6 · finding #20)
- **Why:** a range explains why a price is "Typical"; the recommendation reasons (story 3) and the sell screen design already use a range.

## 2026-11-07 — Specification layout

### One file per user story in `specs/`; SPEC.md becomes the index
- **Why:** a single SPEC file with every story had grown long and was hard to read and work through. Separate files per story are easier to read and let each story be opened on its own while it is built. SPEC.md keeps what spans all stories (build order, out of scope, shared rules, traceability), so the path every document points to still exists.
- Files: `specs/story-<n>-<name>.md` · the spec-review skill reads both

## 2026-11-07 — Story 5 · Listing check screen

### On desktop, the listings sit beside the recommendation from 1024 px (stories 3 and 5 · finding #21)
- **Why:** 1024 px (Tailwind's `lg`) is the narrowest width where two columns keep the listing rows readable. Below it, tablets included, the phone layout with "See verified listings" is used. The demo runs on a laptop.

### The listing check screen's Back returns to where the listing was opened (story 5)
- **Why:** opened beside the recommendation (desktop), it goes back to the recommendation; opened from the phone list, it goes back to the list. The address says which (`from=recommendation`), like the ranking (story 2), so it survives a reload.

### The listing check screen takes the version in its address (story 5 · architecture)
- **Why:** the same listing is red under the version the seller claimed and yellow under its actual version, so the screen needs to know where the buyer came from: `/listings/[listingId]?version=[versionId]`. This keeps the folder in ARCHITECTURE.md. Without `version`, the claimed version is used.

### A listing moved here shows its three checks as "check pending" (story 5)
- **Why:** its results were made against another pressing; showing ✗ on a listing that is for sale here would contradict its yellow light and confuse a non-specialist buyer.

### Red listings open the listing check screen, without "Buy with protection" (story 5)
- **Why:** the buyer sees which checks failed and where the copy was moved, which is what makes the red light trustworthy.

## 2026-11-07 — Story 5 · Verified listings (findings)

### A red listing whose correct version is not in the catalogue is out of the MVP (story 5 · finding #33)
- **Why:** the data is illustrative and ours; every red listing in the seed has its correct version. Handling the case would make `actual_version_id` optional and add a migration, a seed case and a test for something the demo never shows.

### A red listing's price label uses the typical range of its actual version (story 6 · finding #10)
- **Why:** it follows the shared rule that a red listing counts for its actual version; the claimed version's range would compare it with the wrong pressing.

## 2026-11-07 — Story 3 · Recommendation (findings)

### A version with no listings scores 0 on price and condition when finding the ideal version (story 3 · finding #28)
- **Why:** one scoring rule for every version, with no special case. A buyer who ranks price never sees an expensive, unavailable pressing as their "ideal"; with sound or original ranked first and price unranked, the note still appears (e.g. "1. Original, 2. Sound" → 1972 UK original).

### A reason quotes the typical range of a version with no listings (story 3 · finding #32)
- **Why:** the comparison with the first pressing is the strongest reason to choose a remaster, and the typical range is already stored for story 6. "Typically" makes clear it is not a current listing.

## 2026-11-07 — Story 2 · Priorities

### The ranking travels in the page address (story 2 · architecture)
- **Why:** the recommendation reads the ranking from the address (e.g. `/albums/7/recommendation?priorities=price,sound`), so it needs no database in phase 1, survives a reload during the demo, and "Change" can refill the priorities screen with the current order. Unknown or repeated values in the address are ignored.

### Story 2 is built for phase 1 only; finding #11 waits for phase 2 (process)
- **Why:** saving a ranking needs accounts (story 9), which come later in the build order. Whether "Change" replaces a saved ranking is decided when accounts exist.

## 2026-11-07 — Story 1 · Search

### Search and suggestions run on the full album list, in a pure rule (story 1 · architecture)
- **Why:** matching must ignore accents ("bjork" finds "Björk", finding #30), which plain database search cannot do without an extra extension, and the suggestions (finding #29) need every title and artist anyway. The catalogue is small, so reading every album per search is fast. The rules stay in `lib/rules/` and are unit-tested.
- **Trade-off accepted:** a catalogue of many thousands of albums would need the search moved into the database. Changes step 2 of the search example in ARCHITECTURE.md.

### The server reads the database with the Supabase secret key (architecture)
- **Why:** RLS blocks every public read, so `lib/db/` uses `SUPABASE_SECRET_KEY`. It has no `NEXT_PUBLIC_` prefix, so it never reaches the browser. It must also be added to the Vercel settings.

### Generated covers and photos (seed)
- **Why:** real album covers are copyrighted, and links to them could break during the demo. The covers and listing photos are simple generated images labelled "Illustrative".

## 2026-11-07 — Project setup

### Supabase in the cloud, tables applied with the Supabase CLI (process)
- **Why:** the app must be online for the demo, so the database lives in the cloud from the start. The CLI applies the migrations and the illustrative data with one command, so the database can be rebuilt the same way before the demo; pasting SQL by hand is easy to get wrong.
- **Trade-off accepted:** one more development package (`supabase`). No local database (it would need Docker).

## 2026-11-07 — Decisions from spec review (iteration 2)

### Search results show no price or listing count (story 1 · finding #19)
- **Why:** "from €24" is the cheapest copy of any pressing, often not the one Spindle recommends; it anchors the buyer on a price the recommendation then contradicts. Whether an album can be bought is already shown by the "No listings" label. Differs from the Assignment 1 design on purpose.

### Search suggestions compare each word, with a tolerance that grows with the typed text (story 1 · finding #29)
- **Why:** compared with the whole title, a typo was never "2 letters away", so the criterion's own example failed. Short texts need less tolerance: with 2 letters allowed, any 3-letter text is close to "the" or "and". Replaces the rule decided for finding #7.
- **Trade-off accepted:** a search with several misspelled words (e.g. "zigy stardst") may get no suggestion.

### Search ignores upper and lower case and accents (story 1 · finding #30)
- **Why:** buyers often type without capitals or accents, especially on a phone; it keeps the search tests unambiguous and costs almost nothing.

## 2026-11-07 — Phone and desktop checks (CLAUDE.md)

### Every screen is checked on phone and desktop (process)
- **Why:** the SPEC asks for phone and desktop, and some criteria depend on screen size (story 3: listings beside the recommendation on desktop, on their own screen on phone; story 4: 2 versions on phone, 3 on desktop). I verify by behaviour, so each screen change shows both sizes, and the end-to-end tests run at both sizes. Before the demo, the app is also checked on a real phone.

## 2026-11-07 — Database decisions (docs/database.md)

### Store facts, calculate judgements (architecture)
- **Why:** the traffic light, active listings, price and condition scores and the price label are calculated by the rules in `lib/rules/`, never stored; a stored judgement goes stale when the data changes (same reason as findings #1 and #2).

### Illustrative sellers have no account (architecture)
- **Why:** demo listings need sellers, but creating fake accounts with emails and passwords adds risk and work for no visible gain. Sellers in the seed have a name and city only and cannot log in.

### Only phase 1 tables are created now (process)
- **Why:** keeps the database as small as the current phase needs; orders and saved priorities are described in `docs/database.md` and created when phase 2 starts.

### Condition grade explanations (stories 3, 5, 8)
- Near mint: "Almost like new, no marks" · Very good: "Light signs of wear" · Good: "Visible wear and some audible noise" · Fair: "Heavily played, noticeable noise"
- **Why:** written for buyers who are not specialists (plain-language rule, finding #8).

## 2026-11-07 — Project rules (CLAUDE.md)

### Every change is explained in plain language, with evidence, before I accept it (process)
- **Why:** I verify by behaviour, not by reading code; the assignment asks to "verify each change before accepting it". Each change states what changed, why, the evidence (test output or screenshot) and any doubts.

### Open review findings are decided before building their story (process)
- **Why:** deciding before building changes one sentence in SPEC.md, and the decision is mine. A vague rule left open is decided by the agent while building, by criteria I may not want; correcting it later means changing the rule, the code, the tests and the screens that use it.

### No ready-made component libraries; new packages only after my yes (architecture)
- **Why:** keeps the app simple and small enough for me to verify; the look comes from the Assignment 1 designs, not from a library's default style.

## 2026-11-07 — Architecture decisions

### TypeScript, not plain JavaScript (architecture)
- **Why:** many errors show up before the app runs; it is the standard in Next.js projects, and the AI works very well with it.
- **Trade-off accepted:** the code has more annotations, so it is a little harder for me to read.

### Tailwind CSS for styling (architecture)
- **Why:** spacing and colours come from a fixed scale, so screens stay consistent (checked in the UX/UI review); it is the Next.js default and the AI generates it quickly and reliably. It is not a component library, so it keeps the "no complex UI libraries" rule.
- **Trade-off accepted:** the HTML carries many style classes; I verify by behaviour and screenshots, not by reading the markup.

### No public API in the MVP (architecture)
- **Why:** it is not assessed in this assignment and the next brief is not known yet; all rules live in `lib/rules/`, so an API can reuse them later without reorganising the code.

## 2026-11-07 — Decisions from spec review (iteration 1)

### One shared rule for loading and errors (Shared rules · finding #16)
- **Why:** without it each screen would handle waiting and failures differently. Loading mask while loading; an error screen in plain language with "Try again" on failure; forms keep what was typed, so a failed payment or listing does not cost the user their input. In the architecture this becomes one shared component.

### Listings: beside the recommendation on desktop, on their own screen on phone (stories 3, 5 · finding #21)
- **Why:** follows the Assignment 1 designs; on a phone, the recommendation and the listings do not fit one screen.

### Before the architecture, only findings that affect it are resolved (process)
- **Why:** to reduce complexity now. #21 (how many screens) and #16 (shared loading and error states) change the folder structure and the shared components, so they are decided first. The other low findings (texts, small rules, phase 4) are decided before building the story they belong to.

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

**React comes with Next.js:** every Next.js screen is a React component, so React is not a separate choice. React draws the screens but brings no ready-made buttons or styles, so it keeps the "no complex UI libraries" rule.

**Criteria (Class 2, slide 11):** familiarity · ecosystem maturity · hosting target · how well the AI knows the stack
**Priority:** deliver safely

**Familiarity:** reading code will always be hard for me, in any language
→ so I choose among the **most popular stacks in the community**
→ **How I verify:** by behaviour, not by reading code: automated tests for every flow, linked to the acceptance criteria, and evidence (test output or screenshot) before accepting any change (Class 2, slides 27, 28 and 31)

**Accepted risk:** the free Supabase plan pauses a project after 1 week without use
→ open the app at least once a week and always check it before the demo

### Change from Assignment 1
Assignment 1 (p. 12) stated PHP. I changed to Next.js for the reasons above → **to be noted in SPEC.md**
