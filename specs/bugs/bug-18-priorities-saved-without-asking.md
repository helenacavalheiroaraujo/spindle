# Bug 18 · Priorities are saved without asking

> Found in manual testing · 2026-11-10. Status: closed 2026-11-10, not a bug: story 2 phase 2 and DECISIONS 2026-11-07 stay as built (a saved ranking is used automatically and the screen is skipped; "Change" replaces it). Decided by the owner.

## Description
When a user clicks an album, the priorities screen should appear. Today, once a signed-in user has chosen priorities once, they are saved automatically and the screen is skipped for every album.

## Steps to reproduce
1. Log in.
2. Open a category and click an album.
3. Choose priorities and click "See recommendation".
4. Go back to the list and click another album.

## Current vs expected behaviour
**Current:** The priorities screen is skipped and the recommendation opens straight away. The priorities were saved without the user asking.
**Expected:** The priorities screen appears when an album is clicked. A checkbox lets the user save their preferences (signed-in users only). Once saved, the screen appears again only when the user selects "Change".

## Customer impact
Poor user experience

## Priority
P4
