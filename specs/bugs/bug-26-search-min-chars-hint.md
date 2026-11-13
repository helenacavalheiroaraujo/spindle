# Bug 26 · No hint when the search text is under 3 characters

> Found in manual testing · 2026-11-13. Status: open.

## Description
When the user types in the search bar and has not yet typed 3 characters, no message says that at least 3 characters are needed. The user cannot tell why no albums appear.

## Steps to reproduce
Go through every page where the search bar appears and type 2 characters.

## Current vs expected behaviour
**Current:** With fewer than 3 characters, no albums appear and no message is shown.
**Expected:** A message says that at least 3 characters are needed.

## Customer impact
Poor user experience

## Priority
P4
