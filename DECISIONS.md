# Technical decisions — Spindle MVP

> Decided **before the first prompt**, as required by the assignment brief (section 5) and Class 2, slide 11.
> Most recent first.

## 2026-11-09 — UX review iteration 5: findings #10, #24–#30 and the glossary
- **#10 A red listing links to the version it moved to:** on the listing check screen of a red listing ("It's a different pressing · moved to 1990 Reissue"), the words "moved to 1990 Reissue" are a link that opens the verified listings of that version, with the buyer's priorities kept in the address. Same on the red row in the listings (beside a version, or on the phone list). Why: the screen tells the buyer where the record belongs but gave no way to go there. Trade-off: one more path out of a warning screen; the back button still works. Story 5 is not changed (already built with tests); the rule lives here. Open point: if the new version has no active listings, the link still opens its listings page, which then shows its own "Nobody is selling" message (not decided).
- **#24 Genre screen:** about 12 px of space between the back button and the coloured banner, as on the other screens.
- **#25 Compare, phone:** the link under a version reads "See version" so it stays on one line; on desktop it stays "See this version".
- **#26 Lighter tags:** the priority pills in the top card of the comparison, the "Your #N" labels and the "Matches: …" tags on the version page use a light style (white with a thin border), so they no longer look like buttons. Navy stays for buttons, selected choices and the "★ Recommended" band. The "Matches" tags of the recommendation screen were already light.
- **#27 Sell form hint:** under the disabled "List for sale", one line lists everything still needed, in the order of the form, and shrinks as it is filled in: "Still needed: city, condition, front cover photo, record photo, price" (the city only the first time). It replaces "Add your city to continue".
- **#28 Back buttons:** "Back to home" on the sell search and "Back to versions" on the sell form, as on the version picker. (The sell search is the first sell screen, so its back button goes home.)
- **#29 Crates:** on the small crates of the home page the record sits a little higher and further out, so it never touches the genre name ("Electronic").
- **#30 Home, desktop:** the sentence "No jargon, no homework…" sits directly under the title, at the normal text size, as on a phone.
- **Glossary inside a title:** when a term in a title is tapped (e.g. "Reissue"), its explanation uses the normal text font and size, beside the word, not the large title style. Trade-off: in a title it can wrap onto two lines with a wide gap between them.
- **Code:** the unused "buy" mode was removed from the sell search (`AlbumSearch`); `AlbumRow` stays because the results page and the genre screen use it. New shared `components/BackLink.tsx` for the new back buttons.

## 2026-11-09 — Story 4 · Compare pressings
- **Sound word from a rule:** the 1–5 sound score becomes a short word: 5 "Very clean", 4 "Clean", 3 "Balanced", 2 "A bit flat", 1 "Flat". Why: the data only holds the score and the story asks for a word and no numbers. A fixed rule needs no migration. Trade-off: the words are ours, not written per version.
- **Typical price = the stored range:** the row shows the range of story 6 (e.g. "€28–€36"); a version with no range shows "Not known yet". Why: it is what the row name says. The approved design showed one number (€32) and was updated to the range.
- **First pressing = the album's oldest version:** "Yes" for the version with the oldest release year, "No" for the others, even when the oldest has no listings. Why: same meaning as story 3 (finding #52). Trade-off: in the demo data no column says "Yes", because the 1972 original has no active listing.
- **"Original" highlights "First pressing":** the buyer's priority "Original" ("I want the first pressing", story 2) marks the First pressing row; Price, Sound and Condition mark their own rows. "For sale" is never a priority.
- **Cover only in the top card:** the columns have no cover. Why: an album has one cover (`albums.cover_url`), so three columns would repeat it. If versions get their own covers later, each column can show its own (needs a new field).
- **Texts chosen by us:** "★ Recommended", "Next best", "Your #1", "Your #2", "See this version", "Back to compare", "Fit with your priorities", "Matches: …" / "Not a match: …", and the footer line. Ties between versions: the cheaper first (same rule as story 3).
- **Version page:** the page opened from a column is `/versions/<id>?priorities=…`. A listing opened from it goes back to the recommendation, not to the version page (open point, not decided).

## 2026-11-09 — Story 17 · Search decisions (findings #42–#45, #54)
- **#42 One heading:** up to 3 suggested albums sit under one heading "Did you mean…?", each with the full album title. Why: one heading is enough for up to 3 items; repeating it adds noise on a phone. The story 17 design shows the same.
- **#43 Suggestion order:** closest first; on equal distance, newest release first. Why: the spec was silent; it matches the "newest first" rule used for results.
- **#44 "Nobody is selling" card:** after tapping an album with no listings, the dark card with the album title and artist stays above the results. Why: the spec was silent; story 17 does not change this screen.
- **#45 Timing and texts:** the search waits 250 ms after typing; "Searching…" and "We couldn't load the albums. Check your connection." stay, used on /search in the shared `LoadingMask` and `ErrorScreen`. Why: the spec gives no texts or timing; chosen in story 1 and accepted.
- **#54 Old link:** the bare page "Nobody is selling this album right now." stays, and its "Back to search" link goes to /search. Why: story 1 already stops the buyer before this screen; the page only covers old links.
- **Short search text:** with fewer than 3 characters no search runs and the page shows "Type at least 3 characters to search.", keeping the typed text in the search box. Why: the user sees why nothing happened; no search was made, so "No albums found" would be wrong.

## 2026-11-08 — Build order of stories 17, 16 and 15 (process)
- **Decision:** story 17 (results page) is built first in phase 4, then story 4 and story 9 (reviews). Stories 16 (suggestions) and 15 (menu) are built only if time is left, in that order.
- **Why:** story 17 fixes the screen that confuses buyers on the demo path. The others are additions. A clear cut line keeps the week before 15 Nov for the demo script and the PDF.
- **Trade-off accepted:** without story 16, the results page opens only from Search or Enter. Story 16's "See all results" line is not there. Story 15 also has no approved design.
- **Seller search (story 8):** when story 16 is built, the sell search screen gets the suggestion box too; a suggestion opens the list of versions, not the recommendation. Until then it stays as built.

## 2026-11-08 — Story 14 outside the MVP (process)
- **Decision:** the desktop footer (story 14) is not part of the MVP. Its spec file stays.
- **Why:** it is not on the demo path, it has no approved design, and its links are undecided (there are no About, Terms or Contact pages). The week before the 15 Nov delivery goes to the demo script, the PDF and the stories that fix a real problem (17, 16).
- **Supersedes:** "Stories 14 and 15 in phase 4" for story 14. Story 15 stays in phase 4.
- **Trade-off accepted:** the desktop demo has no footer, so "All catalogue data is illustrative" shows only in the labels on each screen.

## 2026-11-08 — Real album covers (seed)
- **Decision:** the 10 seed albums use real covers, linked from Cover Art Archive (`coverartarchive.org/release-group/<id>/front-500`). This replaces "Generated covers and photos (seed)" for album covers only; listing photos stay generated.
- **Why:** real covers make the catalogue recognisable to a buyer. Links, not copies: the app stores no image files and no new package or key is needed. The ids were looked up once in MusicBrainz and saved in `seed.sql`.
- **Trade-off accepted:** (1) copyright: the covers belong to their owners; the app only links to a public archive, as an academic prototype. (2) If Cover Art Archive is slow or down, the covers do not show and there is no fallback (it returned one temporary error during checking); without internet the app would not work anyway. (3) Only the 10 seed albums; a new album still needs a link, because `cover_url` stays required. (4) The files in `public/covers/` are no longer used and were left in place.

