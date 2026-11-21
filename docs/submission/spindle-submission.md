# Spindle MVP — Submission

> **DRAFT** — the Vercel address is missing and the screenshots must be retaken after the final changes. Remove this line before printing the PDF.

Assignment 2 · ASI, MESG/FEUP · 23 Nov 2026

**App:** `<VERCEL ADDRESS — to be added>`

Spindle helps people who are not vinyl experts pick the right pressing of a record and buy a verified copy safely. Everything shown is illustrative data: no real catalogue, payments or shipping (Assignment 1, p. 12).

Contents: 1. Data tables · 2. Screenshots of the main screens, grouped by journey (phone 375 px and desktop 1280 px).

---

# 1. Data tables

The tables are created by thirteen migrations in `supabase/migrations/`:

| Migration | What it creates |
|---|---|
| `0001_core.sql` | `albums`, `versions`, `tracks`, `glossary_terms`, `reason_texts`, `condition_grades`, `profiles`, `listings`, `check_results` |
| `0002_orders.sql` | `orders` and the `place_order(...)` function |
| `0003_sell.sql` | price limit on `listings`, the `listing-photos` storage bucket and `create_listing(...)` |
| `0004_preferences.sql` | `user_preferences` |
| `0005_condition_text.sql` | plain-language texts for the condition grades |
| `0006_genres.sql` | the `genre` column on `albums` |
| `0007_reviews.sql` | `reviews` (story 18) |
| `0008_listing_place.sql` | `seller_city` and `seller_shop_name` on `listings`; new version of `create_listing(...)` |
| `0009_cart.sql` | `cart_items` and the `place_orders(...)` function (story 20) |
| `0010_addresses.sql` | `addresses` |
| `0011_order_messages.sql` | `order_messages` |
| `0012_classical_genre.sql` | "Classical" added to the allowed genres |
| `0013_cancel_order.sql` | `cancelled` order status, one live order per listing, `cancel_order(...)` (story 39) |

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
| 4 · If time allows | `reviews` (18), `cart_items` (20), `addresses` and `order_messages` (bug fixes); changes to `albums`, `listings` and `orders` | 12, 18, 20, 24, 39 | `0006` to `0013` |

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

### Diagram (phases 2 to 4)

