# Bug 33 · Cart count does not update when a record leaves the cart

> Found in a user test · 2026-11-21. Status: open.

## Description
When a record sold to someone else leaves the cart on its own, the cart count in the header still shows 2, but there is only 1 item in the cart.

## Steps to reproduce
1. Have 2 records in the cart.
2. One of them is sold to someone else and leaves the cart with the message.
3. Look at the cart count in the header.

## Current vs expected behaviour
**Current:** The count shows 2 and the cart has 1 record.
**Expected:** The count shows the number of records in the cart.

## Customer impact
Poor user experience

## Priority
P4
