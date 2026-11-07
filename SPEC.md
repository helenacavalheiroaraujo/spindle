# Spindle MVP — Specification

Based on the user stories of Assignment 1 (Product Specification Report).
Stack and hosting: see `DECISIONS.md`. Assignment 1 stated PHP; the MVP uses Next.js (reasons in `DECISIONS.md`).

## Build order
1. **Core:** stories 1, 2, 3, 5, 6
2. **Purchase:** stories 9 (sign-up, log in), 7, 2 (save to account)
3. **Seller:** story 8
4. **If time allows:** story 4, story 9 (reviews)

Not in this MVP: stories 10, 11

## Out of scope
- Search by artist with an artist page (possible future story)
- From Assignment 1, p. 12:
  - Real payments and shipping (simulated)
  - Automatic photo and matrix checks (results are mock data)
  - AI-written explanations (fixed text)
  - Google and Apple sign-in
  - Reviews from people who didn't buy
  - Real catalogue data
  - Links to other platforms

---

## Story 1 · Search for an album

**As a buyer, I want to type an album name, so I can see the versions that exist.**

### Scope
- Search box on the home page; results update as the user types, from the 3rd character
- The search matches the **album title** and the **artist name**; results are always **albums**
- The buyer sees **how many versions exist** (a count on each result), without browsing them: Spindle reduces them to one recommendation (story 3)
- Tapping an album opens the **priorities screen** (story 2)

### Use cases
1. **Search** → list of albums, **newest release first**
2. **Pick an album** → priorities screen (story 2)

### What each screen shows
- **Search result:** cover, album title, artist, release year, number of versions; label **"No listings"** when the album has no active listings

### Acceptance criteria
- [ ] With fewer than 3 characters, no results are shown
- [ ] "ziggy" returns *The Rise and Fall of Ziggy Stardust…*
- [ ] "bowie" returns David Bowie's albums, newest first
- [ ] Each result shows cover, title, artist, year and number of versions
- [ ] An album with no listings appears with the label "No listings"
- [ ] A search with no matches shows suggestions close to the typed text ("Did you mean *Ziggy Stardust*?")
- [ ] Tapping an album opens the priorities screen (story 2)

### Edge cases
- Typos → suggestions by similar text, never an empty screen
- Album with no listings → shown, not hidden
- Many results (e.g. 20+ albums by one artist) → all listed, newest first

### Data used
- **Album:** title, artist, release year, cover
- **Version:** album (only the count is used here)
- **Listing:** version (only used to know whether the album has listings)

### Moved to story 3
- Version details (release year, country, label, format, number of listings, lowest price) and the track list, with extra tracks (bonus tracks, B-sides, remixes) labelled **"Bonus"**: shown for the recommended version — to be specified in the story 3 interview

### Non-functional
- Works on phone and desktop
- All catalogue data is illustrative (Assignment 1, p. 12)

### Out of scope
- Search by artist with an artist page (possible future story)
- Filters (story 10)

---

## Story 2 · Say what matters to me

**As a buyer, I want to choose what matters most, so the pick fits me.**

### Scope
- Priorities screen ("What matters most to you?"), opened when the buyer taps an album in the search results
- Four options: **Sound**, **Price**, **Original**, **Condition**, each with a short plain-language line (e.g. Price: "I don't want to overpay")
- The buyer picks one or more and **ranks them by tap order**: the first tap is 1, the second is 2, and so on
- Button **"See recommendation"** → story 3

### Use cases
1. **Pick** → the option is marked with its rank number
2. **Unpick** (tap again) → the option is cleared and the remaining numbers close the gap (e.g. 1, 2, 3 → remove 2 → 1, 2)
3. **Continue** → the recommendation (story 3) uses the ranked list
4. **Change** (from the recommendation) → back to this screen with the current ranking filled in

### Phase 2 (with accounts)
- Signed-in buyer: the ranking is **saved to the account**
- Signed-in buyer **with a saved ranking**: the screen is **skipped**; the recommendation shows "Based on: Price, Sound · **Change**"
- Without an account, or without a saved ranking: the screen is always shown

### Acceptance criteria
- [ ] Tapping an album in the search results opens this screen
- [ ] "See recommendation" is disabled until at least one option is picked
- [ ] Each picked option shows its rank number, in tap order
- [ ] Unpicking an option renumbers the others without gaps
- [ ] All four options can be picked
- [ ] The recommendation receives the options in rank order
- [ ] *(Phase 2)* A signed-in buyer's ranking is saved and reused on the next album
- [ ] *(Phase 2)* With a saved ranking, the screen is skipped and "Change" is shown on the recommendation