## 2026-11-08 — Stories 16 and 17 · Search (spec)
- **Decision:** search results move from the home page to a page of their own (story 17); a suggestion box with covers (option B) appears under the search box (story 16). Story 1 stays as built.
- **Why:** after typing, the home page showed the results above the crates and the featured card, so it was unclear which page the buyer was on. The suggestion box covers "results while typing" and the page covers "all results".
- **Trade-off accepted:** story 1's "results update as the user types" on the home page is replaced. A decision made in story 1 is reversed, with the owner's approval.
- **Sell search (story 8):** decided in "Build order of stories 17, 16 and 15" above: it stays as built until story 16 is built.

## 2026-11-08 — Stories 14 and 15 in phase 4 (process)
- **Decision:** the desktop footer (story 14) and the menu (story 15) go in phase 4, "If time allows".
- **Why:** neither is needed for the 5-minute demo path, and neither has an approved design yet. They are cut first, together with the other phase 4 stories.

## 2026-11-08 — Story 4 (phase 4): compare pressings

### The version page is defined, from the "Compare pressings" columns (finding #14)
- **Why:** story 4 linked to a "version page" that no story defined. Design: `docs/design/version-page.html` (same blocks as the recommendation screen and the listings).
- **Decided:** option A, a dedicated page per version, with a "Back to compare" link.
- **Trade-off accepted:** one more screen to build and test.

### The comparison rows are plain words, not 1–5 scores (finding #26)
- **Why:** the design (`Spindle_mockups_by_section.pdf` p. 11) uses words (Cleaner / Warmer, Yes / No, Near mint / Worn). Scores stay inside the recommendation rule (story 3).
- **Differs from:** story 4 as first written ("scores 1–5").

## 2026-11-08 — Story 7 · Step 3 (phase 4): the buyer confirms receipt

### "It arrived, all good" sits on the "On its way" card in Your account; no "My orders" list page (story 7 · Phase 4)
- **Why:** the design (`Spindle_mockups_by_section.pdf` p. 8 phone, p. 10 desktop) shows the card on Your account; a list page has no design.
- **Decided:** orders still waiting show under "On its way"; confirmed ones move to "Delivered", without a button (my choice, so that a confirmed order does not stay under "On its way").
- **Differs from:** story 7 · Phase 4, which says step 3 "needs a My orders screen".

### The buyer can confirm right after paying, even though "Seller ships" does not work (story 7 · Out of scope)
- **Why:** step 2 is out of the MVP, so nothing marks an order as shipped; waiting for it would need a seller-side screen that has no design. "Shipped" stays undone on the bar.
- **Differs from:** the design, which shows "Shipped" already done.

### One more question before the money is released: "Are you sure? The money is released to the seller."
- **Why:** confirming cannot be undone. Buttons "Yes, release the money" and "Not yet" (my wording).
- **Trade-off accepted:** one extra tap on the happy path.

### "Report a problem" is not shown
- **Why:** refunds and disputes are out of scope (story 7). A button that does nothing would mislead.
- **Differs from:** the design, which shows the button.

### Confirming is one conditional update, not a database function
- **Why:** only an order of this buyer that is still "Paid · waiting for the seller" becomes "Seller paid", in one statement, so a double tap or two tabs confirm it once. No migration; `orders.status` already has `seller_paid`.

### A sold or removed listing opened from a link says "This record is no longer available", with "Back to search" (story 5 and 7 · finding #61)
- **Why:** the generic "not found" page does not say what happened. Applies to the listing check and the checkout. A listing that never existed stays "not found".

### Your account is as wide as My listings (max 2xl) instead of a narrow column
- **Why:** the order card with its four steps needs the width on desktop. My choice.

## 2026-11-08 — Light emphasis cards

