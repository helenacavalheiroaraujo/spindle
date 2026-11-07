# Story 8 · Sell a record for free (phase 3)

> Part of the Spindle MVP specification. Build order, out of scope, shared rules and traceability: [`SPEC.md`](../SPEC.md).


**As a seller, I want to list a record without commission, so selling pays off.**

## Scope
- **"Sell for free"** in the header; requires login (story 9)
- Seller searches the album (same search as story 1) → sees the **list of versions** (year, country, label, format) → picks the exact one
- Listing form: **condition**, **price**, **photos** (cover and record required; matrix optional)
- While typing the price, the seller sees the **typical range** for that version and the label the listing will get (story 6)
- First time selling: the seller adds their **city** and, optionally, a **shop name**
- **"My listings":** see, edit and remove own listings
- No commission: the seller receives the full price (shown on the form)

## Traffic light for new listings
- Automatic checks are out of scope, so every item of a new listing's checklist is **? (uncertain)** → new listings are always **yellow** in the MVP (rule from story 5)

## Use cases
1. **Start selling** → login if needed → search album → pick version
2. **Fill in the form** → publish → the listing appears under that version, yellow
3. **My listings** → see own listings with status (on sale / sold)
4. **Edit** a listing on sale → changes saved; price label updated
5. **Remove** a listing on sale → it no longer appears to buyers

## Acceptance criteria
- [ ] Sell requires login; after login the seller returns to the sell flow
- [ ] The seller can find an album and pick one version from the list
- [ ] Publish is disabled until condition, price, cover photo and record photo are filled in
- [ ] The typical range and the future price label are shown while typing the price
- [ ] A published listing appears under the chosen version, yellow ("Check")
- [ ] "My listings" shows the seller's listings with their status
- [ ] Editing the price of a listing updates its label
- [ ] A removed listing no longer appears to buyers
- [ ] Sold listings can be seen but not edited or removed
- [ ] The form says "No commission: you receive €[price]"

## Edge cases
- Version not in the catalogue → message "This version isn't in our catalogue yet"; no listing created
- Price of 0 or negative → refused
- Photo upload fails → clear message; the form keeps what was typed
- Listing bought while the seller is editing it → edit refused: "This record was just sold"

## Data used
- **Listing:** seller, version (claimed = actual for new listings), condition, price, photos, status (on sale / sold / removed), created date
- **Check result:** three items set to "uncertain" for new listings
- **User:** city, shop name (optional)
- **Condition grade:** fixed list in the buyer's language, with the collector code beside it — **Near mint** (NM · no marks), **Very good** (VG+ · light marks), **Good** (VG · audible noise), **Fair** (G · heavily played)
- Photos stored in Supabase Storage

## Non-functional
- Photo size limit: 5 MB each
- Works on phone (photos can be taken with the camera)

## Out of scope (MVP)
- Adding new versions to the catalogue
- Automatic photo / matrix checks (Assignment 1 p. 12)
- Paid plans for shops ("Spindle Pro")
