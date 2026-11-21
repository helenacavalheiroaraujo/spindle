# Bug 36 · The address is empty in "Your account" but filled in at checkout

> Found in a user test · 2026-11-21. Status: open.

## Description
In "Your account" the delivery address is empty, but when I try to buy something the checkout already has it filled in.

## Steps to reproduce
1. Open "Your account" and look at the delivery address block.
2. Try to buy a record and open the checkout.

## Current vs expected behaviour
**Current:** The account shows an empty address and the checkout shows a filled-in one, without saying where it comes from.
**Expected:** The checkout says where the address comes from (owner's decision of 21 Nov 2026: an explanatory text).

## Customer impact
Poor user experience

## Priority
P4