```
profiles 1──* cart_items *──1 listings
profiles 1──* addresses (delivery, billing)
orders 1──0..1 order_messages
orders 1──0..1 reviews *──1 profiles (seller)
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
| `genre` | text, optional: Rock, Jazz, Soul and funk, Fado, Electronic, Hip-hop or Classical | crates on the home page (story 12, `0006_genres.sql`; Classical added in `0012_classical_genre.sql`); empty → in no crate |

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
| `listing_id` | → `listings` | at most one order that is not cancelled per listing (index from `0013`): a sold record cannot be bought again, a cancelled one can (story 39) |
| `record_price`, `shipping`, `protection_fee`, `total` | numeric(8,2) | amounts at the time of paying; `total` is calculated in `lib/rules/` and the table refuses a total that is not the sum |
| `status` | paid_waiting_seller / seller_paid / cancelled | `cancelled` is set by `cancel_order(...)`. `seller_paid` is set when the buyer taps "It arrived, all good" (story 7 · step 3): one conditional update in `lib/db/orders.ts` (`confirmReceipt`), only for the buyer's own order and only while it is `paid_waiting_seller` |
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

### Phase 4 tables

#### `reviews` (created: `0007_reviews.sql`)
| Column | Type | Notes |
|---|---|---|
| `id` | uuid, primary key | |
| `order_id` | → `orders`, unique | one review per order; empty for the illustrative reviews in the seed |
| `seller_id` | → `profiles` | index on this column |
| `rating` | smallint, 1 to 5 | the table refuses anything else |
| `created_at` | timestamp | |

#### `cart_items` (created: `0009_cart.sql`)
| Column | Type | Notes |
|---|---|---|
| `id` | uuid, primary key | |
| `buyer_id` | → `profiles` | index on this column |
| `listing_id` | → `listings` | |
| `created_at` | timestamp | |

Unique on (`buyer_id`, `listing_id`): a record cannot be in the same cart twice. Nothing is reserved, so the same record can be in two carts.

#### `addresses` (created: `0010_addresses.sql`)
| Column | Type | Notes |
|---|---|---|
| `id` | uuid, primary key | |
| `profile_id` | → `profiles`, deleted with the profile | |
| `kind` | `delivery` or `billing` | |
| `name`, `street`, `city` | text, not empty | |
| `postcode` | text, format 0000-000 | same check as `orders` |
| `updated_at` | timestamp | |

Unique on (`profile_id`, `kind`): one delivery address and, only if different, one billing address. No billing row means "same as delivery".

#### `order_messages` (created: `0011_order_messages.sql`)
| Column | Type | Notes |
|---|---|---|
| `id` | uuid, primary key | |
| `order_id` | → `orders`, unique, deleted with the order | one message per order |
| `body` | text, 1 to 500 characters | |
| `created_at` | timestamp | |

#### Changes to existing tables
- **`albums.genre`** (`0006`, `0012`): one of Rock, Jazz, Soul and funk, Fado, Electronic, Hip-hop, Classical. Empty means the album is in no crate.
- **`listings.seller_city`, `listings.seller_shop_name`** (`0008`): the city and shop a record is sold from. Empty means the seller's profile values are used.

#### Functions
- **`place_orders(...)`** (`0009`): pays the whole cart in one step, all or nothing. For each record it marks the listing `sold` only if it is still `on_sale`, and creates the order. If any record was just sold, it raises `listing_not_on_sale` and changes nothing. The paid records leave the cart in the same step.
- **`create_listing(...)`** (new version in `0008`): same as before, and it also saves the city and shop name chosen for this listing.
- **`cancel_order(...)`** (`0013`): sets the order to `cancelled` and its listing back to `on_sale`, all or nothing. Only the buyer's own order, and only while it is "Paid". Otherwise it raises `order_not_cancellable`. The refund is simulated: nothing is stored.

Only the server key can call these three functions.


---

# 2. Screenshots

Screens from the running app with the illustrative data, grouped by what a person does. The main path is shown on a phone (375 px, left) and a desktop (1280 px, right); other screens on desktop only, two per row. The desktop is the reference layout for this delivery.

## 2.1 Explore

**Home: search and one crate per genre (story 12)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-12/home-375.png" alt="Home: search and one crate per genre (story 12) (phone)"></td><td valign="top"><img src="../screenshots/story-12/home-1280.png" alt="Home: search and one crate per genre (story 12) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>Genre screen: Rock (story 12)</b><br><img src="../screenshots/story-12/genre-rock-1280.png" alt="Genre screen: Rock (story 12) (desktop)"></td><td valign="top" width="50%"><b>Genre row on desktop: arrows (story 36)</b><br><img src="../screenshots/story-36/arrows-start-1280.png" alt="Genre row on desktop: arrows (story 36) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>More genres, crate row (story 24)</b><br><img src="../screenshots/story-24/crate-row-1280.png" alt="More genres, crate row (story 24) (desktop)"></td><td valign="top" width="50%"><b>Navy header with the search strip (story 22)</b><br><img src="../screenshots/story-22/header-search-strip-1280.png" alt="Navy header with the search strip (story 22) (desktop)"></td></tr></table>

**Menu: phone and desktop (story 19)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-19/menu-open-375.png" alt="Menu: phone and desktop (story 19) (phone)"></td><td valign="top"><img src="../screenshots/story-19/menu-1280.png" alt="Menu: phone and desktop (story 19) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>Search suggestions as you type (story 16)</b><br><img src="../screenshots/story-16/suggestions-1280.png" alt="Search suggestions as you type (story 16) (desktop)"></td></tr></table>

**Search results ("bowie"): cover, title, artist, year, versions, "No listings", "Not in the demo" (stories 1, 17)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-17/results-375.png" alt="Search results (&quot;bowie&quot;): cover, title, artist, year, versions, &quot;No listings&quot;, &quot;Not in the demo&quot; (stories 1, 17) (phone)"></td><td valign="top"><img src="../screenshots/story-17/results-1280.png" alt="Search results (&quot;bowie&quot;): cover, title, artist, year, versions, &quot;No listings&quot;, &quot;Not in the demo&quot; (stories 1, 17) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>A typo (&quot;zigy&quot;) suggests the full album title (story 17)</b><br><img src="../screenshots/story-17/typo-1280.png" alt="A typo (&quot;zigy&quot;) suggests the full album title (story 17) (desktop)"></td><td valign="top" width="50%"><b>Fewer than 3 characters: no search, a hint, the typed text stays (story 1)</b><br><img src="../screenshots/story-1/search-too-short-1280.png" alt="Fewer than 3 characters: no search, a hint, the typed text stays (story 1) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>No match and nothing close: &quot;No albums found&quot; (story 1)</b><br><img src="../screenshots/story-1/search-no-albums-found-1280.png" alt="No match and nothing close: &quot;No albums found&quot; (story 1) (desktop)"></td><td valign="top" width="50%"><b>One album page for every album (story 28)</b><br><img src="../screenshots/story-28/album-page-choose-1280.png" alt="One album page for every album (story 28) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>Album page with no listings (story 28)</b><br><img src="../screenshots/story-28/album-page-no-listings-1280.png" alt="Album page with no listings (story 28) (desktop)"></td><td valign="top" width="50%"><b>Album page with a saved ranking (story 28)</b><br><img src="../screenshots/story-28/album-page-saved-ranking-1280.png" alt="Album page with a saved ranking (story 28) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>Album details without listings (story 21)</b><br><img src="../screenshots/bug-17/album-details-1280.png" alt="Album details without listings (story 21) (desktop)"></td><td valign="top" width="50%"><b>Desktop footer (story 14)</b><br><img src="../screenshots/story-14/footer-1280.png" alt="Desktop footer (story 14) (desktop)"></td></tr></table>

## 2.2 Choose

**Priorities screen, nothing picked: "See recommendation" is disabled (story 2)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-2/priorities-empty-375.png" alt="Priorities screen, nothing picked: &quot;See recommendation&quot; is disabled (story 2) (phone)"></td><td valign="top"><img src="../screenshots/story-2/priorities-empty-1280.png" alt="Priorities screen, nothing picked: &quot;See recommendation&quot; is disabled (story 2) (desktop)"></td></tr></table>

**1. Price, 2. Sound picked; ranks shown as numbers (story 2)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-2/priorities-ranked-375.png" alt="1. Price, 2. Sound picked; ranks shown as numbers (story 2) (phone)"></td><td valign="top"><img src="../screenshots/story-2/priorities-ranked-1280.png" alt="1. Price, 2. Sound picked; ranks shown as numbers (story 2) (desktop)"></td></tr></table>

**Signed in with a saved ranking: the screen is skipped and the recommendation shows "Based on: … · Change" (story 2)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-2/saved-ranking-skips-screen-375.png" alt="Signed in with a saved ranking: the screen is skipped and the recommendation shows &quot;Based on: … · Change&quot; (story 2) (phone)"></td><td valign="top"><img src="../screenshots/story-2/saved-ranking-skips-screen-1280.png" alt="Signed in with a saved ranking: the screen is skipped and the recommendation shows &quot;Based on: … · Change&quot; (story 2) (desktop)"></td></tr></table>

**1. Price, 2. Sound → 2012 Remaster (on desktop the listings sit beside it) (story 3)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-3/recommendation-price-sound-375.png" alt="1. Price, 2. Sound → 2012 Remaster (on desktop the listings sit beside it) (story 3) (phone)"></td><td valign="top"><img src="../screenshots/story-3/recommendation-price-sound-1280.png" alt="1. Price, 2. Sound → 2012 Remaster (on desktop the listings sit beside it) (story 3) (desktop)"></td></tr></table>

**1. Price only → 1990 Reissue, no alternative (story 3)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-3/recommendation-price-only-375.png" alt="1. Price only → 1990 Reissue, no alternative (story 3) (phone)"></td><td valign="top"><img src="../screenshots/story-3/recommendation-price-only-1280.png" alt="1. Price only → 1990 Reissue, no alternative (story 3) (desktop)"></td></tr></table>

**1. Original, 2. Sound → "ideal but unavailable" note (story 3)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-3/recommendation-ideal-unavailable-375.png" alt="1. Original, 2. Sound → &quot;ideal but unavailable&quot; note (story 3) (phone)"></td><td valign="top"><img src="../screenshots/story-3/recommendation-ideal-unavailable-1280.png" alt="1. Original, 2. Sound → &quot;ideal but unavailable&quot; note (story 3) (desktop)"></td></tr></table>

**Glossary term and track list open, with "Bonus" tracks (story 3)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-3/recommendation-glossary-tracks-375.png" alt="Glossary term and track list open, with &quot;Bonus&quot; tracks (story 3) (phone)"></td><td valign="top"><img src="../screenshots/story-3/recommendation-glossary-tracks-1280.png" alt="Glossary term and track list open, with &quot;Bonus&quot; tracks (story 3) (desktop)"></td></tr></table>

*Note: in this screenshot the glossary explanation appears in heading style next to "Reissue". It is a known visual flaw, not the intended design.*

**Compare pressings: recommended version first, buyer's priorities first (story 4)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-4/compare-375.png" alt="Compare pressings: recommended version first, buyer&#x27;s priorities first (story 4) (phone)"></td><td valign="top"><img src="../screenshots/story-4/compare-1280.png" alt="Compare pressings: recommended version first, buyer&#x27;s priorities first (story 4) (desktop)"></td></tr></table>

**Version page: fit with the priorities, tracks, listings (story 4)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-4/version-375.png" alt="Version page: fit with the priorities, tracks, listings (story 4) (phone)"></td><td valign="top"><img src="../screenshots/story-4/version-1280.png" alt="Version page: fit with the priorities, tracks, listings (story 4) (desktop)"></td></tr></table>

**Verified listings: green Match, yellow Check, red No match last (story 5)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-5/listings-375.png" alt="Verified listings: green Match, yellow Check, red No match last (story 5) (phone)"></td><td valign="top"><img src="../screenshots/story-5/listings-1280.png" alt="Verified listings: green Match, yellow Check, red No match last (story 5) (desktop)"></td></tr></table>

**Yellow: "Before you buy" shows what is uncertain (story 5)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-5/listings-yellow-warning-375.png" alt="Yellow: &quot;Before you buy&quot; shows what is uncertain (story 5) (phone)"></td><td valign="top"><img src="../screenshots/story-5/listings-yellow-warning-1280.png" alt="Yellow: &quot;Before you buy&quot; shows what is uncertain (story 5) (desktop)"></td></tr></table>

**Listing check, green: three checks match, photos, condition in plain words (story 5)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-5/listing-check-green-375.png" alt="Listing check, green: three checks match, photos, condition in plain words (story 5) (phone)"></td><td valign="top"><img src="../screenshots/story-5/listing-check-green-1280.png" alt="Listing check, green: three checks match, photos, condition in plain words (story 5) (desktop)"></td></tr></table>

**Listing check, yellow: no matrix photo (story 5)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-5/listing-check-yellow-no-matrix-375.png" alt="Listing check, yellow: no matrix photo (story 5) (phone)"></td><td valign="top"><img src="../screenshots/story-5/listing-check-yellow-no-matrix-1280.png" alt="Listing check, yellow: no matrix photo (story 5) (desktop)"></td></tr></table>

**Listing check, red: different pressing, moved, not for sale here (story 5)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-5/listing-check-red-375.png" alt="Listing check, red: different pressing, moved, not for sale here (story 5) (phone)"></td><td valign="top"><img src="../screenshots/story-5/listing-check-red-1280.png" alt="Listing check, red: different pressing, moved, not for sale here (story 5) (desktop)"></td></tr></table>

**The same listing under its real version: yellow, "Moved here · check pending" (story 5)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-5/listing-check-moved-here-375.png" alt="The same listing under its real version: yellow, &quot;Moved here · check pending&quot; (story 5) (phone)"></td><td valign="top"><img src="../screenshots/story-5/listing-check-moved-here-1280.png" alt="The same listing under its real version: yellow, &quot;Moved here · check pending&quot; (story 5) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>&quot;Pressing check&quot; on every listing (story 33)</b><br><img src="../screenshots/story-33/listings-1280.png" alt="&quot;Pressing check&quot; on every listing (story 33) (desktop)"></td><td valign="top" width="50%"><b>Recommendation with the listings and their checks beside it (story 33)</b><br><img src="../screenshots/story-33/recommendation-beside-1280.png" alt="Recommendation with the listings and their checks beside it (story 33) (desktop)"></td></tr></table>

**Price labels (Typical / Above typical) and the typical range below the list (story 6)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-6/fair-price-labels-375.png" alt="Price labels (Typical / Above typical) and the typical range below the list (story 6) (phone)"></td><td valign="top"><img src="../screenshots/story-6/fair-price-labels-1280.png" alt="Price labels (Typical / Above typical) and the typical range below the list (story 6) (desktop)"></td></tr></table>

**A red listing is compared with the range of its real version (story 6)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-6/fair-price-red-actual-range-375.png" alt="A red listing is compared with the range of its real version (story 6) (phone)"></td><td valign="top"><img src="../screenshots/story-6/fair-price-red-actual-range-1280.png" alt="A red listing is compared with the range of its real version (story 6) (desktop)"></td></tr></table>

**A version without a range: no label and no range line (story 6)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-6/fair-price-no-range-375.png" alt="A version without a range: no label and no range line (story 6) (phone)"></td><td valign="top"><img src="../screenshots/story-6/fair-price-no-range-1280.png" alt="A version without a range: no label and no range line (story 6) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>Listen to the album: a preview playing (story 34)</b><br><img src="../screenshots/story-34/album-preview-playing-1280.png" alt="Listen to the album: a preview playing (story 34) (desktop)"></td><td valign="top" width="50%"><b>Previews unavailable: the page still works (story 34)</b><br><img src="../screenshots/story-34/album-preview-itunes-down-1280.png" alt="Previews unavailable: the page still works (story 34) (desktop)"></td></tr></table>

## 2.3 Buy

**Log in without leaving the page: the window opens on top of the record (stories 27, 29)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-27/log-in-to-buy-375.png" alt="Log in without leaving the page: the window opens on top of the record (stories 27, 29) (phone)"></td><td valign="top"><img src="../screenshots/story-27/log-in-to-buy-1280.png" alt="Log in without leaving the page: the window opens on top of the record (stories 27, 29) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>Create an account in the window (story 27)</b><br><img src="../screenshots/story-27/create-account-1280.png" alt="Create an account in the window (story 27) (desktop)"></td><td valign="top" width="50%"><b>Wrong password message (story 27)</b><br><img src="../screenshots/story-27/wrong-password-1280.png" alt="Wrong password message (story 27) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>The larger window with the record beside it (story 29)</b><br><img src="../screenshots/story-29/window-record-1280.png" alt="The larger window with the record beside it (story 29) (desktop)"></td><td valign="top" width="50%"><b>Session ended during a checkout: the window opens on top, what was typed is kept (story 29)</b><br><img src="../screenshots/story-29/session-ended-1280.png" alt="Session ended during a checkout: the window opens on top, what was typed is kept (story 29) (desktop)"></td></tr></table>

**Cart (story 20)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-20/cart-375.png" alt="Cart (story 20) (phone)"></td><td valign="top"><img src="../screenshots/story-20/cart-1280.png" alt="Cart (story 20) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>Add to cart (story 20)</b><br><img src="../screenshots/story-20/add-to-cart-1280.png" alt="Add to cart (story 20) (desktop)"></td><td valign="top" width="50%"><b>Added to the cart (story 20)</b><br><img src="../screenshots/story-20/added-1280.png" alt="Added to the cart (story 20) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>Empty cart (story 20)</b><br><img src="../screenshots/story-20/cart-empty-1280.png" alt="Empty cart (story 20) (desktop)"></td><td valign="top" width="50%"><b>A sold record stays in the cart, greyed &quot;Sold&quot; (story 35)</b><br><img src="../screenshots/story-35/cart-sold-1280.png" alt="A sold record stays in the cart, greyed &quot;Sold&quot; (story 35) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>Buy now on a sold record: a notice (story 35)</b><br><img src="../screenshots/story-35/buy-now-notice-1280.png" alt="Buy now on a sold record: a notice (story 35) (desktop)"></td></tr></table>

**Checkout: address, MB WAY, price breakdown, protection steps, no card fields (story 7)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-7/checkout-375.png" alt="Checkout: address, MB WAY, price breakdown, protection steps, no card fields (story 7) (phone)"></td><td valign="top"><img src="../screenshots/story-7/checkout-1280.png" alt="Checkout: address, MB WAY, price breakdown, protection steps, no card fields (story 7) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>Checkout for the whole cart (story 20)</b><br><img src="../screenshots/story-20/checkout-1280.png" alt="Checkout for the whole cart (story 20) (desktop)"></td><td valign="top" width="50%"><b>Sold while on the checkout: &quot;Sorry, this record was just sold&quot; (story 7)</b><br><img src="../screenshots/story-7/checkout-just-sold-1280.png" alt="Sold while on the checkout: &quot;Sorry, this record was just sold&quot; (story 7) (desktop)"></td></tr></table>

**Order confirmation (story 7)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-7/order-confirmation-375.png" alt="Order confirmation (story 7) (phone)"></td><td valign="top"><img src="../screenshots/story-7/order-confirmation-1280.png" alt="Order confirmation (story 7) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>Next steps after &quot;Order placed&quot;: whole cart (story 30)</b><br><img src="../screenshots/story-30/order-placed-cart-1280.png" alt="Next steps after &quot;Order placed&quot;: whole cart (story 30) (desktop)"></td><td valign="top" width="50%"><b>Next steps after &quot;Order placed&quot;: one record (story 30)</b><br><img src="../screenshots/story-30/order-placed-one-1280.png" alt="Next steps after &quot;Order placed&quot;: one record (story 30) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>A sold or removed listing opened from a link (story 7)</b><br><img src="../screenshots/story-7/no-longer-available-1280.png" alt="A sold or removed listing opened from a link (story 7) (desktop)"></td></tr></table>

## 2.4 Your account

<table><tr><td valign="top" width="50%"><b>Account button (story 32)</b><br><img src="../screenshots/story-32/pill-1280.png" alt="Account button (story 32) (desktop)"></td><td valign="top" width="50%"><b>Account menu (story 32)</b><br><img src="../screenshots/story-32/menu-open-1280.png" alt="Account menu (story 32) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>Account tab: details (story 31)</b><br><img src="../screenshots/story-31/details-1280.png" alt="Account tab: details (story 31) (desktop)"></td><td valign="top" width="50%"><b>Account tab: orders, empty (story 31)</b><br><img src="../screenshots/story-31/orders-empty-1280.png" alt="Account tab: orders, empty (story 31) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>Account tab: for sale (story 31)</b><br><img src="../screenshots/story-31/for-sale-1280.png" alt="Account tab: for sale (story 31) (desktop)"></td><td valign="top" width="50%"><b>Orders in your account (story 20)</b><br><img src="../screenshots/story-20/orders-in-account-1280.png" alt="Orders in your account (story 20) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>Saved addresses, empty (bug 9)</b><br><img src="../screenshots/bug-9/account-empty-1280.png" alt="Saved addresses, empty (bug 9) (desktop)"></td><td valign="top" width="50%"><b>Delivery and a different billing address (bug 9)</b><br><img src="../screenshots/bug-9/account-billing-different-1280.png" alt="Delivery and a different billing address (bug 9) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>Order &quot;On its way&quot; (story 7)</b><br><img src="../screenshots/story-7/account-on-its-way-1280.png" alt="Order &quot;On its way&quot; (story 7) (desktop)"></td><td valign="top" width="50%"><b>&quot;Are you sure? The money is released to the seller.&quot; (story 7)</b><br><img src="../screenshots/story-7/account-are-you-sure-1280.png" alt="&quot;Are you sure? The money is released to the seller.&quot; (story 7) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>Order delivered, seller paid (story 7)</b><br><img src="../screenshots/story-7/account-delivered-1280.png" alt="Order delivered, seller paid (story 7) (desktop)"></td><td valign="top" width="50%"><b>Message to the seller from the order (bug 8)</b><br><img src="../screenshots/bug-8/message-form-1280.png" alt="Message to the seller from the order (bug 8) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>&quot;You wrote&quot;: the message stays on the order (bug 8)</b><br><img src="../screenshots/bug-8/you-wrote-1280.png" alt="&quot;You wrote&quot;: the message stays on the order (bug 8) (desktop)"></td><td valign="top" width="50%"><b>A &quot;Paid&quot; order shows &quot;Cancel order&quot; (story 39)</b><br><img src="../screenshots/story-39/paid-with-link-1280.png" alt="A &quot;Paid&quot; order shows &quot;Cancel order&quot; (story 39) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>Cancel asks first (story 39)</b><br><img src="../screenshots/story-39/cancel-box-1280.png" alt="Cancel asks first (story 39) (desktop)"></td><td valign="top" width="50%"><b>Cancelled order: greyed, no steps (story 39)</b><br><img src="../screenshots/story-39/cancelled-1280.png" alt="Cancelled order: greyed, no steps (story 39) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>Rate the seller (story 18)</b><br><img src="../screenshots/story-18/rate-this-seller-1280.png" alt="Rate the seller (story 18) (desktop)"></td><td valign="top" width="50%"><b>Rating question (story 18)</b><br><img src="../screenshots/story-18/rate-question-1280.png" alt="Rating question (story 18) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>Seller rating on the listings (story 18)</b><br><img src="../screenshots/story-18/listings-rating-1280.png" alt="Seller rating on the listings (story 18) (desktop)"></td><td valign="top" width="50%"><b>Buying priorities on the account page (story 23)</b><br><img src="../screenshots/story-23/account-priorities-1280.png" alt="Buying priorities on the account page (story 23) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>Change buying priorities (story 26)</b><br><img src="../screenshots/story-26/change-priorities-1280.png" alt="Change buying priorities (story 26) (desktop)"></td></tr></table>

## 2.5 Sell

**Sell: find the album (story 8)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-8/sell-search-375.png" alt="Sell: find the album (story 8) (phone)"></td><td valign="top"><img src="../screenshots/story-8/sell-search-1280.png" alt="Sell: find the album (story 8) (desktop)"></td></tr></table>

**Sell: pick the version (story 8)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-8/sell-versions-375.png" alt="Sell: pick the version (story 8) (phone)"></td><td valign="top"><img src="../screenshots/story-8/sell-versions-1280.png" alt="Sell: pick the version (story 8) (desktop)"></td></tr></table>

**Sell form, first time (city required) (story 8)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-8/sell-form-first-time-375.png" alt="Sell form, first time (city required) (story 8) (phone)"></td><td valign="top"><img src="../screenshots/story-8/sell-form-first-time-1280.png" alt="Sell form, first time (city required) (story 8) (desktop)"></td></tr></table>

**Sell form: typical range, price label and "No commission" while typing (story 8)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-8/sell-form-375.png" alt="Sell form: typical range, price label and &quot;No commission&quot; while typing (story 8) (phone)"></td><td valign="top"><img src="../screenshots/story-8/sell-form-1280.png" alt="Sell form: typical range, price label and &quot;No commission&quot; while typing (story 8) (desktop)"></td></tr></table>

**Listing published, yellow, "Your listing" (story 8)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-8/sell-listed-375.png" alt="Listing published, yellow, &quot;Your listing&quot; (story 8) (phone)"></td><td valign="top"><img src="../screenshots/story-8/sell-listed-1280.png" alt="Listing published, yellow, &quot;Your listing&quot; (story 8) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>Selling from: city and shop for this listing (bug 11)</b><br><img src="../screenshots/bug-11/sell-form-selling-from-1280.png" alt="Selling from: city and shop for this listing (bug 11) (desktop)"></td><td valign="top" width="50%"><b>Two listings, two places (bug 11)</b><br><img src="../screenshots/bug-11/two-listings-two-places-1280.png" alt="Two listings, two places (bug 11) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>My listings (story 8)</b><br><img src="../screenshots/story-8/my-listings-1280.png" alt="My listings (story 8) (desktop)"></td><td valign="top" width="50%"><b>Edit the price (story 8)</b><br><img src="../screenshots/story-8/my-listings-edit-1280.png" alt="Edit the price (story 8) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>Remove asks first (story 8)</b><br><img src="../screenshots/story-8/my-listings-confirm-1280.png" alt="Remove asks first (story 8) (desktop)"></td><td valign="top" width="50%"><b>&quot;Listing removed&quot; with Undo (story 8)</b><br><img src="../screenshots/story-8/my-listings-removed-1280.png" alt="&quot;Listing removed&quot; with Undo (story 8) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>Sold tab: the buyer&#x27;s message under the record (bug 8)</b><br><img src="../screenshots/bug-8/seller-sold-tab-1280.png" alt="Sold tab: the buyer&#x27;s message under the record (bug 8) (desktop)"></td></tr></table>

## Notes

- All records, prices, sellers, checks and payments are illustrative. The refund when an order is cancelled is simulated: nothing is stored for it.
- Loading masks and error screens are checked by hand (`docs/manual-tests.md`) and have no screenshots.
