# Story 34 · Listen to the album

> Part of the Spindle MVP specification. Build order, out of scope, shared rules and traceability: [`SPEC.md`](../SPEC.md).

**As a buyer, I want to hear the songs before choosing, so I know the album is the one I want.**

## Scope
- On the album page (story 28), each track in the track list has a **▶ Preview** pill at the end of its row that plays a 30-second preview from iTunes (option B, approved 14 Nov 2026). While playing, the pill turns navy and shows ❚❚ and the time played ("❚❚ 0:12").
- A line above the list says: "Previews are from the album on iTunes, not from a specific pressing."
- Only one preview plays at a time; tapping Preview on another track stops the first.
- Tracks are matched to iTunes by title (ignoring case, accents, quotes and text in brackets such as "(2012 Remaster)"). A track with no match has no play button.
- If iTunes does not answer, no play buttons and no line show; the rest of the page stays.

## Use cases
1. **Open Ziggy Stardust → play "Starman"** → 30 seconds play; tap play on "Five Years" → "Starman" stops

## Acceptance criteria
- [ ] Matched tracks show "▶ Preview" at the end of the row; unmatched tracks show none
- [ ] The line about the album, not the pressing, shows whenever at least one play button shows
- [ ] One preview at a time; while playing the pill is navy with ❚❚ and the time played; accessible label "Play preview of Starman" / "Pause preview of Starman"
- [ ] Title matching is a pure rule with a decision table (`lib/rules/`)
- [ ] iTunes down: no buttons, no line, the page works; 375 px and 1280 px

## Edge cases
- Track list from our database (MusicBrainz down, story 28): matching works the same way
- Two tracks with the same title: the first iTunes track in album order is used

## Non-functional
- Play buttons at least 44 px; nothing plays by itself; English text only

## Designs
- Approved 14 Nov 2026, option B: `docs/design/track-preview-options.html`

## Out of scope
- Previews on the recommendation or version pages; full songs; Deezer

## Open points
None.
