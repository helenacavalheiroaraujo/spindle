# Story 5 · See verified listings

> Part of the Spindle MVP specification. Build order, out of scope, shared rules and traceability: [`SPEC.md`](../SPEC.md).


**As a buyer, I want listings already checked, so I can buy without fear.**

## Scope
- List of listings for the recommended version: beside the recommendation on desktop; on its own screen on phone, opened with "See verified listings" (story 3)
- Each listing has a **traffic light**, calculated from a **checklist** (mock check results, Assignment 1 p. 12)
- Tapping a listing opens the **listing check** screen ("Is it really this one?")

## The checklist (per listing)
Three items, each **✓ matches**, **? uncertain / no photo**, or **✗ does not match**:
1. Cover and label match the version
2. Country and year match
3. Matrix photo matches

## Traffic light rule
- **Red — No match:** any item is ✗
- **Yellow — Check:** no ✗, but at least one ? (including a missing matrix photo)
- **Green — Match:** all three ✓

## What the screens show
- **Listing (in the list):** traffic light with its word (Match / Check / No match), price, condition, seller, city, **Buy** (green and yellow only)
- **Order:** green and yellow mixed, **cheapest first**; red listings at the end
- **Red listing:** "It's a different pressing · moved to [version]"; "Not for sale here"; no Buy button
- **Listing check screen:** traffic light and one-line summary; the checklist; the seller's photos (cover, record, matrix); the condition explained in plain words (e.g. "VG+ means very good, with light signs of wear"); **"Buy with protection"** (green and yellow)
  - **Summary:** green "All three checks match this version"; yellow "One check is uncertain" (or "Two…", "Three checks are uncertain"); moved here "Moved here · check pending"; red "It's a different pressing · moved to [version]"
  - **Moved here:** the three items show "? Check pending", because they were checked against another version
  - **Red listings open it too**, with no "Buy with protection"
  - **Missing photo:** its place says "No matrix photo" (or cover / record)
- **Yellow:** Buy (in the list or on the listing check screen) first shows a warning that says what is uncertain (e.g. "The matrix photo isn't sharp. If it turns out to be another pressing, you get your money back."), with "Continue to checkout" and "Back"

## Use cases
1. **See listings** for the recommended version
2. **Open a listing** → listing check screen
3. **Buy** (green / yellow) → purchase (story 7)
4. **Red listing** → appears here as a warning and also under the **correct version**, where it is shown **yellow** ("Moved here · check pending"), because its checklist was made against the claimed version

## Acceptance criteria
- [ ] All three items ✓ → green, "Match"
- [ ] No ✗ and at least one ? → yellow, "Check"
- [ ] Missing matrix photo → yellow, never green
- [ ] Any ✗ → red, "No match"
- [ ] Green and yellow listings are sorted by price, cheapest first; red listings come last
- [ ] Red listings have no Buy button and show the version they were moved to
- [ ] A red listing also appears in the list of its correct version, yellow, with "Moved here · check pending"
- [ ] Yellow listings show the warning before buying, from the list and from the listing check screen
- [ ] Buyer protection is shown for green and yellow only
- [ ] The listing check screen shows the checklist, the photos and the condition in plain words

## Edge cases
- No listings for the version → story 3 handles it (the recommendation only picks versions with listings)
- All listings red → no Buy button anywhere; message: "No listing matches this version yet"
- Listing without photos → matrix item is ?, so the listing is yellow
- Red listing whose correct version is not in the catalogue → not handled in the MVP: every red listing in the illustrative data has its correct version in the catalogue

## Data used
- **Listing:** claimed version, actual version, price, condition, seller, city, photos (cover, record, matrix)
- **Check result:** listing, item (cover/label, country/year, matrix), result (match / uncertain / no match)
- **Condition grade:** code (e.g. VG+), plain explanation

## Non-functional
- The traffic light rule lives in one function, covered by unit tests
- Check results are mock data, labelled illustrative

## Out of scope (MVP)
- Messaging the seller ("Ask the seller", story 10)
- Automatic photo and matrix checks (Assignment 1 p. 12)
