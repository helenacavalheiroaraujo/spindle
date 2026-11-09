# Spindle MVP — Submission

> **DRAFT** — the Vercel address is missing and the screenshots must be retaken after the final changes. Remove this line before printing the PDF.

Assignment 2 · ASI, MESG/FEUP · 15 Nov 2026

**App:** `<VERCEL ADDRESS — to be added>`

Spindle helps people who are not vinyl experts pick the right pressing of a record and buy a verified copy safely. Everything shown is illustrative data: no real catalogue, payments or shipping (Assignment 1, p. 12).

Contents: 1. Data tables · 2. Screenshots of every screen (phone 375 px and desktop 1280 px).

---

# 1. Data tables

The tables are created by six migrations in `supabase/migrations/`:

| Migration | What it creates |
|---|---|
| `0001_core.sql` | `albums`, `versions`, `tracks`, `glossary_terms`, `reason_texts`, `condition_grades`, `profiles`, `listings`, `check_results` |
| `0002_orders.sql` | `orders` and the `place_order(...)` function |
| `0003_sell.sql` | price limit on `listings`, the `listing-photos` storage bucket and `create_listing(...)` |
| `0004_preferences.sql` | `user_preferences` |
| `0005_condition_text.sql` | plain-language texts for the condition grades |
| `0006_genres.sql` | the `genre` column on `albums` |

Illustrative data for the demo is in `supabase/seed.sql`.


### Principles

