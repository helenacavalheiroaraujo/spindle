# Bug 28 · Clicking an album with no listings in search does not open its page

> Found in manual testing · desktop 1280 px · 2026-11-14. Status: fixed 2026-11-14 (the album opens its own page from every search place; the tag says why on hover and with the arrow keys; DECISIONS 2026-11-14, bug 28).

## Description
In the search box, clicking an album that has no items for sale does not redirect to the album's page. The message "Nobody is selling this album right now" appears below the list instead of on hover.

## Steps to reproduce
1. Type "bowie" in the search box.
2. Click "Blackstar" (labelled "No listings").

## Current vs expected behaviour
**Current:** Clicking the album does not redirect anywhere; the message "Nobody is selling this album right now" appears below the list.
**Expected:** Clicking the album opens the album's page; the message "Nobody is selling this album right now" appears on hover.

## Customer impact
Poor user experience

## Priority
P4