### Emphasis cards are light sand, not dark brown (all screens)
- **Why:** the dark brown cards (order confirmation, "Nobody is selling this album right now", the listing check's condition, the "0% commission" card on the sell form) were too heavy and unbalanced the pages. They are now sand (#f1e6d0) with a thin border and navy text. The home page's featured card keeps the design's navy.
- **Differs from:** the Assignment 1 designs and `order-confirmation.html`, where these cards are dark brown.

## 2026-11-08 — Story 12 · Home page as in the design

### The home page follows the Assignment 1 design: six crates, navy featured card (story 12)
- **Why:** the colour balance of the design comes from six crates in different colours (tan, navy, dark brown, cream, grey) that spread the dark across the row, and from a navy featured card balanced by a light card. With three beige crates and a beige card the page looked flat. Replaces the earlier choices of showing only genres whose albums open and of a sand featured card.
- **Kind of Blue (Jazz), Com que voz (Fado) and Illmatic (Hip-hop) are showcase albums:** versions only, no listings, so those crates open as "No listings". Counts stay real. Illmatic was chosen by the AI; the design has no hip-hop album.
- **Exception to CLAUDE.md:** the strong colour of the featured card is the design's navy, not dark brown.
- **Left out:** the second right-hand card of the design ("48 first pressings just in"), "Because you like…" (story 13), "Best sellers", "Picked by the shop" and "All genres and formats".

## 2026-11-08 — Story 12 · MVP scope

### Story 12 (home page) is part of the MVP core, not phase 4 (process)
- **Why:** it was built before the brief items, the home page is the first screen of the demo, and it is tested and in the progress report. Replaces the earlier decision to keep it in "If time allows". Story 13 (wishlist) stays out of the MVP.

## 2026-11-08 — Story 12 · Demo data and featured album

### Genres and more demo albums, so every crate opens an album on sale (story 12)
- **Why:** with real counts only genres with albums show, and in the seed only Ziggy Stardust opens. Three crates (Rock, Soul and funk, Electronic) are closer to the design; completing Let's Dance and Homogenic and adding The Dark Side of the Moon and Megalithic Symphony means none of them leads only to albums that cannot be bought.
- **Kept for the tests:** Homogenic 1997 stays without listings (the sell tests publish on it); the search test's "only a sold copy" case moves from Let's Dance to Blackstar, which gets one sold listing.

### The featured album is chosen by a rule, not fixed (story 12)
- **Why:** a fixed album could sell out during the demo and leave the card pointing to "Nobody is selling". The album that opens with the most active listings is always one the buyer can buy.

## 2026-11-08 — Story 12 · Designs

### Genre screen: the tapped crate on top; This week: stacked cards, side by side on desktop (story 12)
- **Why:** the crate on top repeats the home page's look, so the buyer sees where they are. Stacked cards keep "For sellers" (the way into selling) always visible and are easier to use with a keyboard or screen reader than cards that scroll sideways; on desktop there is room for both in one row.
- **No price on the featured album:** search shows none either (finding #19).
- **Desktop header:** search, "+ Sell for free" and the account badge, as in the Assignment 1 desktop flow.

## 2026-11-08 — Story 12 · Home page (spec)

### The home page from the design becomes story 12, in phase 4; the wishlist is story 13, not in this MVP (process)
- **Why:** the design's home page makes the work more complete, but "Because you like…" needs a wishlist, which is a feature of its own. Splitting keeps story 12 to what the demo shows. Numbers 10 and 11 are already used for ideas outside the MVP.

### A crate opens a genre screen; crates show real counts; "This week" cards open existing flows (story 12)
- **Why:** a genre screen with the same rows as search shows what the crate promises without changing story 1, which is built and tested. Real counts always match the list that opens, so only genres with albums are shown (the demo has 5 albums). "This weekend" opens a featured album and "For sellers" opens selling (story 8), so no card is a dead end in the demo.

## 2026-11-08 — Story 7 · Yellow warning

### Opening the checkout address directly does not show the yellow warning (story 7 · finding #83)
- **Why:** Buy on a yellow listing always shows the warning first, so the normal path is covered. Only someone who opens the checkout address directly (e.g. a shared link) skips it, and they are still covered by the money-back promise. Changing it would mean a new story a week before the deadline.
- **Trade-off accepted:** a buyer arriving by a direct link can pay without having seen what is uncertain.

## 2026-11-08 — Story 5 · Condition sentence

### Condition explanations are written to follow "with" (story 5 · finding #59)
- **Why:** the listing check screen reads "[code] means [name], with [explanation]", as in the story's example. Only NM did not fit ("with almost like new, no marks"); its text becomes "No marks, almost like new". The sentence itself is unchanged.

## 2026-11-08 — Testing

### Loading and error screens are checked by hand, not by Playwright (process)
- **Why:** these screens belong to pages built on the server; a browser test cannot make the server's database read fail (search can, because it is a browser action). Making it fail would need test-only code inside the app. The manual test record, required by the brief anyway, covers them.
- **Trade-off accepted:** the five Traceability rows (stories 2, 3, 5, 7, 8) stay "Not tested automatically".

## 2026-11-08 — Story 2 · Save to account

### "Change" replaces the saved ranking (story 2 · finding #11)
- **Why:** one ranking per account is the simplest rule and matches "saved and reused on the next album". The recommendation always shows "Based on: … · Change", so the buyer sees which ranking is in use and can change it again.
- **Trade-off accepted:** a one-off change (e.g. a gift where only price matters) carries over to the next albums.

## 2026-11-08 — Story 8 (sell) · build

### Wording and behaviour written during the build (story 8)
- Sell flow: "Which record are you selling?", "Find the album, then pick your exact version. 0% commission.", "Listing your record…", "This photo is larger than 5 MB. Choose a smaller one.", "We couldn't read this photo. Choose a JPEG or PNG.", "We couldn't upload your photos. Nothing was listed; your details are kept.", "We couldn't list your record. Nothing was listed; your details are kept.", "No commission: you receive the full price" (while the price is not valid), "We couldn't load the versions / the sell form. Check your connection."
- My listings: "Nothing on sale right now. Sell a record", "Nothing sold yet.", "Price saved", "Saving…", "Loading your listings…", "We couldn't save the change. Check your connection.", "We couldn't put your listing back on sale. Check your connection.", "We couldn't load your listings. Check your connection."
- On a phone, "+ Sell" sits top left (the design's menu slot, not built), so it never covers the centred logo.
- The price accepts a comma as decimal point ("12,50") and a leading "€". Versions are listed oldest first; My listings newest first. "Save price" is disabled until the price changes.
- After "Save" in "Your details", the row shows the city (and shop name) with "Change"; "Close" drops what was typed. After "List for sale", the seller sees the version's listings, with no confirmation message.
- **Why:** the story and the designs give the rules, not these texts or details.
- **Trade-off accepted:** the wording and behaviour were not in the story; the sell search screen reuses the home layout and has no design of its own.

### Publishing is one database function, all or nothing (story 8)
- **Why:** a listing saved without its three check results would have no traffic light, and a first sale could save the listing but not the seller's city. One function (`create_listing`) does both or neither, the same approach as `place_order` (story 7).
- **Trade-off accepted:** the steps live in SQL, which Vitest cannot test; the Playwright sell flow covers them, and `lib/db/` turns each error into a plain message.

### Listing photos are public, sent through the app's server, and reduced in the browser first (story 8)
- **Why:** a public link works like the seed photos and needs no extra request each time a photo is shown. Sending through the server keeps the rule that the browser only talks to the app. Vercel refuses requests above 4.5 MB, so a 5 MB photo would fail online; the browser reduces each photo (longest side 1600 px, JPEG) before sending, and the story's 5 MB limit is checked on the original file.
- **Trade-off accepted:** anyone with a photo's link can see it, even after the listing is removed; stored photos have less detail than the originals; the sell form has more code. The 1600 px size, the €1000 check in the database and the bucket name were chosen by the AI.

## 2026-11-08 — Story 8 (sell) · designs and finding #12

### A seller sees "Your listing" instead of Buy on their own listings (stories 5, 7, 8 · finding #12)
- **Why:** one account buys and sells (story 9), so without a rule a seller could buy their own record and create an order that makes no sense. Showing "Your listing" in place of Buy tells the seller why they cannot buy it, before they tap. It also keeps the demo clean: after publishing, the seller sees their listing under the version without a Buy button.
- **Trade-off accepted:** the listing screens of stories 5 and 7, already built and tested, now need to know who is signed in, and get one more test. Their story files are not changed; this rule lives here. The text "Your listing" comes from the finding's proposal.

### My listings uses two tabs and a detail sheet (story 8 · finding #74)
- **Why:** of three options (buttons on each card, tabs and a detail sheet, sections with a "⋯" menu), tabs keep the list short and the sheet holds the whole price edit (range, label, "you receive") and "Remove listing" in one place. On desktop the sheet becomes a panel beside the list.
- **Trade-off accepted:** editing or removing is one tap deeper than buttons on the card, and sold listings sit in another tab. Sold rows cannot be tapped. The texts "On sale (n)", "Sold (n)", "Condition, photos and version can't be changed.", "Save price", "Remove listing", "Buyers will no longer see it.", "Keep it" and "Close", and the brick-red colour of the remove buttons, were chosen by the AI, not by the story or the visual direction.

### The seller picks a version, then taps "Continue" (story 8 · finding #72)
- **Why:** of three options (tap a row, choose then continue, table with a tip), choosing first lets the seller fix a wrong tap before going to the form. Each version shows its name with year · country · label · format.
- **Trade-off accepted:** one tap more than going straight to the form, and one more state to build and test ("Continue" disabled, with "Choose a version to continue"). The texts "Which one do you have?", "Check the year and label on the back cover or on the record.", "Continue", "Choose a version to continue" and "My version isn't here" were written by the AI, not by the story.

## 2026-11-08 — Story 8 (sell) · findings

### The city is required to list the first time; city and shop name cannot be changed later (story 8 · finding #82)
- **Why:** buyers see the seller's city on every listing, so a listing needs it. The first-time design (finding #73) already disables "List for sale" until the city is filled in. Changing city or shop name later has no screen and is a next-phase improvement.
- **Trade-off accepted:** a seller who moves or opens a shop cannot update the data in the MVP.

### Editing a listing changes only its price (story 8 · finding #80)
- **Why:** the acceptance criterion only asks for the price; a small price-only edit is the cheapest to design and test. A seller who got the condition, a photo or the version wrong removes the listing and lists it again.
- **Trade-off accepted:** fixing a condition or photo takes a remove plus a new listing. The price edit control (not designed yet) has to be part of the "My listings" design (#74).

### Price rule on the sell form: up to 2 decimals, above €0, at most €1000 (story 8 · finding #79)
- **Why:** the checkout adds amounts in cents and the database checks the same sum, so more than 2 decimals could break it at payment. The maximum catches typing mistakes such as €3000 for €30; the demo catalogue goes up to €185.
- **Trade-off accepted:** €1000 is an arbitrary limit, so a rare record above it cannot be listed in the MVP. The two messages were written by the AI, not by the story.

### The sell form shows the price label while typing (story 8 · finding #78)
- **Why:** the story asks the seller to see the label the listing will get. The Assignment 1 design only shows the range ("€24–34"); the label is added next to it, using the three labels of story 6. A version without a typical range shows neither (story 6).
- **Trade-off accepted:** the form differs from the design (p. 16 and p. 20) by one extra element, written by the AI into the approved first-time designs. The range is written "€24–€34", as in story 6, not "€24–34".

### The sell form's commission card only says what is true (story 8 · finding #77)
- **Why:** the Assignment 1 desktop card also promises that the listing is checked against the catalogue and that the seller is paid when the buyer confirms. Neither works in the MVP (automatic checks and steps 2 and 4 are out of scope). The card says "0% commission on every sale" and "No commission: you receive €[price]"; on a phone, the same line sits under the price.
- **Trade-off accepted:** the form differs from the Assignment 1 design (p. 20), which has the two extra sentences. The line under the price on the phone was added by the AI to the approved phone design.

### The sell button says "List for sale"; on a phone the header says "+ Sell" (story 8 · finding #76)
- **Why:** both follow the Assignment 1 design, so what is built matches what was approved. "List for sale" also fits the words "listing" and "My listings" used elsewhere.
- **Trade-off accepted:** the word "free" is not in the phone header; the "0% commission" message stays on the sell form.

### The matrix photo is optional on the sell form; no "More" photo slot (story 8 · finding #75)
- **Why:** a seller can publish with the cover and the record photo; without a matrix photo the listing is yellow with the warning "There's no matrix photo" (story 5), which is what the product shows. The first-time designs already say "optional". The extra "More" slot in the desktop design has no story.
- **Trade-off accepted:** differs from the Assignment 1 design (p. 16 and p. 20), which says "Matrix required" and has a "More" slot. Listings without a matrix photo exist, so buyers see the yellow warning more often.

### City and shop name are asked on the sell form, only the first time, as a row that opens the fields (story 8 · finding #73)
- **Why:** two extra fields on the form avoid a separate screen and an extra step in the first sale, which is the one the demo shows. Of three options (card at the top, section before the button, one row that opens), the row "Add your city" was chosen: it takes the least space and leaves the rest of the form as designed. The button "List for sale" stays disabled, with "Add your city to continue", until the city is filled in.
- **Trade-off accepted:** the sell form design (Assignment 1, p. 16 and p. 20) is extended with this row (`docs/design/sell-form-first-time-options.html` for the phone, `docs/design/sell-form-first-time-desktop.html` for the desktop). The form has two variants (with and without the row), and filling the city costs one extra tap. Once filled in, city and shop name cannot be changed in the MVP; changing them is a next-phase improvement (finding #82, to-do T12). The texts "Selling from", "Add your city", "Your details", "City", "Shop name (optional)", the line about the "Shop" tag and "Add your city to continue" were written by the AI, not by the story.

### The seller searches on a screen of its own, with the same search as story 1 (story 8 · finding #36)
- **Why:** in story 1, tapping an album opens the priorities screen, or the message "Nobody is selling this album right now" or "Not in the demo". A seller must reach the list of versions even when nobody sells the album. A separate screen opened from "Sell for free" shares the search box and the matching rules, and leaves the buyer's flow, which has tests, untouched.
- **Trade-off accepted:** there are two search screens to maintain; they share the component and the rules in `lib/rules/`. The seller's results do not show "No listings" or "Not in the demo", and keep the number of versions of each album.

### Removing a listing: confirm first, then a 5-second "Undo"; removed listings are not shown (story 8 · findings #35, #81)
- **Why:** removing is a safe, two-step action: the seller confirms ("Remove this listing?", buttons "Remove" and "Keep it"), and a toast "Listing removed" with "Undo" stays 5 seconds. The listing is removed at once, so no buyer can buy it meanwhile; Undo puts it back on sale as before. After 5 seconds, or if the seller leaves the page, the removal is final. "My listings" shows on-sale and sold listings only. If the listing is bought while the seller removes it, the removal is refused ("This record was just sold").
- **Trade-off accepted:** confirmation and Undo protect against the same mistake, so removing takes one more tap. The toast is a new element beyond `LoadingMask` and `ErrorScreen`; it must be in the "My listings" design (#74). The button names "Remove" and "Keep it" were suggested by the AI, not by the story.

### "My listings" is reached from the account menu; the header stays minimal (story 8 · finding #13)
- **Why:** the full header in the Assignment 1 design (search in the header, hamburger on phone) is not built, and there is no time to build it before the demo. Story 8 adds only what selling needs: "Sell for free", the user's initials when signed in, and a "My listings" link inside "Your account".
- **Trade-off accepted:** the header differs from the design (no search box, no hamburger menu). "My listings" takes two taps (initials, then My listings). The initials and menu are built with story 8, not story 9.

## 2026-11-08 — Story 7 (checkout and confirmation)

### Buyer protection fee is €2.00, not the €2.10 shown in the design
- **Why:** story 7 and its acceptance criteria say €2.00 (a €28 record totals €34.90). The Assignment 1 design shows €2.10, which would make the total €35.00.
- **Trade-off accepted:** the screen differs from the design by 10 cents; the story is the source of truth.

### The confirmation shows the record's actual version
- **Why:** the orders table does not store which version the buyer came from, so the confirmation reads the listing's actual version. Storing the chosen version would need a new column and a change to `place_order`, which the story does not ask for.
- **Trade-off accepted:** for a yellow listing, the checkout can show the claimed version and the confirmation the actual one.

### Wording and behaviour written during the build (story 7)
- "We couldn't complete the payment. Nothing was charged." when Pay fails; "Paying…" while it runs.
- The "Sorry, this record was just sold" message has a link "See other listings"; the typed address stays in the form.
- "Loading your order…" and "We couldn't load your order. Check your connection." on the confirmation.
- **Why:** the story gives the sold message but not these texts.
- **Trade-off accepted:** the wording was not in the story.

## 2026-11-08 — Audit of built stories (findings, iteration 5)

### Shops show their shop name and a "Shop" tag; private sellers show "Private seller" (story 9 · finding #64)
- **Why:** the Assignment 1 design names the shop ("Discos do Bairro"), and story 8 asks sellers for a shop name, so showing it uses data the seller gave. The "Shop" tag keeps story 9's criterion. A seller's personal name is never shown on listings.
- **Trade-off accepted:** a shop name is not verified by Spindle; trust in the record comes from the traffic light, so the tag has a neutral style and does not compete with it.

### Sign-up and login messages written during the build (story 9 · finding #66)
- **Why:** story 9 only states the rules (e.g. passwords shorter than 8 characters are refused), not the wording. The messages are short, say what to fix, and are covered by the tests.
- **Trade-off accepted:** the wording was not in the story.

### Yellow warning: one sentence per uncertain check, ending with the money-back promise (story 5 · finding #58)
- **Why:** story 5 gives one example ("The matrix photo isn't sharp. If it turns out to be another pressing, you get your money back."). The other uncertain cases (cover and label, country and year, no matrix photo, moved here) need a sentence of the same kind. The money-back sentence comes from story 5 and matches the protection explained in story 7.
- **Trade-off accepted:** the four extra sentences were written during the build, not in the story. The refund is promised but, like every protection step after step 1, does not work in the MVP.

### Only albums with recommendation data open; others show "Not in the demo" (story 3 · finding #50)
- **Why:** Hunky Dory has a listing for story 6 but no reason texts or tracks, so its recommendation would show an empty "Why this one" and "Track list (0)". Inventing that data adds work the 5-minute demo does not show. The rule lives in `lib/rules/` and the story 6 listing stays.
- **Trade-off accepted:** only Ziggy Stardust opens a recommendation in the MVP.

### Glossary terms show their explanation on tap, not always (story 3 · finding #48)
- **Why:** showing every explanation inline makes the recommendation long on a phone and repeats explanations when a term appears more than once. A tap keeps the screen short while every term still has its plain explanation one tap away.
- **Trade-off accepted:** differs from story 3 ("always come with a short plain explanation"). The only cue is a dotted underline, so a buyer may not discover the tap; the cue is not changed in the MVP.

## 2026-11-08 — Process (MVP progress)

### MVP progress report after each story (process)
- **Why:** an overview of what is left for the MVP after each story. `docs/PROGRESS.md` is the record kept in git; a private page shows the same content visually. Both are built in the same run, from the SPEC's Traceability table, the test runs, the open findings and a checklist of the Assignment 2 brief, so they cannot diverge.
- **Trade-off accepted:** each run takes about a minute because it runs the end-to-end tests. The page is outside the repo, so the evidence is the file, not the page.

## 2026-11-08 — Process (UX review)

### UX review as a repeatable skill: missing screens first, heuristics capped at Low (process)
- **Why:** to know which screens are still missing before the demo, and to check the built screens against the Assignment 1 designs and the CLAUDE.md rules, without generic usability advice burying the concrete gaps. Screens are judged from Playwright screenshots at 375 and 1280 px, the same sizes as the critical-flow tests.
- **Trade-off accepted:** building the skill took a working session one week before the deadline; loading and error states are not captured and are checked by reading the code.

## 2026-11-08 — Story 7 · Checkout (findings)

### Pay is one database function, all or nothing (story 7 · orders table)
- **Why:** marking the listing sold and creating the order must happen together, so the "just sold" case never leaves a sold listing without an order. Unlike the profile trigger rejected in story 9, the function is called explicitly from `lib/db/`.
- **Trade-off accepted:** the logic is in SQL, so Vitest cannot test it directly; the Playwright test for Pay covers it, including the "just sold" case.

### The order does not store the payment method; status "seller paid" exists from the start (story 7 · orders table)
- **Why:** MB WAY is the only method (finding #38), so a column would always hold the same value. "Seller paid" is kept so the final report shows the full order flow and phase 4 needs no new migration; nothing in the MVP sets it.

### The checkout postcode must have the Portuguese format 0000-000 (story 7 · finding #41)
- **Why:** with MB WAY as the only payment method the app is for Portugal only; the check catches typos before the order is created.

### On a yellow listing, login is asked at "Continue to checkout", after the warning (stories 5, 7, 9 · finding #40)
- **Why:** the buyer always reads the warning before any account step, and only those who go ahead log in; after login every buyer lands on the checkout, green or yellow.
- **Trade-off accepted:** story 9's criterion "Tapping Buy while signed out opens login" holds for green listings only; on yellow ones Buy opens the warning first.

### The confirmation screen leads back to search (story 7 · finding #39)
- **Why:** closes the demo loop in one tap; seeing orders in the account is phase 4 ("My orders").

### Only MB WAY on the checkout, as a label; no card or PayPal (story 7 · finding #38)
- **Why:** payment is simulated, so a choice between methods shows nothing; one label means less on screen and fewer tests. Replaces "MB WAY is selected by default" (finding #27).

### Buyer protection stays €2.00, not the design's €2.10 (story 7 · finding #37)
- **Why:** €2 is the assumption Assignment 1 tests ("about €2 per order"), decided on 2026-11-07. Differs from the Assignment 1 design (€2.10, total €35.00) on purpose.

### A seller buying their own listing waits for story 8 (stories 7 and 9 · finding #12)
- **Why:** demo sellers have no account, so no signed-in user can own a listing until story 8 (sell) exists. Decide the rule when story 8 is built.

### Checkout address is typed for each order; the payment method is a label only (story 7 · finding #24)
- **Why:** no personal data is stored beyond the order, and payment is simulated. Differs from the Assignment 1 design (saved address, MB WAY phone number) on purpose.

### The checkout explains what protection covers (story 7 · finding #25)
- **Why:** it states Spindle's value in one line during the demo; refunds themselves stay out of the MVP.

### MB WAY is selected by default on the checkout (story 7 · finding #27)
- **Why:** Pay depends only on the address, as the acceptance criterion says; one tap fewer in the demo.

## 2026-11-08 — Story 9 · Log in and log out

### Buy and Sell while signed out are built with stories 7 and 8, not in story 9 (story 9)
- **Why:** the login and return address already work; what is missing is the page to return to. Building the check on the real checkout (story 7) and the real sell form (story 8) avoids a placeholder page that would be rewritten, and the Playwright test is written once, against the real flow.
- **Trade-off accepted:** story 9 is closed with two criteria waiting ("Tapping Buy while signed out…" and Sell while signed out); they are the first step of stories 7 and 8.

### Log out lives on a "Your account" page opened from the initials (story 9)
- **Why:** one page with name, email and Log out is simple to build and test, and keeps the corner as in the designs.
- **Trade-off accepted:** a page the SPEC did not list; it is private and is not the public profile (still out of scope).

### Log in and sign-up are two linked pages, not one page with tabs (story 9)
- **Why:** sign-up was already built and tested; two links keep it as it is, and the return address (`?next=`) travels in each link.
- **Trade-off accepted:** the return address must be carried between the two pages; only addresses inside Spindle are followed, anything else goes to the home page.

## 2026-11-08 — Process (push)

### Commits are pushed to GitHub at the end of every work session, after asking me (process)
- **Why:** 31 commits had piled up only on the laptop. A lost or broken laptop would have lost most of the MVP, and the Vercel version was out of date for testing and the demo. Asking first keeps a last check on what goes to GitHub and Vercel.
- **Trade-off accepted:** the published Vercel version shows unfinished flows between sessions (for example, sign-up before log in exists); if a session ends abruptly, the push can be missed.

## 2026-11-07 — Process (screenshots)

### Screenshots for the final PDF are saved by the Playwright tests, only on request (process)
- **Why:** the PDF needs current screens at 375 and 1280 px. The tests already open every screen, so they take the pictures. They are saved in `docs/screenshots/story-<n>/` only with `npm run screenshots` (`SCREENSHOTS=1`), because saving on every run would change the images in git each time, even with no visible change.
- **Trade-off accepted:** the images can fall behind the app between runs; `npm run screenshots` is run before the PDF. Test coverage metrics wait until after stories 7 and 8 (no new package now).

## 2026-11-07 — Story 9 · Accounts (sign-up)

### Sessions are kept in cookies with @supabase/ssr (story 9)
- **Why:** the server must know who is signed in, to check the profile before Buy / Sell and, later, to protect checkout (story 7) and selling (story 8). The package renews the session in cookies on its own (`proxy.ts`), so the app has no hand-written token refresh code, where errors are hard to catch in tests.
- **Trade-off accepted:** one more package (`@supabase/ssr`) and a `proxy.ts` file that runs before every page.

### Email confirmation is off in Supabase Auth (story 9)
- **Why:** the story asks that a new user is signed in straight after sign-up, and the demo must not depend on email delivery (the free plan limits emails per hour).
- **Trade-off accepted:** nobody checks that the email belongs to the person: someone can sign up with another person's address, a typo cannot be fixed (no password reset in the MVP), and "This email already has an account" shows which emails are registered. The setting applies to the whole Supabase project, including the Vercel version.

## 2026-11-07 — Story 9 · Accounts (database)

### The app's server code creates the profile at sign-up, not a database trigger (story 9)
- **Why:** a trigger hides the logic in SQL, where Vitest cannot test it and errors reach the user as a generic Supabase message. Keeping it in `lib/db/profiles.ts` keeps it visible and testable like every other flow. Story 9 needs no new migration: `profiles` already has `user_id`, `name`, `city` and `shop_name`.
- **Trade-off accepted:** sign-up becomes two steps (account, then profile). If the second fails, the account has no profile; the server checks for the profile at login and before Buy / Sell and creates it if missing.

### Phase 2 tables are created with their own story (process)
- **Why:** `orders` waits for story 7 and `user_preferences` for story 2, so their open findings (e.g. #12) are decided before the columns exist, and no correcting migration is needed.
- **Trade-off accepted:** more, smaller migrations instead of one for phase 2.

## 2026-11-07 — Process

### Options are shown without the AI's recommendation; I choose first (process)
- **Why:** a recommendation shown first anchors the choice. In stories 3, 5, 6 and 9 every finding was decided as the AI recommended, so the log could not show my own reasoning. Choosing first and then comparing with the AI keeps the decision, and its justification, mine.
- **Trade-off accepted:** each decision takes slightly longer.

## 2026-11-07 — Story 9 · Accounts (findings)

### After login from Buy, the user goes to the checkout (story 9 · finding #9)
- **Why:** tapping Buy already says what the user wants; sending them back to the listing makes them tap Buy twice. Matches story 7's edge case.
- **Trade-off accepted:** the checkout is built in story 7, so the Playwright test for this return is finished there; story 9 tests the return to the page the user came from.

### Sign-up has no "I also want to sell" box and no terms line (story 9 · finding #23)
- **Why:** there is one account for buying and selling, and seller details (city, shop name) are asked when selling (story 8). There are no terms or privacy pages, so the line would point to documents that do not exist. Differs from the Assignment 1 design on purpose.

## 2026-11-07 — Story 6 · Fair price (findings)

### The typical price is shown as a range, not one value (story 6 · finding #20)
- **Why:** a range explains why a price is "Typical"; the recommendation reasons (story 3) and the sell screen design already use a range.

## 2026-11-07 — Specification layout

### One file per user story in `specs/`; SPEC.md becomes the index
- **Why:** a single SPEC file with every story had grown long and was hard to read and work through. Separate files per story are easier to read and let each story be opened on its own while it is built. SPEC.md keeps what spans all stories (build order, out of scope, shared rules, traceability), so the path every document points to still exists.
- Files: `specs/story-<n>-<name>.md` · the spec-review skill reads both

## 2026-11-07 — Story 5 · Listing check screen

### On desktop, the listings sit beside the recommendation from 1024 px (stories 3 and 5 · finding #21)
- **Why:** 1024 px (Tailwind's `lg`) is the narrowest width where two columns keep the listing rows readable. Below it, tablets included, the phone layout with "See verified listings" is used. The demo runs on a laptop.

### The listing check screen's Back returns to where the listing was opened (story 5)
- **Why:** opened beside the recommendation (desktop), it goes back to the recommendation; opened from the phone list, it goes back to the list. The address says which (`from=recommendation`), like the ranking (story 2), so it survives a reload.

### The listing check screen takes the version in its address (story 5 · architecture)
- **Why:** the same listing is red under the version the seller claimed and yellow under its actual version, so the screen needs to know where the buyer came from: `/listings/[listingId]?version=[versionId]`. This keeps the folder in ARCHITECTURE.md. Without `version`, the claimed version is used.

### A listing moved here shows its three checks as "check pending" (story 5)
- **Why:** its results were made against another pressing; showing ✗ on a listing that is for sale here would contradict its yellow light and confuse a non-specialist buyer.

### Red listings open the listing check screen, without "Buy with protection" (story 5)
- **Why:** the buyer sees which checks failed and where the copy was moved, which is what makes the red light trustworthy.

## 2026-11-07 — Story 5 · Verified listings (findings)

### A red listing whose correct version is not in the catalogue is out of the MVP (story 5 · finding #33)
- **Why:** the data is illustrative and ours; every red listing in the seed has its correct version. Handling the case would make `actual_version_id` optional and add a migration, a seed case and a test for something the demo never shows.

### A red listing's price label uses the typical range of its actual version (story 6 · finding #10)
- **Why:** it follows the shared rule that a red listing counts for its actual version; the claimed version's range would compare it with the wrong pressing.

## 2026-11-07 — Story 3 · Recommendation (findings)

### A version with no listings scores 0 on price and condition when finding the ideal version (story 3 · finding #28)
- **Why:** one scoring rule for every version, with no special case. A buyer who ranks price never sees an expensive, unavailable pressing as their "ideal"; with sound or original ranked first and price unranked, the note still appears (e.g. "1. Original, 2. Sound" → 1972 UK original).

### A reason quotes the typical range of a version with no listings (story 3 · finding #32)
- **Why:** the comparison with the first pressing is the strongest reason to choose a remaster, and the typical range is already stored for story 6. "Typically" makes clear it is not a current listing.

## 2026-11-07 — Story 2 · Priorities

### The ranking travels in the page address (story 2 · architecture)
- **Why:** the recommendation reads the ranking from the address (e.g. `/albums/7/recommendation?priorities=price,sound`), so it needs no database in phase 1, survives a reload during the demo, and "Change" can refill the priorities screen with the current order. Unknown or repeated values in the address are ignored.

### Story 2 is built for phase 1 only; finding #11 waits for phase 2 (process)
- **Why:** saving a ranking needs accounts (story 9), which come later in the build order. Whether "Change" replaces a saved ranking is decided when accounts exist.

## 2026-11-07 — Story 1 · Search

### Search and suggestions run on the full album list, in a pure rule (story 1 · architecture)
- **Why:** matching must ignore accents ("bjork" finds "Björk", finding #30), which plain database search cannot do without an extra extension, and the suggestions (finding #29) need every title and artist anyway. The catalogue is small, so reading every album per search is fast. The rules stay in `lib/rules/` and are unit-tested.
- **Trade-off accepted:** a catalogue of many thousands of albums would need the search moved into the database. Changes step 2 of the search example in ARCHITECTURE.md.

### The server reads the database with the Supabase secret key (architecture)
- **Why:** RLS blocks every public read, so `lib/db/` uses `SUPABASE_SECRET_KEY`. It has no `NEXT_PUBLIC_` prefix, so it never reaches the browser. It must also be added to the Vercel settings.

### Generated covers and photos (seed)
- **Why:** real album covers are copyrighted, and links to them could break during the demo. The covers and listing photos are simple generated images labelled "Illustrative".

## 2026-11-07 — Project setup

### Supabase in the cloud, tables applied with the Supabase CLI (process)
- **Why:** the app must be online for the demo, so the database lives in the cloud from the start. The CLI applies the migrations and the illustrative data with one command, so the database can be rebuilt the same way before the demo; pasting SQL by hand is easy to get wrong.
- **Trade-off accepted:** one more development package (`supabase`). No local database (it would need Docker).

## 2026-11-07 — Decisions from spec review (iteration 2)

### Search results show no price or listing count (story 1 · finding #19)
- **Why:** "from €24" is the cheapest copy of any pressing, often not the one Spindle recommends; it anchors the buyer on a price the recommendation then contradicts. Whether an album can be bought is already shown by the "No listings" label. Differs from the Assignment 1 design on purpose.

### Search suggestions compare each word, with a tolerance that grows with the typed text (story 1 · finding #29)
- **Why:** compared with the whole title, a typo was never "2 letters away", so the criterion's own example failed. Short texts need less tolerance: with 2 letters allowed, any 3-letter text is close to "the" or "and". Replaces the rule decided for finding #7.
- **Trade-off accepted:** a search with several misspelled words (e.g. "zigy stardst") may get no suggestion.

### Search ignores upper and lower case and accents (story 1 · finding #30)
- **Why:** buyers often type without capitals or accents, especially on a phone; it keeps the search tests unambiguous and costs almost nothing.

## 2026-11-07 — Phone and desktop checks (CLAUDE.md)

### Every screen is checked on phone and desktop (process)
- **Why:** the SPEC asks for phone and desktop, and some criteria depend on screen size (story 3: listings beside the recommendation on desktop, on their own screen on phone; story 4: 2 versions on phone, 3 on desktop). I verify by behaviour, so each screen change shows both sizes, and the end-to-end tests run at both sizes. Before the demo, the app is also checked on a real phone.

## 2026-11-07 — Database decisions (docs/database.md)

### Store facts, calculate judgements (architecture)
- **Why:** the traffic light, active listings, price and condition scores and the price label are calculated by the rules in `lib/rules/`, never stored; a stored judgement goes stale when the data changes (same reason as findings #1 and #2).

### Illustrative sellers have no account (architecture)
- **Why:** demo listings need sellers, but creating fake accounts with emails and passwords adds risk and work for no visible gain. Sellers in the seed have a name and city only and cannot log in.

### Only phase 1 tables are created now (process)
- **Why:** keeps the database as small as the current phase needs; orders and saved priorities are described in `docs/database.md` and created when phase 2 starts.

### Condition grade explanations (stories 3, 5, 8)
- Near mint: "Almost like new, no marks" · Very good: "Light signs of wear" · Good: "Visible wear and some audible noise" · Fair: "Heavily played, noticeable noise"
- **Why:** written for buyers who are not specialists (plain-language rule, finding #8).

## 2026-11-07 — Project rules (CLAUDE.md)

### Every change is explained in plain language, with evidence, before I accept it (process)
- **Why:** I verify by behaviour, not by reading code; the assignment asks to "verify each change before accepting it". Each change states what changed, why, the evidence (test output or screenshot) and any doubts.

### Open review findings are decided before building their story (process)
- **Why:** deciding before building changes one sentence in SPEC.md, and the decision is mine. A vague rule left open is decided by the agent while building, by criteria I may not want; correcting it later means changing the rule, the code, the tests and the screens that use it.

### No ready-made component libraries; new packages only after my yes (architecture)
- **Why:** keeps the app simple and small enough for me to verify; the look comes from the Assignment 1 designs, not from a library's default style.

## 2026-11-07 — Architecture decisions

### TypeScript, not plain JavaScript (architecture)
- **Why:** many errors show up before the app runs; it is the standard in Next.js projects, and the AI works very well with it.
- **Trade-off accepted:** the code has more annotations, so it is a little harder for me to read.

### Tailwind CSS for styling (architecture)
- **Why:** spacing and colours come from a fixed scale, so screens stay consistent (checked in the UX/UI review); it is the Next.js default and the AI generates it quickly and reliably. It is not a component library, so it keeps the "no complex UI libraries" rule.
- **Trade-off accepted:** the HTML carries many style classes; I verify by behaviour and screenshots, not by reading the markup.

### No public API in the MVP (architecture)
- **Why:** it is not assessed in this assignment and the next brief is not known yet; all rules live in `lib/rules/`, so an API can reuse them later without reorganising the code.

## 2026-11-07 — Decisions from spec review (iteration 1)

### One shared rule for loading and errors (Shared rules · finding #16)
- **Why:** without it each screen would handle waiting and failures differently. Loading mask while loading; an error screen in plain language with "Try again" on failure; forms keep what was typed, so a failed payment or listing does not cost the user their input. In the architecture this becomes one shared component.

### Listings: beside the recommendation on desktop, on their own screen on phone (stories 3, 5 · finding #21)
- **Why:** follows the Assignment 1 designs; on a phone, the recommendation and the listings do not fit one screen.

### Before the architecture, only findings that affect it are resolved (process)
- **Why:** to reduce complexity now. #21 (how many screens) and #16 (shared loading and error states) change the folder structure and the shared components, so they are decided first. The other low findings (texts, small rules, phase 4) are decided before building the story they belong to.

### Condition grades use the buyer's language: Near mint, Very good, Good, Fair (stories 3, 5, 8 · finding #8)
- **Why:** Spindle's buyers are not specialists; plain names follow Assignment 1's plain-language rule and the designs. The collector code (NM, VG+, VG, G) stays beside each name for sellers who know the Goldmine scale.
- **Trade-off accepted:** "Good" here means VG on the collector scale. New (sealed) records are left out of the MVP.

### Search suggestions: up to 3 titles at most 2 letters away (story 1 · finding #7)
- **Why:** "similar to the typed text" could not be tested; a fixed limit makes the criterion pass or fail, and still catches common typos.

### A moved listing is yellow under its correct version (story 5 · finding #6)
- **Why:** its checklist was made against the version the seller claimed, so nobody has checked it against the correct one; Assignment 1 says "uncertain check: show yellow, never green".

### An album with no listings shows the message straight away (story 1 · finding #5)
- **Why:** sending the buyer through the priorities screen only to say nobody is selling wastes two screens.

### Only active listings count (Shared rules · finding #4)
- **Why:** several stories count listings or show the lowest price; without one rule, sold, removed or wrong-version listings could inflate counts or show a price nobody can pay. Active = on sale and green or yellow; a red listing counts for its actual version.

### Reasons follow the buyer's priorities (story 3 · finding #3)
- **Why:** Assignment 1 asks for "reasons tied to my priorities"; one fixed text per version says the same to every buyer. One sentence per criterion, shown in the buyer's rank order, with prices taken from the listings so they never go stale.

### The price score is calculated from the listings, not stored (story 3 · finding #2)
- **Why:** prices change with the listings, so a stored score would go stale and contradict the prices the buyer sees.
- **Formula:** 5 × (cheapest lowest price ÷ this version's lowest price), rounded, minimum 1 — a version that is only slightly dearer keeps a good score; a much dearer one drops to 1.

### The condition score of a version is calculated from its best listing (story 3 · finding #1)
- **Why:** condition belongs to each copy, not to the version; a version with a near-mint copy and a worn copy has no single condition. The best copy on sale is what the buyer can get.

## 2026-11-07 — Process decisions

### User stories are reviewed with a project skill before they are built (spec-review)
- **Why:** the first manual review found contradictions between stories and with the designs (e.g. story 1 vs the designed flow). A skill makes the same review repeatable after every change to SPEC.md, with numbered findings, evidence and a report.
- **Rules:** read-only; every change proposed as current vs proposed text and written only after my yes; tested stories are not edited (a new story carries the decision); finding numbers never change.
- Skill: `.claude/skills/spec-review/` · register: `docs/spec-review/findings.json`

## 2026-11-07 — Product decisions (SPEC.md, story 4)

### The comparison picks versions automatically, by total score (story 4)
- **Why:** consistent with the recommendation and with Spindle's promise to do the work for the buyer; choosing versions by hand would bring back the "hundreds of versions" problem.

## 2026-11-07 — Product decisions (SPEC.md, story 8)

### Sellers pick the exact version from a list of versions (story 8)
- **Why:** unlike buyers, sellers already know which pressing they own; picking from the catalogue is what lets Spindle check the listing later.

### New listings are always yellow in the MVP (story 8)
- **Why:** automatic photo and matrix checks are out of scope, so the check is uncertain; Assignment 1 says "uncertain check: show yellow, never green".

### Cover and record photos required; matrix optional (story 8)
- **Why:** buyers need to see what they are buying; a missing matrix photo already keeps the listing yellow.

### Sellers can see, edit and remove their listings (story 8)
- **Why:** sellers need to correct prices and withdraw records sold elsewhere (they may also sell on other platforms). If time is short, editing is the first part to drop.

## 2026-11-07 — Product decisions (SPEC.md, story 7)

### Payment is simulated; only step 1 of the protection flow works in the MVP (story 7)
- **Why:** keeps phase 2 (the safe demo) small. The four steps are explained on screen; buyer confirmation (step 3) is the first item of phase 4.
- **Trade-off accepted:** "Seller is paid only after I confirm" (Assignment 1) is explained, not yet working.

### Buyer protection is a fixed €2 per order (story 7)
- **Why:** it is the assumption Assignment 1 wants to test ("about €2 per order"), easy to understand, and simple to calculate.

### The app never asks for card or bank details, not even simulated ones (story 7)
- **Why:** there is no real payment, so there is no reason to collect sensitive data.

## 2026-11-07 — Product decisions (SPEC.md, story 9)

### One account for buying and selling (story 9)
- **Why:** two account types would confuse users; paid professional accounts for shops can come after the MVP.

### No public profile page in the MVP; listings show "Shop" or "Private seller" and the city (story 9)
- **Why:** reviews come later, so a profile would be empty or need invented ratings, which would contradict "only verified buyers can review" in a product built on trust. Trust in the MVP comes from listing verification and buyer protection.

### Login only when buying or selling, returning to the same place (story 9)
- **Why:** visitors see the value (recommendation, verified listings) before being asked to sign up.

### No email confirmation or password reset in the MVP (story 9)
- **Why:** keeps the live demo independent of email delivery; not needed to show the core flow.

## 2026-11-07 — Product decisions (SPEC.md, phase 1)

### Tapping an album opens the priorities screen, not a list of versions (stories 1–2)
- **Why:** this is the flow in my Assignment 1 designs, and Spindle's value is to *reduce* hundreds of versions to one pick. Showing every version is what existing marketplaces already do.

### Priorities are chosen for each album; signed-in buyers with saved priorities skip the screen (story 2)
- **Why:** visitors without an account still see the recommendation before being asked to sign up; frequent buyers are not slowed down; priorities can change from one record to another ("Change" on the recommendation).

### Buyers rank their priorities by tap order (story 2)
- **Why:** different buyers value different things (price for some, sound for others), so a fixed order would be wrong for many of them.

### The recommendation uses weights, not strict order (story 3)
- **Why:** Assignment 1 asks for "the best balance" when priorities conflict; strict order would let a small saving beat a much better sound. Fixed weights (3 / 2 / 1 / 0.5) keep it predictable and testable with decision tables.

### The main recommendation is always a version on sale; the ideal one, if unavailable, is shown as a note (story 3)
- **Why:** the story promises "so I don't get lost", so the main pick must be something the buyer can buy; the note keeps Spindle transparent, which builds trust.

### Listings: green and yellow mixed by price, red at the end (story 5)
- **Why:** buyer protection covers green and yellow, so both are safe to buy; red cannot be bought, so it never comes first. Clarity to be checked in the UX/UI review.

### The traffic light is calculated from a three-item checklist (story 5)
- **Why:** one rule gives consistent results and follows Assignment 1 ("uncertain check: show yellow, never green"); it can be unit tested.

### The typical price is a stored range per version, not calculated from current listings (story 6)
- **Why:** an average of current listings depends on the listings it is judging: one listing is always "typical", and one overpriced listing changes everyone else's label. A stored range stands for past sales.

### Left out of the MVP
- Search by artist with an artist page; messaging the seller; 30-second previews; social proof; "Compare pressings" (phase 4 if time allows)
- **Why:** deadline and focus on the main buyer flow (search → priorities → recommendation → verified listings → buy).

## 2026-11-07 — Stack, hosting and testing

| Part | Choice | Why |
|---|---|---|
| App (frontend + backend) | **Next.js** (simplest setup) | Very popular → more documentation and better AI output; frontend and backend in one project |
| Hosting | **Vercel** (free plan) | Near-instant start (under 1–2 s), even after being idle → lower risk during the live demo; deploys from GitHub |
| Database | **PostgreSQL on Supabase** (free plan) | Built-in sign-up and login (story 9); built-in file storage for photos (story 8); visual table editor to check the data |
| End-to-end tests | **Playwright** | Simple setup; waits for elements automatically; official Next.js guide |
| Unit tests | **Vitest** | Simple setup; fast |

**React comes with Next.js:** every Next.js screen is a React component, so React is not a separate choice. React draws the screens but brings no ready-made buttons or styles, so it keeps the "no complex UI libraries" rule.

**Criteria (Class 2, slide 11):** familiarity · ecosystem maturity · hosting target · how well the AI knows the stack
**Priority:** deliver safely

**Familiarity:** reading code will always be hard for me, in any language
→ so I choose among the **most popular stacks in the community**
→ **How I verify:** by behaviour, not by reading code: automated tests for every flow, linked to the acceptance criteria, and evidence (test output or screenshot) before accepting any change (Class 2, slides 27, 28 and 31)

**Accepted risk:** the free Supabase plan pauses a project after 1 week without use
→ open the app at least once a week and always check it before the demo

### Change from Assignment 1
Assignment 1 (p. 12) stated PHP. I changed to Next.js for the reasons above → **to be noted in SPEC.md**
