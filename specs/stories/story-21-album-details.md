# Story 21 · Album details without listings

> Part of the Spindle MVP specification. Build order, out of scope, shared rules and traceability: [`SPEC.md`](../SPEC.md).

**As a buyer, I want to know about an album even when nobody is selling it, so I can decide whether to wait.**

## Scope
- The page of an album with no listings (from the genre screen, search and suggestions) also shows:
  - a short description of the musician (first 3 sentences of the Wikipedia summary, with a link to the article)
  - the release date (full date)
  - the label
  - the track list
- The message "Nobody is selling this album right now" stays as it is.
- The page shows "Source: MusicBrainz · Wikipedia" instead of "Illustrative data".

## Acceptance criteria
- [ ] Kind of Blue shows "Released 17 August 1959", "Label Columbia", "About Miles Davis" with a link to Wikipedia, and 5 tracks from "So What" to "Flamenco Sketches"
- [ ] The release date and the label come from MusicBrainz; the musician's description from Wikipedia
- [ ] The label and tracks come from the usual track count among the album's releases (the earliest of them); incomplete editions and bonus-heavy reissues are skipped
- [ ] Phone (375 px) and desktop (1280 px) as in the design
- [ ] The message stays the same; nothing on this page is bookable

## Edge cases
- A source that fails does not hide the others; if none returns anything, the page shows "The details of this album are not available right now."
- Date with only a year (old albums): shown as the year

## Non-functional
- Data is fetched when the page opens and not stored
- Requests name the app generically ("Spindle-MVP"); no personal details
- Text is English

## Designs
- `docs/design/album-details-no-listings.html`, approved 2026-11-10

## Out of scope
- Details on the priorities, recommendation and listing screens
- Storing the data in the database; caching; other sources

## Open points
1. The "not available" note is not tested automatically (only with the services down).
