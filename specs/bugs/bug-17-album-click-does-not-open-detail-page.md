# Bug 17 · Clicking an album does not open its detail page

> Found in manual testing · 2026-11-10. Status: fixed 2026-11-10 on the genre screen (DECISIONS 2026-11-10, bug 17). The search results and the home box keep the card in place (#44).

## Description
In a music category, when the list of records appears, clicking a record should open the record's detail page. The page should say "Nobody is selling this album right now."

## Steps to reproduce
1. Open one of the music categories.
2. The list of records appears.
3. Click on a record.

## Current vs expected behaviour
**Current:** The list of albums appears. Clicking an album does not navigate anywhere. The page itself shows the message that nobody is selling this album right now.
**Expected:** Clicking an album opens the album's detail page, which says "Nobody is selling this album right now."

## Customer impact
Poor user experience

## Priority
P4
