# Bug 31 · Search strip shown on the checkout pages

> Found in feedback on the app · 2026-11-14. Status: fixed 2026-11-14 — the single and cart checkout pages keep the empty cream strip, without the search (tests: checkout.spec.ts and cart.spec.ts "… without the search (bug 31)").

## Description
On desktop, the checkout pages show the header search.

## Steps to reproduce
1. On desktop (1280 px), open the checkout page of a record.

## Current vs expected behaviour
**Current:** the checkout pages show the header search.
**Expected:** the checkout pages show no search; the cream strip under the navy row stays, empty.

## Customer impact
Poor user experience

## Priority
P4
