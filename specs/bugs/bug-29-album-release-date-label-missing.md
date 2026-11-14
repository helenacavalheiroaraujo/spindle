# Bug 29 · Album page: release date and label missing

> Found in manual test M24 (story 28) · live site · 2026-11-14. Status: fixed in part 2026-11-14 (quotes, album over single, one retry, answers kept for one day; dates wrong in MusicBrainz itself stay wrong; DECISIONS 2026-11-14, bug 29).

## Description
On the live site, the album page shows neither the release date nor the label for about half of the albums. This data comes from MusicBrainz. We found three causes: a curly vs straight apostrophe in the title ("Let's Dance"), MusicBrainz refusing requests that arrive in quick succession (the failure is intermittent), and odd data ("AM" shows "1 January 2013", "Seven Days Walking" shows 80 tracks, "Divenire" shows 1 track). "The Dark Side of the Moon" always fails, and the cause is unknown.

## Steps to reproduce
1. Open https://spindle-three.vercel.app.
2. Search for "let's dance" and tap the album.
3. Look at the box under the cover: neither "Released" nor "Label" appears.
4. Repeat with "ziggy": sometimes they appear, sometimes they do not.

## Current vs expected behaviour
**Current:** for about half of the albums, the page shows only the year, with no release date or label; for some albums, the date or the track list is wrong.
**Expected:** every album that has a page shows the correct release date and label, every time the page opens.

## Customer impact
Poor user experience.

## Priority
P4
