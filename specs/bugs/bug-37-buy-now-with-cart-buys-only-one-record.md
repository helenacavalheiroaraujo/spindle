# Bug 37 · "Buy now" with records in the cart buys only that record, without a notice

> Found in a user test · 2026-11-21. Status: open.

## Description
I added a record to the cart and then pressed "Buy now" on another record: only the "Buy now" record was bought. I think the feature makes sense, but it is confusing.

## Steps to reproduce
1. Put a record in the cart.
2. Press "Buy now" on another record.

## Current vs expected behaviour
**Current:** Only the "Buy now" record is bought, with no notice.
**Expected:** A notice says that only this record is bought and the cart does not change (owner's decision of 21 Nov 2026).

## Customer impact
Poor user experience

## Priority
P3 Medium
