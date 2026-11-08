# Story 8 · Sell a record for free (phase 3)

> Part of the Spindle MVP specification. Build order, out of scope, shared rules and traceability: [`SPEC.md`](../SPEC.md).


**As a seller, I want to list a record without commission, so selling pays off.**

## Scope
- **"Sell for free"** in the header (on a phone, "+ Sell"); requires login (story 9). "My listings" is reached from the account menu (the user's initials, story 9 → Your account).
- "Sell for free" opens a search screen of its own, with the same search box and matching as story 1. Tapping an album opens its **list of versions** (year, country, label, format), even when nobody is selling it, and the seller picks the exact one. This screen does not show "No listings" or "Not in the demo"; each result shows how many versions the album has.
- Listing form: **condition**, **price**, **photos** (cover and record required; matrix optional)
- While typing the price, the seller sees "Typical for this pressing: €min–€max" and, next to it, the label the listing will get ("Below typical", "Typical" or "Above typical"). A version without a range shows neither (story 6).
- First time selling: the sell form also shows two fields, **city** and, optionally, **shop name**, until the seller has filled them in
- **"My listings":** see, edit and remove own listings
- No commission: the seller receives the full price (shown on the form)

## Designs
| Screen | Design |
|---|---|
| Sell form ("Sell a record") | `Spindle_mockups_by_section.pdf` p. 16 (phone), p. 20 (desktop) |
| List of versions to pick from | **None yet: Canva design needed before building** |
| First time selling: city and shop name | Fields on the sell form, option C (a row "Add your city" that opens them): `docs/design/sell-form-first-time-options.html` (phone), `docs/design/sell-form-first-time-desktop.html` (desktop) |
| My listings | **None yet: Canva design needed before building** |

## Traffic light for new listings
- Automatic checks are out of scope, so every item of a new listing's checklist is **? (uncertain)** → new listings are always **yellow** in the MVP (rule from story 5)

## Use cases
1. **Start selling** → login if needed → search album → pick version
2. **Fill in the form** → publish → the listing appears under that version, yellow
3. **My listings** → see own listings with status (on sale / sold); removed listings are not shown
4. **Edit the price** of a listing on sale → the new price is saved and its label is updated; condition, photos and version cannot be changed (to fix them, remove the listing and list it again)
5. **Remove** a listing on sale → the seller confirms ("Remove this listing?") → it no longer appears to buyers or in My listings, and a toast says "Listing removed" with an "Undo" button
6. **Undo** within 5 seconds of removing → the listing is on sale again as before and appears to buyers again; after 5 seconds the removal is final

## Acceptance criteria
- [ ] Sell requires login; after login the seller returns to the sell flow
- [ ] The seller can find an album and pick one version from the list
- [ ] "List for sale" is disabled until condition, price, cover photo and record photo are filled in and, the first time, the city
- [ ] The typical range and the future price label are shown while typing the price
- [ ] A published listing appears under the chosen version, yellow ("Check")
- [ ] "My listings" shows the seller's listings with their status
- [ ] Editing the price of a listing updates its label
- [ ] Editing a listing changes only its price, and the price rule applies
- [ ] A removed listing no longer appears to buyers
- [ ] Removing asks for confirmation first; the toast "Listing removed" with "Undo" stays 5 seconds
- [ ] Undo puts the listing back on sale with the same price, photos and "Check" light
- [ ] A price of 0, a negative one, text, more than 2 decimals or above €1000 is refused with its message and the listing is not created
- [ ] Sold listings can be seen but not edited or removed
- [ ] The form says "No commission: you receive €[price]"

## Edge cases
- Version not in the catalogue → message "This version isn't in our catalogue yet"; no listing created
- Price that is not a number above €0 with at most 2 decimals → refused: "Enter a price above €0, with up to 2 decimals"; price above €1000 → refused: "The maximum price is €1000"
- Photo upload fails → clear message; the form keeps what was typed
- Listing bought while the seller is editing it → edit refused: "This record was just sold"
- Listing bought while the seller is removing it → removal refused: "This record was just sold"
- Seller leaves the page within the 5 seconds → the removal is final

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
- Changing the city and the shop name after the first sale (next phase)
