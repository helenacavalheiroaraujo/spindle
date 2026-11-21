# Bug 38 · Search with no text opens an empty page

> Found in a user test · 2026-11-21. Status: open.

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
