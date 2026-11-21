# Bug 38 · Search with no text opens an empty page

> Found in a user test · 2026-11-21. Status: fixed 21 Nov 2026 (stories 37 and 38 session): the Search button is disabled until 3 characters in the header, home and results boxes; Enter does nothing under 3; the hint "Type at least 3 characters" stays in the suggestion box (bug 26).

## Description
Pressing "Search" with nothing typed shows an almost empty page with "Type at least 3 characters to search.", which does not make sense.

## Steps to reproduce
1. Open the search bar without typing anything.
2. Press "Search".

## Current vs expected behaviour
**Current:** An almost empty page opens.
**Expected:** The "Search" button is disabled until there are 3 characters (owner's decision of 21 Nov 2026).

## Customer impact
Poor user experience

## Priority
P4