- **Store facts, calculate judgements.** The database keeps what is true about albums, versions and listings. Anything the SPEC calls a rule (traffic light, active listing, price score, condition score, price label, checkout total) is calculated in `lib/rules/`, never stored. A stored judgement would go stale and contradict the rule (same reason as findings #1 and #2).
- **Illustrative data.** Every catalogue row, score, check result and seller in `supabase/seed.sql` is illustrative (Assignment 1, p. 12).
- **The browser never reads the database.** Row Level Security is switched on for every table with no public policies, so only the app's server code (`lib/db/`) can read or write.
- **Prices in euros**, stored as `numeric(8,2)` (exact cents, no rounding errors).

### Tables by phase

| Phase | Tables | Stories | Migration |
|---|---|---|---|
| 1 · Core | `albums`, `versions`, `tracks`, `glossary_terms`, `reason_texts`, `condition_grades`, `profiles`, `listings`, `check_results` | 1, 2, 3, 5, 6 | `0001_core.sql` |
| 2 · Purchase | `user_preferences` (story 2), `orders` (story 7); story 9 adds no table, the app fills `profiles.user_id` at sign-up | 9, 7, 2 | `0002_orders.sql` (story 7), `0004_preferences.sql` (story 2) |
| 3 · Seller | no new tables: a price limit on `listings`, the `listing-photos` bucket in Storage and `create_listing(...)` | 8 | `0003_sell.sql` |
| 4 · If time allows | no new tables: `albums.genre` (story 12) | 12 | `0006_genres.sql` |

### Diagram (phase 1)

```
albums 1──* versions 1──* tracks
               │  1──* reason_texts
               │
               ├─1──* listings (claimed version)
               └─1──* listings (actual version)
                         │ *──1 profiles (seller)
                         │ *──1 condition_grades
                         └ 1──3 check_results
glossary_terms (stand-alone)
```

### Phase 1 tables

#### `albums`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid, primary key | |
| `title` | text | searched (story 1) |
| `artist` | text | searched (story 1) |
| `release_year` | integer | search results: newest first |
| `cover_url` | text | link to the real cover on Cover Art Archive (`coverartarchive.org/release-group/<id>/front-500`); required |
| `genre` | text, optional: Rock, Jazz, Soul and funk, Fado, Electronic or Hip-hop | crates on the home page (story 12, `0006_genres.sql`); empty → in no crate |

#### `versions`
One pressing of an album (e.g. "2012 Remaster").

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, primary key | |
| `album_id` | → `albums` | |
| `name` | text | e.g. "1972 UK original" |
| `release_year`, `country`, `label`, `format` | text / integer | story 3 details |
| `sound_score` | integer 1–5 | stored (story 3) |
| `original_score` | integer 1–5 | stored (story 3) |
| `rating_count` | integer ≥ 0 | "Based on N collector ratings" |
| `typical_price_min`, `typical_price_max` | numeric, nullable | story 6; both empty or both filled, min ≤ max |

Price and condition scores are **not** columns: they are calculated from the listings (story 3, findings #1 and #2).

#### `tracks`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid, primary key | |
| `version_id` | → `versions` | |
| `position` | text | e.g. "A1", "B3" |
| `title` | text | |
| `is_extra` | boolean | shown as "Bonus" (story 3) |

#### `reason_texts`
One sentence per version and criterion (story 3, finding #3).

| Column | Type | Notes |
|---|---|---|
| `version_id` | → `versions` | primary key with `criterion` |
| `criterion` | sound / price / original / condition | |
| `sentence` | text | may contain price placeholders, e.g. `{lowest_price}`, filled from the listings |

#### `glossary_terms`
| Column | Type | Notes |
|---|---|---|
| `term` | text, primary key | e.g. "remaster", "matrix" |
| `explanation` | text | plain explanation (story 3) |

#### `condition_grades`
Fixed list in the buyer's language (finding #8).

| Column | Type | Notes |
|---|---|---|
| `code` | text, primary key | NM, VG+, VG, G |
| `name` | text | Near mint, Very good, Good, Fair |
| `explanation` | text | approved texts: No marks, almost like new (`0005_condition_text.sql`, finding #59) · Light signs of wear · Visible wear and some audible noise · Heavily played, noticeable noise |
| `sort_order` | integer | best first |

The condition **score** (Near mint = 5 … Fair = 2) lives in `lib/rules/recommendation.ts`, not here.

#### `profiles`
Public seller details. Passwords and emails stay in Supabase Auth.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, primary key | |
| `user_id` | → Supabase Auth user, nullable, unique | empty for illustrative sellers in the seed; filled in by the app's server code at sign-up (story 9), and created at login or before Buy / Sell if missing |
| `name` | text | |
| `city` | text, nullable | shown on listings |
| `shop_name` | text, nullable | filled → "Shop"; empty → "Private seller" (story 9) |

#### `listings`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid, primary key | |
| `seller_id` | → `profiles` | |
| `claimed_version_id` | → `versions` | the version the seller said |
| `actual_version_id` | → `versions` | equal to claimed, unless the listing is red and was moved (story 5) |
| `condition_code` | → `condition_grades` | |
| `price` | numeric(8,2), > 0 and ≤ 1000 | story 8: 0, negative or above €1000 refused (finding #79); the app also refuses more than 2 decimals |
| `status` | on_sale / sold / removed | |
| `cover_photo_url`, `record_photo_url` | text, nullable | required by the sell form (story 8), not by the table |
| `matrix_photo_url` | text, nullable | missing → matrix check is "uncertain" (story 5) |
| `created_at` | timestamp | |

#### `check_results`
The three-item checklist per listing (story 5). Mock data.

| Column | Type | Notes |
|---|---|---|
| `listing_id` | → `listings` | primary key with `item` |
| `item` | cover_label / country_year / matrix | |
| `result` | match / uncertain / no_match | |

### How the shared rules read these tables

- **Traffic light** (`lib/rules/trafficLight.ts`): from the listing's three `check_results` and whether it has a matrix photo.
- **Active listing** (`lib/rules/activeListings.ts`): `status = on_sale` and the traffic light is green or yellow. A red listing counts for its `actual_version_id`, where it is shown yellow.
- **Lowest price, counts, "No listings"**: from active listings only.
- **Price label** (`lib/rules/fairPrice.ts`): `listings.price` against the version's typical range.

### Phase 2 tables

#### `user_preferences` (created: `0004_preferences.sql`)
| Column | Type | Notes |
|---|---|---|
| `user_id` | → Supabase Auth user, primary key | |
| `ranking` | ordered list of criteria, 1–4 items | story 2 |

#### `orders` (created: `0002_orders.sql`)
| Column | Type | Notes |
|---|---|---|
| `id` | uuid, primary key | |
| `buyer_id` | → `profiles` | |
| `listing_id` | → `listings`, unique | one order per listing: a sold listing cannot be bought again (story 7) |
| `record_price`, `shipping`, `protection_fee`, `total` | numeric(8,2) | amounts at the time of paying; `total` is calculated in `lib/rules/` and the table refuses a total that is not the sum |
| `status` | paid_waiting_seller / seller_paid | `seller_paid` is set when the buyer taps "It arrived, all good" (story 7 · step 3): one conditional update in `lib/db/orders.ts` (`confirmReceipt`), only for the buyer's own order and only while it is `paid_waiting_seller` |
| `ship_name`, `ship_street`, `ship_postcode`, `ship_city` | text, not empty | typed per order; postcode format 0000-000 (finding #41) |
| `created_at` | timestamp | |

No payment method column: MB WAY is the only method (finding #38).

**`place_order(...)`** (same migration): Pay in one step, all or nothing. Marks the listing `sold` only if it is still `on_sale`, then creates the order with the listing's price; otherwise raises `listing_not_on_sale` and changes nothing ("Sorry, this record was just sold"). Only the server key can call it.

### Phase 3 · Seller (`0003_sell.sql`)

No new tables. Story 8 writes to `listings`, `check_results` and `profiles` (city and shop name, the first time).

- **Price limit:** `listings.price` must be at most €1000 (finding #79). The full price rule, with its messages, lives in `lib/rules/`.
- **Photos:** Storage bucket `listing-photos`, public (a photo is read through its link, like the seed photos), 5 MB per file, JPEG, PNG or WebP. The browser reduces each photo before sending; the app's server code uploads it with the server key. The links are saved in `cover_photo_url`, `record_photo_url` and `matrix_photo_url`.
- **`create_listing(...)`:** "List for sale" in one step, all or nothing. Creates the listing (claimed = actual version, `on_sale`) and its three `check_results`, all `uncertain`, so a new listing is yellow (story 5). The first time, it also saves the seller's `city` (required) and `shop_name` (optional); once saved, they are not changed (finding #82). Raises `version_not_found`, `city_required` or `photos_required` and changes nothing. Only the server key can call it.
- **Edit price, remove, undo:** single-row updates in `lib/db/listings.ts`, each only if the listing is in the expected status (edit and remove: `on_sale`; undo: `removed`). If the listing was sold meanwhile, nothing changes and the app shows "This record was just sold".


---

# 2. Screenshots

Each screen is shown on a phone (375 px, left) and on a desktop (1280 px, right). Screens come from the running app with the illustrative data.


## Story 1 · Search for an album


**Fewer than 3 characters: no search, a hint, the typed text stays**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-1/search-too-short-375.png" alt="Fewer than 3 characters: no search, a hint, the typed text stays (phone)"></td><td valign="top"><img src="../screenshots/story-1/search-too-short-1280.png" alt="Fewer than 3 characters: no search, a hint, the typed text stays (desktop)"></td></tr></table>


**No match and nothing close: "No albums found"**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-1/search-no-albums-found-375.png" alt="No match and nothing close: "No albums found" (phone)"></td><td valign="top"><img src="../screenshots/story-1/search-no-albums-found-1280.png" alt="No match and nothing close: "No albums found" (desktop)"></td></tr></table>


**Tapping an album with no listings: "Nobody is selling this album right now"**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-1/search-nobody-selling-375.png" alt="Tapping an album with no listings: "Nobody is selling this album right now" (phone)"></td><td valign="top"><img src="../screenshots/story-1/search-nobody-selling-1280.png" alt="Tapping an album with no listings: "Nobody is selling this album right now" (desktop)"></td></tr></table>


## Story 17 · Search results page (shows story 1 results)


**Search results ("bowie"): cover, title, artist, year, versions, "No listings", "Not in the demo"**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-17/results-375.png" alt="Search results ("bowie"): cover, title, artist, year, versions, "No listings", "Not in the demo" (phone)"></td><td valign="top"><img src="../screenshots/story-17/results-1280.png" alt="Search results ("bowie"): cover, title, artist, year, versions, "No listings", "Not in the demo" (desktop)"></td></tr></table>


**A typo ("zigy") suggests the full album title**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-17/typo-375.png" alt="A typo ("zigy") suggests the full album title (phone)"></td><td valign="top"><img src="../screenshots/story-17/typo-1280.png" alt="A typo ("zigy") suggests the full album title (desktop)"></td></tr></table>


## Story 2 · Say what matters to me


**Priorities screen, nothing picked: "See recommendation" is disabled**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-2/priorities-empty-375.png" alt="Priorities screen, nothing picked: "See recommendation" is disabled (phone)"></td><td valign="top"><img src="../screenshots/story-2/priorities-empty-1280.png" alt="Priorities screen, nothing picked: "See recommendation" is disabled (desktop)"></td></tr></table>


**1. Price, 2. Sound picked; ranks shown as numbers**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-2/priorities-ranked-375.png" alt="1. Price, 2. Sound picked; ranks shown as numbers (phone)"></td><td valign="top"><img src="../screenshots/story-2/priorities-ranked-1280.png" alt="1. Price, 2. Sound picked; ranks shown as numbers (desktop)"></td></tr></table>


**Signed in with a saved ranking: the screen is skipped and the recommendation shows "Based on: … · Change"**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-2/saved-ranking-skips-screen-375.png" alt="Signed in with a saved ranking: the screen is skipped and the recommendation shows "Based on: … · Change" (phone)"></td><td valign="top"><img src="../screenshots/story-2/saved-ranking-skips-screen-1280.png" alt="Signed in with a saved ranking: the screen is skipped and the recommendation shows "Based on: … · Change" (desktop)"></td></tr></table>


## Story 3 · Get one recommendation


**1. Price, 2. Sound → 2012 Remaster (on desktop the listings sit beside it)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-3/recommendation-price-sound-375.png" alt="1. Price, 2. Sound → 2012 Remaster (on desktop the listings sit beside it) (phone)"></td><td valign="top"><img src="../screenshots/story-3/recommendation-price-sound-1280.png" alt="1. Price, 2. Sound → 2012 Remaster (on desktop the listings sit beside it) (desktop)"></td></tr></table>


**1. Price only → 1990 Reissue, no alternative**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-3/recommendation-price-only-375.png" alt="1. Price only → 1990 Reissue, no alternative (phone)"></td><td valign="top"><img src="../screenshots/story-3/recommendation-price-only-1280.png" alt="1. Price only → 1990 Reissue, no alternative (desktop)"></td></tr></table>


**1. Original, 2. Sound → "ideal but unavailable" note**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-3/recommendation-ideal-unavailable-375.png" alt="1. Original, 2. Sound → "ideal but unavailable" note (phone)"></td><td valign="top"><img src="../screenshots/story-3/recommendation-ideal-unavailable-1280.png" alt="1. Original, 2. Sound → "ideal but unavailable" note (desktop)"></td></tr></table>


**Glossary term and track list open, with "Bonus" tracks**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-3/recommendation-glossary-tracks-375.png" alt="Glossary term and track list open, with "Bonus" tracks (phone)"></td><td valign="top"><img src="../screenshots/story-3/recommendation-glossary-tracks-1280.png" alt="Glossary term and track list open, with "Bonus" tracks (desktop)"></td></tr></table>


*Note: in this screenshot the glossary explanation appears in heading style next to "Reissue". It is a known visual flaw, not the intended design.*


## Story 4 · Compare versions


**Compare pressings: recommended version first, buyer's priorities first**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-4/compare-375.png" alt="Compare pressings: recommended version first, buyer's priorities first (phone)"></td><td valign="top"><img src="../screenshots/story-4/compare-1280.png" alt="Compare pressings: recommended version first, buyer's priorities first (desktop)"></td></tr></table>


**Version page: fit with the priorities, tracks, listings**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-4/version-375.png" alt="Version page: fit with the priorities, tracks, listings (phone)"></td><td valign="top"><img src="../screenshots/story-4/version-1280.png" alt="Version page: fit with the priorities, tracks, listings (desktop)"></td></tr></table>


## Story 5 · See verified listings


**Verified listings: green Match, yellow Check, red No match last**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-5/listings-375.png" alt="Verified listings: green Match, yellow Check, red No match last (phone)"></td><td valign="top"><img src="../screenshots/story-5/listings-1280.png" alt="Verified listings: green Match, yellow Check, red No match last (desktop)"></td></tr></table>


**Yellow: "Before you buy" shows what is uncertain**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-5/listings-yellow-warning-375.png" alt="Yellow: "Before you buy" shows what is uncertain (phone)"></td><td valign="top"><img src="../screenshots/story-5/listings-yellow-warning-1280.png" alt="Yellow: "Before you buy" shows what is uncertain (desktop)"></td></tr></table>


**Listing check, green: three checks match, photos, condition in plain words**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-5/listing-check-green-375.png" alt="Listing check, green: three checks match, photos, condition in plain words (phone)"></td><td valign="top"><img src="../screenshots/story-5/listing-check-green-1280.png" alt="Listing check, green: three checks match, photos, condition in plain words (desktop)"></td></tr></table>


**Listing check, yellow: no matrix photo**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-5/listing-check-yellow-no-matrix-375.png" alt="Listing check, yellow: no matrix photo (phone)"></td><td valign="top"><img src="../screenshots/story-5/listing-check-yellow-no-matrix-1280.png" alt="Listing check, yellow: no matrix photo (desktop)"></td></tr></table>


**Listing check, red: different pressing, moved, not for sale here**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-5/listing-check-red-375.png" alt="Listing check, red: different pressing, moved, not for sale here (phone)"></td><td valign="top"><img src="../screenshots/story-5/listing-check-red-1280.png" alt="Listing check, red: different pressing, moved, not for sale here (desktop)"></td></tr></table>


**The same listing under its real version: yellow, "Moved here · check pending"**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-5/listing-check-moved-here-375.png" alt="The same listing under its real version: yellow, "Moved here · check pending" (phone)"></td><td valign="top"><img src="../screenshots/story-5/listing-check-moved-here-1280.png" alt="The same listing under its real version: yellow, "Moved here · check pending" (desktop)"></td></tr></table>


## Story 6 · Fair price


**Price labels (Typical / Above typical) and the typical range below the list**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-6/fair-price-labels-375.png" alt="Price labels (Typical / Above typical) and the typical range below the list (phone)"></td><td valign="top"><img src="../screenshots/story-6/fair-price-labels-1280.png" alt="Price labels (Typical / Above typical) and the typical range below the list (desktop)"></td></tr></table>


**A red listing is compared with the range of its real version**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-6/fair-price-red-actual-range-375.png" alt="A red listing is compared with the range of its real version (phone)"></td><td valign="top"><img src="../screenshots/story-6/fair-price-red-actual-range-1280.png" alt="A red listing is compared with the range of its real version (desktop)"></td></tr></table>


**A version without a range: no label and no range line**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-6/fair-price-no-range-375.png" alt="A version without a range: no label and no range line (phone)"></td><td valign="top"><img src="../screenshots/story-6/fair-price-no-range-1280.png" alt="A version without a range: no label and no range line (desktop)"></td></tr></table>


## Story 7 · Buy with protection


**Checkout: address, MB WAY, price breakdown, protection steps, no card fields**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-7/checkout-375.png" alt="Checkout: address, MB WAY, price breakdown, protection steps, no card fields (phone)"></td><td valign="top"><img src="../screenshots/story-7/checkout-1280.png" alt="Checkout: address, MB WAY, price breakdown, protection steps, no card fields (desktop)"></td></tr></table>


**Sold while on the checkout: "Sorry, this record was just sold"**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-7/checkout-just-sold-375.png" alt="Sold while on the checkout: "Sorry, this record was just sold" (phone)"></td><td valign="top"><img src="../screenshots/story-7/checkout-just-sold-1280.png" alt="Sold while on the checkout: "Sorry, this record was just sold" (desktop)"></td></tr></table>


**Order confirmation**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-7/order-confirmation-375.png" alt="Order confirmation (phone)"></td><td valign="top"><img src="../screenshots/story-7/order-confirmation-1280.png" alt="Order confirmation (desktop)"></td></tr></table>


**A sold or removed listing opened from a link**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-7/no-longer-available-375.png" alt="A sold or removed listing opened from a link (phone)"></td><td valign="top"><img src="../screenshots/story-7/no-longer-available-1280.png" alt="A sold or removed listing opened from a link (desktop)"></td></tr></table>


**Your account: order "On its way"**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-7/account-on-its-way-375.png" alt="Your account: order "On its way" (phone)"></td><td valign="top"><img src="../screenshots/story-7/account-on-its-way-1280.png" alt="Your account: order "On its way" (desktop)"></td></tr></table>


**"Are you sure? The money is released to the seller."**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-7/account-are-you-sure-375.png" alt=""Are you sure? The money is released to the seller." (phone)"></td><td valign="top"><img src="../screenshots/story-7/account-are-you-sure-1280.png" alt=""Are you sure? The money is released to the seller." (desktop)"></td></tr></table>


**Order delivered, seller paid**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-7/account-delivered-375.png" alt="Order delivered, seller paid (phone)"></td><td valign="top"><img src="../screenshots/story-7/account-delivered-1280.png" alt="Order delivered, seller paid (desktop)"></td></tr></table>


## Story 8 · Sell a record for free


**Sell: find the album**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-8/sell-search-375.png" alt="Sell: find the album (phone)"></td><td valign="top"><img src="../screenshots/story-8/sell-search-1280.png" alt="Sell: find the album (desktop)"></td></tr></table>


**Sell: pick the version**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-8/sell-versions-375.png" alt="Sell: pick the version (phone)"></td><td valign="top"><img src="../screenshots/story-8/sell-versions-1280.png" alt="Sell: pick the version (desktop)"></td></tr></table>


**Sell form, first time (city required)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-8/sell-form-first-time-375.png" alt="Sell form, first time (city required) (phone)"></td><td valign="top"><img src="../screenshots/story-8/sell-form-first-time-1280.png" alt="Sell form, first time (city required) (desktop)"></td></tr></table>


**Sell form: typical range, price label and "No commission" while typing**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-8/sell-form-375.png" alt="Sell form: typical range, price label and "No commission" while typing (phone)"></td><td valign="top"><img src="../screenshots/story-8/sell-form-1280.png" alt="Sell form: typical range, price label and "No commission" while typing (desktop)"></td></tr></table>


**Listing published, yellow, "Your listing"**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-8/sell-listed-375.png" alt="Listing published, yellow, "Your listing" (phone)"></td><td valign="top"><img src="../screenshots/story-8/sell-listed-1280.png" alt="Listing published, yellow, "Your listing" (desktop)"></td></tr></table>


**My listings**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-8/my-listings-375.png" alt="My listings (phone)"></td><td valign="top"><img src="../screenshots/story-8/my-listings-1280.png" alt="My listings (desktop)"></td></tr></table>


**Edit the price**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-8/my-listings-edit-375.png" alt="Edit the price (phone)"></td><td valign="top"><img src="../screenshots/story-8/my-listings-edit-1280.png" alt="Edit the price (desktop)"></td></tr></table>


**Remove asks first**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-8/my-listings-confirm-375.png" alt="Remove asks first (phone)"></td><td valign="top"><img src="../screenshots/story-8/my-listings-confirm-1280.png" alt="Remove asks first (desktop)"></td></tr></table>


**"Listing removed" with Undo**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-8/my-listings-removed-375.png" alt=""Listing removed" with Undo (phone)"></td><td valign="top"><img src="../screenshots/story-8/my-listings-removed-1280.png" alt=""Listing removed" with Undo (desktop)"></td></tr></table>


## Story 9 · Sign up, log in


**Home, signed out**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-9/home-signed-out-375.png" alt="Home, signed out (phone)"></td><td valign="top"><img src="../screenshots/story-9/home-signed-out-1280.png" alt="Home, signed out (desktop)"></td></tr></table>


**Log in**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-9/login-375.png" alt="Log in (phone)"></td><td valign="top"><img src="../screenshots/story-9/login-1280.png" alt="Log in (desktop)"></td></tr></table>


**Wrong password message**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-9/login-wrong-password-375.png" alt="Wrong password message (phone)"></td><td valign="top"><img src="../screenshots/story-9/login-wrong-password-1280.png" alt="Wrong password message (desktop)"></td></tr></table>


**Sign up**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-9/signup-375.png" alt="Sign up (phone)"></td><td valign="top"><img src="../screenshots/story-9/signup-1280.png" alt="Sign up (desktop)"></td></tr></table>


**Email already in use**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-9/signup-email-in-use-375.png" alt="Email already in use (phone)"></td><td valign="top"><img src="../screenshots/story-9/signup-email-in-use-1280.png" alt="Email already in use (desktop)"></td></tr></table>


**Password too short**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-9/signup-short-password-375.png" alt="Password too short (phone)"></td><td valign="top"><img src="../screenshots/story-9/signup-short-password-1280.png" alt="Password too short (desktop)"></td></tr></table>


**Signed in**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-9/signed-in-375.png" alt="Signed in (phone)"></td><td valign="top"><img src="../screenshots/story-9/signed-in-1280.png" alt="Signed in (desktop)"></td></tr></table>


**Your account**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-9/account-375.png" alt="Your account (phone)"></td><td valign="top"><img src="../screenshots/story-9/account-1280.png" alt="Your account (desktop)"></td></tr></table>


## Story 12 · Home page


**Home: search and one crate per genre**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-12/home-375.png" alt="Home: search and one crate per genre (phone)"></td><td valign="top"><img src="../screenshots/story-12/home-1280.png" alt="Home: search and one crate per genre (desktop)"></td></tr></table>


**Genre screen (Rock)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-12/genre-rock-375.png" alt="Genre screen (Rock) (phone)"></td><td valign="top"><img src="../screenshots/story-12/genre-rock-1280.png" alt="Genre screen (Rock) (desktop)"></td></tr></table>


## Not in this document

Specified but not built: story 14 (desktop footer), story 15 (menu), story 16 (search suggestions as you type) and story 9 reviews. Loading masks and error screens are checked manually (`docs/manual-tests.md`) and have no screenshots.
