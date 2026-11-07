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
- Tapping an album opens the **album page**, with its list of versions

### Use cases
1. **Search** → list of albums, **newest release first**
2. **Open an album** → album page with all its versions
3. **Open a version** → its track list expands below it (collapsed by default)

### What each screen shows
- **Search result:** cover, album title, artist, release year; label **"No listings"** when the album has no active listings
- **Version (album page):** release year, country, label, format, number of listings, lowest price
- **Version, expanded:** track list; extra tracks (bonus tracks, B-sides, remixes) are labelled **"Bonus"**

### Acceptance criteria
- [ ] With fewer than 3 characters, no results are shown
- [ ] "ziggy" returns *The Rise and Fall of Ziggy Stardust…*
- [ ] "bowie" returns David Bowie's albums, newest first
- [ ] An album with no listings appears with the label "No listings"
- [ ] A search with no matches shows suggestions close to the typed text ("Did you mean *Ziggy Stardust*?")
- [ ] Each version shows year, country, label, format, number of listings and lowest price
- [ ] The track list is hidden until the user taps the version
- [ ] Extra tracks are labelled "Bonus" in the track list
- [ ] A version with no listings shows "No listings" instead of a price

### Edge cases
- Typos → suggestions by similar text, never an empty screen
- Album with no listings → shown, not hidden
- Many results (e.g. 20+ albums by one artist) → all listed, newest first

### Data used
- **Album:** title, artist, release year, cover
- **Version:** album, release year, country, label, format
- **Track:** version, position, title, is extra (yes/no)
- **Listing:** version, price (only count and lowest price are used here)

### Non-functional
- Works on phone and desktop
- All catalogue data is illustrative (Assignment 1, p. 12)

### Out of scope
- Search by artist with an artist page (possible future story)
- Filters (story 10)

---

## Traceability

Every requirement maps to at least one feature and one automated test (Class 2, slide 26).

| Story | Requirement | Implemented in | Covered by test |
|---|---|---|---|
| 1 | | | |