### Edge cases
- No option picked → cannot continue
- Buyer unpicks everything → button disabled again
- Saved ranking but this album is different → "Change" on the recommendation

### Data used
- **Priority ranking:** ordered list of up to four of sound, price, original, condition
- *(Phase 2)* **User preferences:** user, ranking

### Non-functional
- Options large enough to tap on a phone
- Rank numbers are not shown by colour alone (accessibility)

---

## Story 3 · Get one recommendation

**As a buyer, I want one version picked for me, and why, so I don't get lost.**

### Scope
- Recommendation screen ("Get this one"), opened from the priorities screen (story 2)
- Picks **one version among those with active listings**, using the buyer's ranked priorities
- Shows **why**, in plain language, tied to the buyer's priorities
- Below it, the listings for that version (story 5)

### How the pick is made
- Each version has a **score from 1 to 5** for each criterion: sound, price, original, condition (illustrative data)
- Each rank position has fixed **weights**: 1st = 3, 2nd = 2, 3rd = 1, 4th = 0.5 (starting values, to be tuned)
- **Total = sum of (score × weight)** for the chosen priorities; the highest total wins
- **Tie:** the cheaper version wins
- Only versions with at least one active listing can be recommended

### What the screen shows
- **Recommended version:** name (e.g. "2012 Remaster"), release year, country, label, format, number of listings, lowest price
- **Matches:** tags for the chosen priorities where the version scores 4 or 5 (e.g. "Matches: sound", "Matches: price")
- **Reasons:** up to 3 short sentences from fixed text (e.g. "Costs €32, vs €185 for a first pressing")
- **Technical terms** (e.g. "remaster", "first pressing", "matrix") always come with a short plain explanation
- **Source:** "Based on N collector ratings · Illustrative data"
- **Track list:** collapsed; tap to open; extra tracks labelled **"Bonus"**
- **Alternative:** the best version on the 1st priority alone, shown small, only if different from the recommendation (e.g. "Cheapest option: 1990 Reissue, €24")
- **Ideal but unavailable:** if the best version overall has no listings, a small note: "The ideal pressing for your priorities is the 1972 UK original, but nobody is selling it right now."
- **"Change"** (priorities) → back to story 2

### Acceptance criteria
- [ ] With "1. Price, 2. Sound" and the example data, the 2012 Remaster is recommended (22 vs 19 points)
- [ ] With "1. Price" only, the 1990 Reissue is recommended
- [ ] On a tie, the cheaper version is recommended
- [ ] A version with no listings is never the main recommendation
- [ ] If the best overall version has no listings, the "ideal but unavailable" note is shown
- [ ] The alternative is shown only when it differs from the recommendation
- [ ] "Matches" tags appear only for chosen priorities with a score of 4 or 5
- [ ] Every technical term on the screen has a plain explanation
- [ ] The source line is shown
- [ ] The track list is collapsed until tapped; extra tracks show "Bonus"

### Example data for the tests
| Version | Price score | Sound score | Lowest price |
|---|---|---|---|
| 1990 Reissue | 5 | 2 | €24 |
| 2012 Remaster | 4 | 5 | €32 |

### Edge cases
- No version of the album has listings → no recommendation; message: "Nobody is selling this album right now" + the ideal version
- Only one version has listings → it is recommended; no alternative
- Conflicting priorities → the weighted total decides; the alternative shows the other side

### Data used
- **Version:** release year, country, label, format, scores (sound, price, original, condition), number of collector ratings
- **Track:** version, position, title, is extra (yes/no)
- **Listing:** version, price (count and lowest price)
- **Glossary term:** term, plain explanation
- **Reason text:** fixed sentences per version

### Non-functional
- The recommendation is calculated in one place (one function), covered by unit tests
- All data labelled illustrative

### Out of scope (MVP)
- 30-second previews (story 11)
- Social proof ("128 buyers chose…", "last copy sold…")
- "Compare pressings" (story 4, phase 4)
- AI-written explanations (fixed text, Assignment 1 p. 12)

---

## Traceability

Every requirement maps to at least one feature and one automated test (Class 2, slide 26).

| Story | Requirement | Implemented in | Covered by test |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |
