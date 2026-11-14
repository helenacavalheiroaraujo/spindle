# Bug 30 · Autofilled email is cleared in the log-in window

> Found in feedback on the app · 2026-11-14. Status: open.

## Description
In the log-in window (story 27), an email filled in by the browser or a password manager is cleared when the user types in the password field.

## Steps to reproduce
1. While signed out, open the log-in window (menu "Log in", Buy, Add to cart or Sell).
2. Let the browser fill in the email.
3. Type the password.

## Current vs expected behaviour
**Current:** the email field goes empty, so logging in fails or the user has to type the email again.
**Expected:** the filled-in email stays, as on the /login page.

## Customer impact
Poor user experience

## Priority
P1 Blocker
