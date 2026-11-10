# Bug 15 · Sign-up reveals which emails are registered

> Found during manual testing · 2026-11-10. Status: partly fixed 2026-11-10: generic message in place; a new email is still signed in at once while email confirmation is off (DECISIONS, accepted risk).

## Description
I found a security flaw. On login, with a wrong password or a wrong email, the same message appears ("That email and password don't match. Check them and try again."), so it is not possible to tell which one is incorrect, and that is fine. But when creating an account, the message "This email already has an account" appears, which makes it possible to find out that an email is registered.

## Steps to reproduce
1. On login, try a wrong password.
2. On login, try a wrong email.
3. Create an account with an email that is already registered.

## Current vs expected behaviour
**Current:** When creating an account with an email that is already registered, the message "This email already has an account" appears, which reveals that the email is registered.
**Expected:** To be completed

## Customer impact
Security.

## Priority
P2 High
