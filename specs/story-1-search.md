# Story 1 · Search for an album

> Part of the Spindle MVP specification. Build order, out of scope, shared rules and traceability: [`SPEC.md`](../SPEC.md).


**As a buyer, I want to type an album name, so I can see the versions that exist.**

## Scope
- Search box on the home page; results update as the user types, from the 3rd character
- The search matches the **album title** and the **artist name**; results are always **albums**
- Matching ignores upper and lower case and accents (e.g. "bjork" finds "Björk")
- The buyer sees **how many versions exist** (a count on each result), without browsing them: Spindle reduces them to one recommendation (story 3)
- Tapping an album opens the **priorities screen** (story 2)

## Use cases
1. **Search** → list of albums, **newest release first**
2. **Pick an album with active listings** → priorities screen (story 2)
3. **Pick an album with no listings** → message "Nobody is selling this album right now", without the priorities screen

## What each screen shows
- **Search result:** cover, album title, artist, release year, number of versions; label **"No listings"** when the album has no active listings

## Acceptance criteria
- [x] With fewer than 3 characters, no results are shown
- [x] "ziggy" returns *The Rise and Fall of Ziggy Stardust…*
- [x] "bowie" returns David Bowie's albums, newest first
- [x] Each result shows cover, title, artist, year and number of versions
- [x] An album with no listings appears with the label "No listings"
- [x] A search with no matches shows up to 3 albums with a word in the title or artist name close to the typed text: at most 1 letter different when 4–5 letters are typed, at most 2 when 6 or more are typed; each suggestion shows the full album title (e.g. "zigy" → "Did you mean *The Rise and Fall of Ziggy Stardust…*?")
- [x] With 3 letters typed and no matches, no suggestions are shown, only "No albums found"
- [x] "BOWIE" and "bowie" return the same albums; "bjork" finds "Björk"
- [x] With no album that close, it shows "No albums found"
- [x] Tapping an album with active listings opens the priorities screen (story 2)
- [x] Tapping an album with no listings shows "Nobody is selling this album right now" directly

## Edge cases
- Typos → up to 3 suggestions (rule in the acceptance criteria), or "No albums found"; never an empty screen
- Album with no listings → shown, not hidden
- Many results (e.g. 20+ albums by one artist) → all listed, newest first

## Data used
- **Album:** title, artist, release year, cover
- **Version:** album (only the count is used here)
- **Listing:** version (only used to know whether the album has listings)

## Moved to story 3
- Version details (release year, country, label, format, number of listings, lowest price) and the track list, with extra tracks (bonus tracks, B-sides, remixes) labelled **"Bonus"**: shown for the recommended version — to be specified in the story 3 interview

## Non-functional
- Works on phone and desktop
- All catalogue data is illustrative (Assignment 1, p. 12)

## Out of scope
- Search by artist with an artist page (possible future story)
- Filters (story 10)
