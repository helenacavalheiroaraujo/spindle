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

## Story 5 · See verified listings

**As a buyer, I want listings already checked, so I can buy without fear.**

### Scope
- List of listings for the recommended version, below the recommendation (story 3)
- Each listing has a **traffic light**, calculated from a **checklist** (mock check results, Assignment 1 p. 12)
- Tapping a listing opens the **listing check** screen ("Is it really this one?")

### The checklist (per listing)
Three items, each **✓ matches**, **? uncertain / no photo**, or **✗ does not match**:
1. Cover and label match the version
2. Country and year match
3. Matrix photo matches

### Traffic light rule
- **Red — No match:** any item is ✗
- **Yellow — Check:** no ✗, but at least one ? (including a missing matrix photo)
- **Green — Match:** all three ✓

### What the screens show
- **Listing (in the list):** traffic light with its word (Match / Check / No match), price, condition, seller, city, **Buy** (green and yellow only)
- **Order:** green and yellow mixed, **cheapest first**; red listings at the end
- **Red listing:** "It's a different pressing · moved to [version]"; "Not for sale here"; no Buy button
- **Listing check screen:** traffic light and one-line summary; the checklist; the seller's photos (cover, record, matrix); the condition explained in plain words (e.g. "VG+ means very good, with light signs of wear"); **"Buy with protection"** (green and yellow)
- **Yellow:** a warning before buying that says what is uncertain (e.g. "The matrix photo isn't sharp. If it turns out to be another pressing, you get your money back.")

### Use cases
1. **See listings** for the recommended version
2. **Open a listing** → listing check screen
3. **Buy** (green / yellow) → purchase (story 7)
4. **Red listing** → appears here as a warning and also under the **correct version**, where it is checked again

### Acceptance criteria
- [ ] All three items ✓ → green, "Match"
- [ ] No ✗ and at least one ? → yellow, "Check"
- [ ] Missing matrix photo → yellow, never green
- [ ] Any ✗ → red, "No match"
- [ ] Green and yellow listings are sorted by price, cheapest first; red listings come last
- [ ] Red listings have no Buy button and show the version they were moved to
- [ ] A red listing also appears in the list of its correct version
- [ ] Yellow listings show the warning before buying
- [ ] Buyer protection is shown for green and yellow only
- [ ] The listing check screen shows the checklist, the photos and the condition in plain words

### Edge cases
- No listings for the version → story 3 handles it (the recommendation only picks versions with listings)
- All listings red → no Buy button anywhere; message: "No listing matches this version yet"
- Listing without photos → matrix item is ?, so the listing is yellow

### Data used
- **Listing:** claimed version, actual version, price, condition, seller, city, photos (cover, record, matrix)
- **Check result:** listing, item (cover/label, country/year, matrix), result (match / uncertain / no match)
- **Condition grade:** code (e.g. VG+), plain explanation

### Non-functional
- The traffic light rule lives in one function, covered by unit tests
- Check results are mock data, labelled illustrative

### Out of scope (MVP)
- Messaging the seller ("Ask the seller", story 10)
- Automatic photo and matrix checks (Assignment 1 p. 12)

---

## Story 6 · Fair price

**As a buyer, I want to know if a listing is above or below the usual price.**

### Scope
- Each version has a **typical price range** (e.g. €28–€36), stored as illustrative data that stands for past sales
- Each listing shows a **price label** comparing its price with that range
- Below the list: "Typical price for this pressing: €28–€36"

### Label rule
- **Below typical:** price lower than the bottom of the range
- **Typical:** price within the range, limits included
- **Above typical:** price higher than the top of the range

### Acceptance criteria
- [ ] With a range of €28–€36: €24 → "Below typical"; €28 → "Typical"; €36 → "Typical"; €40 → "Above typical"
- [ ] Every listing in the list (green, yellow and red) shows its label
- [ ] The typical range is shown below the list
- [ ] A version without a range shows no label and no range line

### Edge cases
- Version with no range → no label (never a guess)
- Price exactly on a limit → "Typical"

### Data used
- **Version:** typical price minimum, typical price maximum
- **Listing:** price

### Non-functional
- The label rule lives in one function, covered by unit tests
- Typical ranges are illustrative data

### Moved to story 8
- "Sellers see the typical range when listing" (seller side, phase 3)

---

## Story 9 · Sign up, log in (reviews in phase 4)

**As a user, I want an account and a public profile, so others can trust me.**

### Scope
- **One account** for buying and selling
- Sign up with **name, email and password**; log in; log out
- Login is asked only when needed: **Buy** (story 7) and **Sell** (story 8); after login the user returns to where they were
- Header: "Log in" when signed out; the user's initials when signed in (as in the designs)
- On listings, the seller appears as **"Shop"** or **"Private seller"**, with the city

### Use cases
1. **Sign up** → account created, user signed in
2. **Log in** → user signed in
3. **Log out** → user signed out, back to the home page
4. **Buy or Sell without an account** → login / sign-up → back to the same listing or form

### Acceptance criteria
- [ ] A new user can sign up with name, email and password and is signed in
- [ ] A registered user can log in and log out
- [ ] Signing up with an email already in use shows "This email already has an account"
- [ ] A wrong password shows "Email or password is wrong" (without saying which one)
- [ ] Passwords shorter than 8 characters are refused
- [ ] Tapping Buy while signed out opens login and, after login, returns to the same listing
- [ ] The header shows the user's initials when signed in
- [ ] On listings, sellers with a shop name show "Shop"; others show "Private seller"

### Edge cases
- Email already used → clear message, no second account
- Session expired → asked to log in again at the next Buy / Sell
- User signs up from the Buy button → after sign-up, back to the same listing

### Data used
- **User:** name, email, password (handled by Supabase Auth, never stored by the app), city, shop name (optional, filled in when selling — story 8)
- *(Phase 2, story 2)* **User preferences:** user, priority ranking

### Non-functional
- Authentication through Supabase Auth; passwords never stored or logged by the app
- No email confirmation in the MVP, so the demo is not blocked by email delivery

### Out of scope (MVP)
- Public profile page (comes with reviews)
- Reviews (phase 4)
- Separate professional accounts / paid plans for shops (after the MVP; "Spindle Pro", story 11)
- Google and Apple sign-in (Assignment 1 p. 12)
- Password reset

---

## Traceability

Every requirement maps to at least one feature and one automated test (Class 2, slide 26).

| Story | Requirement | Implemented in | Covered by test |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |
| 5 | | | |
| 6 | | | |
| 9 | | | |
