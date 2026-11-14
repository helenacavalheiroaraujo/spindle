# Bug 27 · Name asked twice in checkout

> Found in manual testing · 2026-11-13. Status: fixed 2026-11-14 — the checkout's Name starts with the account name when there is no saved address and no earlier order; it can still be edited (DECISIONS 2026-11-14, bug 27; test: checkout.spec.ts "checkout: fee and total…").

## Description
At checkout, the buyer is asked for their name twice.

## Steps to reproduce
To be completed

## Current vs expected behaviour
**Current:** the name is asked for twice.
**Expected:** the name is asked for only once.

## Customer impact
Poor user experience

## Priority
P4
