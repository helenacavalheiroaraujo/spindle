# Bug 34 · The order buttons are too close together

> Found in a user test · 2026-11-21. Status: fixed 21 Nov 2026 — the two buttons are 12 px apart (test: confirmReceipt.spec.ts, bug 34).

## Description
On an order with the status "Paid", the buttons "It arrived, all good" and "Message the seller" touch each other.

## Steps to reproduce
1. Buy a record.
2. Open the order in "Your account".

## Current vs expected behaviour
**Current:** The two buttons touch each other.
**Expected:** There is visible space between the two buttons.

## Customer impact
Poor user experience

## Priority
P4
