# Spindle MVP — Submission

Assignment 2 · ASI, MESG/FEUP · 23 Nov 2026

Helena Cavalheiro Araújo · Student number: up202510618

**App:** https://spindle-three.vercel.app

Spindle helps people who are not vinyl specialists to choose the right pressing of a record and to buy a verified copy safely. The catalogue, prices, sellers, listings and checks are illustrative, and payments and shipping are simulated (Assignment 1, p. 12). Cover art, album details and track previews come from public services (Cover Art Archive, MusicBrainz, Wikipedia and iTunes).

<!-- cover-end -->

## At a glance

- **Contents:** the data tables of the application (part 1) and screenshots of its screens (part 2).
- **Data:** 15 tables, created by 13 migrations, and 4 database functions.
- **Screens:** 84 screens, in five journeys: Explore, Choose, Buy, Your account and Sell.
- **Screen sizes:** phone (375 px) and desktop (1280 px).

## How to read this document

- **Part 1 · Data tables.** The overview table lists every table with its purpose and keys, and the diagram shows how the tables are connected. Each area is then described in its own section, with every column.
- **Column tables.** In the Type column, “→ table” indicates a foreign key to that table; primary keys are stated explicitly. The Notes column records the rules and the stories that apply.
- **Part 2 · Screenshots.** The screens are grouped by what a person does. Figures with two images show the phone on the left and the desktop on the right; figures with one image show the desktop, which is the reference layout.
- **“Finding #N”.** References such as “finding #41” in the Notes columns point to an entry in the specification review (`docs/spec-review/`): a question about the specification that was decided and then built into the table.
- **Story and bug numbers.** Those in the captions refer to the numbered stories and bug reports; the Appendix gives the title of each.
- **Illustrative data.** The catalogue, prices, sellers, listings and checks are illustrative, and payments and refunds are simulated. Album pages show real cover art, details and previews from public services, and say so (“Source: MusicBrainz · Wikipedia”).

<!-- toc -->

# 1. Data tables

## 1.1 Overview

The app keeps its data in 15 tables, created by 13 migrations in `supabase/migrations/`. Demonstration data is in `supabase/seed.sql`.

| Table | What it holds | Primary key | Foreign keys (→) | Migration |
|---|---|---|---|---|
| `albums` | A record title with artist, year, cover and genre | id | none | 0001, 0006, 0012 |
| `versions` | One pressing of an album | id | album_id → albums | 0001 |
| `tracks` | The track list of a version | id | version_id → versions | 0001 |
| `reason_texts` | One sentence per version and criterion | version_id + criterion | version_id → versions | 0001 |
| `glossary_terms` | Plain explanations of terms such as “remaster” | term | none | 0001 |
| `condition_grades` | The fixed list of condition grades (NM, VG+, VG, G) | code | none | 0001, 0005 |
| `profiles` | The public details of a buyer or seller | id | user_id → Supabase Auth user | 0001 |
| `listings` | One copy for sale | id | seller_id → profiles; claimed_version_id and actual_version_id → versions; condition_code → condition_grades | 0001, 0003, 0008 |
| `check_results` | The three checks of a listing | listing_id + item | listing_id → listings | 0001 |
| `orders` | One paid purchase of one listing | id | buyer_id → profiles; listing_id → listings | 0002, 0013 |
| `cart_items` | A record in a buyer's cart | id | buyer_id → profiles; listing_id → listings | 0009 |
| `addresses` | A buyer's saved delivery and billing address | id | profile_id → profiles | 0010 |
| `order_messages` | The buyer's message to the seller on an order | id | order_id → orders | 0011 |
| `reviews` | A buyer's rating of a seller | id | order_id → orders; seller_id → profiles | 0007 |
| `user_preferences` | A buyer's saved buying priorities | user_id | user_id → Supabase Auth user | 0004 |

## 1.2 Relationship diagram

Each line joins a foreign key to the table it points to. A fork marks the “many” side of a one-to-many relationship. The tables `profiles` and `user_preferences` also point to the Supabase Auth user table, which is outside this diagram, and `glossary_terms` is a stand-alone list.

```mermaid
erDiagram
  albums ||--o{ versions : "has"
  versions ||--o{ tracks : "has"
  versions ||--o{ reason_texts : "explained by"
  versions ||--o{ listings : "claimed or actual"
  condition_grades ||--o{ listings : "graded"
  profiles ||--o{ listings : "sells"
  listings ||--|{ check_results : "has 3"
  profiles ||--o{ orders : "buys"
  listings ||--o| orders : "one live order"
  orders ||--o| order_messages : "has"
  orders ||--o| reviews : "rated by"
  profiles ||--o{ reviews : "receives"
  profiles ||--o{ cart_items : "has"
  listings ||--o{ cart_items : "is in"
  profiles ||--o{ addresses : "has"
  albums { uuid id PK
    text title
    text artist
    text genre }
  versions { uuid id PK
    uuid album_id FK
    text name }
  tracks { uuid id PK
    uuid version_id FK }
  reason_texts { uuid version_id PK
    text criterion PK }
  glossary_terms { text term PK }
  condition_grades { text code PK }
  profiles { uuid id PK
    uuid user_id FK
    text name }
  listings { uuid id PK
    uuid seller_id FK
    uuid claimed_version_id FK
    uuid actual_version_id FK
    text condition_code FK
    numeric price }
  check_results { uuid listing_id PK
    text item PK }
  orders { uuid id PK
    uuid buyer_id FK
    uuid listing_id FK
    text status }
  cart_items { uuid id PK
    uuid buyer_id FK
    uuid listing_id FK }
  addresses { uuid id PK
    uuid profile_id FK
    text kind }
  order_messages { uuid id PK
    uuid order_id FK }
  reviews { uuid id PK
    uuid order_id FK
    uuid seller_id FK
    int rating }
  user_preferences { uuid user_id PK }
```

## 1.3 Design principles

- **Facts are stored; judgements are calculated.** The database holds what is true about albums, versions and listings. Anything the specification calls a rule (traffic light, active listing, price score, condition score, price label, checkout total) is calculated in `lib/rules/` and never stored, because a stored judgement could become outdated and contradict the rule (findings #1 and #2).
- **Illustrative data.** Every catalogue row, score, check result and seller in `supabase/seed.sql` is illustrative (Assignment 1, p. 12).
- **The browser never reads the database.** Row Level Security is enabled on every table, with no public policies, so only the application's server code (`lib/db/`) can read or write.
- **Prices are in euros**, stored as `numeric(8,2)` so that cents are exact and rounding errors cannot occur.

## 1.4 Catalogue tables

The data a buyer searches and compares: albums, their pressings and tracks, and the texts that explain them in plain language.

### `albums`

*Created in migration `0001_core.sql`.*

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, primary key | |
| `title` | text | searched by the buyer (story 1) |
| `artist` | text | searched by the buyer (story 1) |
| `release_year` | integer | search results are ordered newest first |
| `cover_url` | text | link to the real cover on the Cover Art Archive (`coverartarchive.org/release-group/<id>/front-500`); required |
| `genre` | text, optional: Rock, Jazz, Soul and funk, Fado, Electronic, Hip-hop or Classical | used for the crates on the home page (story 12, `0006_genres.sql`; Classical added by `0012_classical_genre.sql`); if empty, the album appears in no crate |

### `versions`

*Created in migration `0001_core.sql`.*

One pressing of an album, for example “2012 Remaster”.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, primary key | |
| `album_id` | → `albums` | |
| `name` | text | for example “1972 UK original” |
| `release_year`, `country`, `label`, `format` | text / integer | details shown in the recommendation (story 3) |
| `sound_score` | integer 1–5 | stored value (story 3) |
| `original_score` | integer 1–5 | stored value (story 3) |
| `rating_count` | integer ≥ 0 | shown as “Based on N collector ratings” |
| `typical_price_min`, `typical_price_max` | numeric, nullable | story 6; both empty or both filled; the minimum must be above zero and not above the maximum |

The price and condition scores are **not** columns: they are calculated from the listings (story 3, findings #1 and #2).

### `tracks`

*Created in migration `0001_core.sql`.*

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, primary key | |
| `version_id` | → `versions` | |
| `position` | text | for example “A1”, “B3” |
| `title` | text | |
| `is_extra` | boolean | shown as “Bonus” (story 3) |

The pair (`version_id`, `position`) is unique: a position appears only once in a version.

### `reason_texts`

*Created in migration `0001_core.sql`.*

One explanatory sentence per version and criterion (story 3, finding #3).

| Column | Type | Notes |
|---|---|---|
| `version_id` | → `versions` | primary key together with `criterion` |
| `criterion` | sound / price / original / condition | |
| `sentence` | text | may contain price placeholders such as `{lowest_price}`, filled in from the listings |

### `glossary_terms`

*Created in migration `0001_core.sql`.*

| Column | Type | Notes |
|---|---|---|
| `term` | text, primary key | for example “remaster”, “matrix” |
| `explanation` | text | explanation in plain language (story 3) |

### `condition_grades`

*Created in migration `0001_core.sql`.*

A fixed list, written in the buyer’s own words (finding #8).

| Column | Type | Notes |
|---|---|---|
| `code` | text, primary key | NM, VG+, VG, G |
| `name` | text, unique | Near mint, Very good, Good, Fair |
| `explanation` | text | approved wording: “No marks, almost like new” (`0005_condition_text.sql`, finding #59); “Light signs of wear”; “Visible wear and some audible noise”; “Heavily played, noticeable noise” |
| `sort_order` | integer, unique | ordered from best to worst |

The condition **score** (Near mint = 5 down to Fair = 2) is defined in `lib/rules/recommendation.ts`, not in this table.

## 1.5 People and listings

Who sells, what is for sale, and the three checks that give each listing its traffic light.

### `profiles`

*Created in migration `0001_core.sql`.*

The public details of a seller or buyer. Passwords and email addresses are kept in Supabase Auth, not here.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, primary key | |
| `user_id` | → Supabase Auth user, nullable, unique | empty for the illustrative sellers in the seed data; filled in by the application’s server code at sign-up (story 9), or created at log-in, or before Buy or Sell, if missing |
| `name` | text | |
| `city` | text, nullable | shown on the seller’s listings |
| `shop_name` | text, nullable | if filled, the seller is shown as a shop; if empty, as a “Private seller” (story 9) |

### `listings`

*Created in migration `0001_core.sql`.*

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, primary key | |
| `seller_id` | → `profiles` | |
| `claimed_version_id` | → `versions` | the version the seller stated |
| `actual_version_id` | → `versions` | the same as the claimed version, unless the listing is red and was moved to its real version (story 5) |
| `condition_code` | → `condition_grades` | |
| `price` | numeric(8,2), > 0 and ≤ 1000 | story 8: zero, negative and above-€1000 prices are refused (finding #79); the application also refuses more than two decimals |
| `status` | on_sale / sold / removed | |
| `cover_photo_url`, `record_photo_url` | text, nullable | required by the sell form (story 8) but not by the table |
| `matrix_photo_url` | text, nullable | if missing, the matrix check is “uncertain” (story 5) |
| `seller_city`, `seller_shop_name` | text, nullable | the city and shop this record is sold from (bug 11, `0008_listing_place.sql`); if empty, the seller’s profile values are used |
| `created_at` | timestamp | |

### `check_results`

*Created in migration `0001_core.sql`.*

The checklist of three items for each listing (story 5). The results are illustrative.

| Column | Type | Notes |
|---|---|---|
| `listing_id` | → `listings` | primary key together with `item` |
| `item` | cover_label / country_year / matrix | |
| `result` | match / uncertain / no_match | |

### How the app reads these tables

- **Traffic light** (`lib/rules/trafficLight.ts`): derived from the listing’s three `check_results` and from whether it has a matrix photo.
- **Active listing** (`lib/rules/activeListings.ts`): a listing with `status = on_sale` whose traffic light is green or yellow. A red listing counts for its `actual_version_id`, where it is shown as yellow.
- **Lowest price, counts and “No listings”**: calculated from active listings only.
- **Price label** (`lib/rules/fairPrice.ts`): compares `listings.price` with the version’s typical price range.

## 1.6 Buying tables

What happens between the cart and a paid order, and what a buyer saves about themselves.

### `orders`

*Created in migration `0002_orders.sql`.*

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, primary key | |
| `buyer_id` | → `profiles` | |
| `listing_id` | → `listings` | at most one non-cancelled order per listing (index created in `0013`): a sold record cannot be bought again, whereas a cancelled one can (story 39) |
| `record_price`, `shipping`, `protection_fee`, `total` | numeric(8,2) | amounts at the time of payment; `total` is calculated in `lib/rules/`, and the table refuses a total that is not the sum of the others |
| `status` | paid_waiting_seller / seller_paid / cancelled | `cancelled` is set by `cancel_order(...)`. `seller_paid` is set when the buyer confirms receipt with “It arrived, all good” (story 7, step 3): a single conditional update in `lib/db/orders.ts` (`confirmReceipt`), allowed only for the buyer's own order and only while it is `paid_waiting_seller` |
| `ship_name`, `ship_street`, `ship_postcode`, `ship_city` | text, not empty | entered for each order; postcode in the format 0000-000 (finding #41) |
| `created_at` | timestamp | |

There is no payment-method column, because MB WAY is the only method (finding #38).

### `cart_items`

*Created in migration `0009_cart.sql`.*

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, primary key | |
| `buyer_id` | → `profiles` | index on this column |
| `listing_id` | → `listings` | |
| `created_at` | timestamp | |

The pair (`buyer_id`, `listing_id`) is unique: a record cannot be in the same cart twice. Nothing is reserved, so the same record may be in two buyers’ carts.

### `addresses`

*Created in migration `0010_addresses.sql`.*

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, primary key | |
| `profile_id` | → `profiles`; deleted together with the profile | |
| `kind` | `delivery` or `billing` | |
| `name`, `street`, `city` | text, not empty | |
| `postcode` | text, format 0000-000 | same format check as in `orders` |
| `updated_at` | timestamp | |

The pair (`profile_id`, `kind`) is unique: one delivery address and, only if it differs, one billing address. The absence of a billing row means that billing is the same as delivery.

### `order_messages`

*Created in migration `0011_order_messages.sql`.*

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, primary key | |
| `order_id` | → `orders`; unique; deleted together with the order | one message per order |
| `body` | text, 1 to 500 characters | |
| `created_at` | timestamp | |

### `user_preferences`

*Created in migration `0004_preferences.sql`.*

| Column | Type | Notes |
|---|---|---|
| `user_id` | → Supabase Auth user, primary key | |
| `ranking` | an ordered list of one to four criteria | story 2; the values may only be sound, price, original and condition |

## 1.7 Reputation

### `reviews`

*Created in migration `0007_reviews.sql`.*

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, primary key | |
| `order_id` | → `orders`, unique | one review per order; empty for the illustrative reviews in the seed data |
| `seller_id` | → `profiles` | index on this column |
| `rating` | smallint, 1 to 5 | any other value is refused by the table |
| `created_at` | timestamp | |

## 1.8 Database functions and selling rules

Four functions each carry out a complete operation in a single step, all or nothing: if anything fails, nothing changes. Only the application's server key can call them.

| Function | Migration | What it does | Error raised (nothing is changed) |
|---|---|---|---|
| `place_order(...)` | 0002 | Pays for one record: it marks the listing `sold` only if it is still `on_sale`, then creates the order with the listing's price | `listing_not_on_sale` (“Sorry, this record was just sold”) |
| `place_orders(...)` | 0009 | Pays for the whole cart: each listing is marked `sold` only if it is still on sale, one order is created per record, and the paid records leave the cart | `listing_not_on_sale`, `no_items` |
| `create_listing(...)` | 0003, new version in 0008 | Publishes a listing (“List for sale”): it creates the listing (claimed and actual version equal, `on_sale`) and its three `check_results`, all `uncertain`; it saves the seller's city and shop name the first time, and stores the city and shop chosen for this listing | `version_not_found`, `city_required`, `photos_required` |
| `cancel_order(...)` | 0013 | Sets the order to `cancelled` and its listing back to `on_sale`; allowed only for the buyer's own order and only while it is “Paid”. The refund is simulated: nothing is stored | `order_not_cancellable` |

Rules that apply to selling:

- **Price limit:** `listings.price` may not exceed €1000 (finding #79). The complete price rule, with its messages, is in `lib/rules/`.
- **Photos:** stored in the public Storage bucket `listing-photos` (a photo is read through its link, as with the seed photos), at most 5 MB per file, in JPEG, PNG or WebP. The browser reduces each photo before sending it, and the application's server code uploads it with the server key. The links are saved in `cover_photo_url`, `record_photo_url` and `matrix_photo_url`.
- **Editing the price, removing and undoing:** single-row updates in `lib/db/listings.ts`, each allowed only when the listing has the expected status (editing and removing: `on_sale`; undoing: `removed`). If the listing was sold in the meantime, nothing changes and the application shows “This record was just sold”.

## 1.9 Migrations

The migrations in the order in which they were applied.

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
| `0012_classical_genre.sql` | “Classical” added to the allowed genres |
| `0013_cancel_order.sql` | `cancelled` order status, one live order per listing, `cancel_order(...)` (story 39) |

# 2. Screenshots

This part shows the screens of the application as a person meets them, grouped by what they do. Each figure has a number, a caption and the story it belongs to; the Appendix gives the title of each story. The main path is shown on a phone (375 px, left) and on a desktop (1280 px, right); the remaining screens are shown on desktop only, which is the reference layout.

## 2.1 Explore

How a buyer finds an album: the home page and its crates, the menu, search with suggestions and results, and the page that every album has.

**Home page: the search box and one crate per genre (story 12)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-12/home-375.png" alt="Home page: the search box and one crate per genre (story 12) (phone)"></td><td valign="top"><img src="../screenshots/story-12/home-1280.png" alt="Home page: the search box and one crate per genre (story 12) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>Genre screen for Rock (story 12)</b><br><img src="../screenshots/story-12/genre-rock-1280.png" alt="Genre screen for Rock (story 12) (desktop)"></td><td valign="top" width="50%"><b>Genre row on desktop, with arrows to move along it (story 36)</b><br><img src="../screenshots/story-36/arrows-start-1280.png" alt="Genre row on desktop, with arrows to move along it (story 36) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>The crate row with seven genres (story 24)</b><br><img src="../screenshots/story-24/crate-row-1280.png" alt="The crate row with seven genres (story 24) (desktop)"></td><td valign="top" width="50%"><b>Desktop header: navy top row and search strip (story 22)</b><br><img src="../screenshots/story-22/header-search-strip-1280.png" alt="Desktop header: navy top row and search strip (story 22) (desktop)"></td></tr></table>

**Menu opened on the phone, and the desktop header (story 19)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-19/menu-open-375.png" alt="Menu opened on the phone, and the desktop header (story 19) (phone)"></td><td valign="top"><img src="../screenshots/story-19/menu-1280.png" alt="Menu opened on the phone, and the desktop header (story 19) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>Search suggestions that appear while typing (story 16)</b><br><img src="../screenshots/story-16/suggestions-1280.png" alt="Search suggestions that appear while typing (story 16) (desktop)"></td></tr></table>

**Search results for “bowie”: cover, title, artist, year and number of versions, with the tags “No listings” and “Not in the demo” (stories 1, 17)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-17/results-375.png" alt="Search results for “bowie”: cover, title, artist, year and number of versions, with the tags “No listings” and “Not in the demo” (stories 1, 17) (phone)"></td><td valign="top"><img src="../screenshots/story-17/results-1280.png" alt="Search results for “bowie”: cover, title, artist, year and number of versions, with the tags “No listings” and “Not in the demo” (stories 1, 17) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>A misspelled search (“zigy”) suggests the full album title (story 17)</b><br><img src="../screenshots/story-17/typo-1280.png" alt="A misspelled search (“zigy”) suggests the full album title (story 17) (desktop)"></td><td valign="top" width="50%"><b>Fewer than three characters: no search is made and a hint is shown (story 1)</b><br><img src="../screenshots/story-1/search-too-short-1280.png" alt="Fewer than three characters: no search is made and a hint is shown (story 1) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>No match and no close suggestion: “No albums found” (story 1)</b><br><img src="../screenshots/story-1/search-no-albums-found-1280.png" alt="No match and no close suggestion: “No albums found” (story 1) (desktop)"></td><td valign="top" width="50%"><b>The album page that every album opens first (story 28)</b><br><img src="../screenshots/story-28/album-page-choose-1280.png" alt="The album page that every album opens first (story 28) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>Album page for a signed-in buyer with a saved ranking (story 28)</b><br><img src="../screenshots/story-28/album-page-saved-ranking-1280.png" alt="Album page for a signed-in buyer with a saved ranking (story 28) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>Album page for an album that nobody is selling, with details from MusicBrainz and Wikipedia (stories 21, 28)</b><br><img src="../screenshots/bug-17/album-details-1280.png" alt="Album page for an album that nobody is selling, with details from MusicBrainz and Wikipedia (stories 21, 28) (desktop)"></td><td valign="top" width="50%"><b>Desktop footer (story 14)</b><br><img src="../screenshots/story-14/footer-1280.png" alt="Desktop footer (story 14) (desktop)"></td></tr></table>

## 2.2 Choose

How a buyer picks the right pressing: what matters to them, one recommendation, a comparison, verified listings with their checks, fair prices, and previews to listen to.

**Buying priorities with nothing chosen yet: “See recommendation” is disabled (story 2)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-2/priorities-empty-375.png" alt="Buying priorities with nothing chosen yet: “See recommendation” is disabled (story 2) (phone)"></td><td valign="top"><img src="../screenshots/story-2/priorities-empty-1280.png" alt="Buying priorities with nothing chosen yet: “See recommendation” is disabled (story 2) (desktop)"></td></tr></table>

**Priorities chosen: Price ranked 1 and Sound ranked 2; the number on each option shows its rank (story 2)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-2/priorities-ranked-375.png" alt="Priorities chosen: Price ranked 1 and Sound ranked 2; the number on each option shows its rank (story 2) (phone)"></td><td valign="top"><img src="../screenshots/story-2/priorities-ranked-1280.png" alt="Priorities chosen: Price ranked 1 and Sound ranked 2; the number on each option shows its rank (story 2) (desktop)"></td></tr></table>

**With a saved ranking the priorities screen is skipped, and the recommendation shows “Based on: … · Change” (story 2)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-2/saved-ranking-skips-screen-375.png" alt="With a saved ranking the priorities screen is skipped, and the recommendation shows “Based on: … · Change” (story 2) (phone)"></td><td valign="top"><img src="../screenshots/story-2/saved-ranking-skips-screen-1280.png" alt="With a saved ranking the priorities screen is skipped, and the recommendation shows “Based on: … · Change” (story 2) (desktop)"></td></tr></table>

**Recommendation for Price, then Sound: the 2012 Remaster; on desktop the listings sit beside it (story 3)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-3/recommendation-price-sound-375.png" alt="Recommendation for Price, then Sound: the 2012 Remaster; on desktop the listings sit beside it (story 3) (phone)"></td><td valign="top"><img src="../screenshots/story-3/recommendation-price-sound-1280.png" alt="Recommendation for Price, then Sound: the 2012 Remaster; on desktop the listings sit beside it (story 3) (desktop)"></td></tr></table>

**Recommendation for Price only: the 1990 Reissue, with no alternative (story 3)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-3/recommendation-price-only-375.png" alt="Recommendation for Price only: the 1990 Reissue, with no alternative (story 3) (phone)"></td><td valign="top"><img src="../screenshots/story-3/recommendation-price-only-1280.png" alt="Recommendation for Price only: the 1990 Reissue, with no alternative (story 3) (desktop)"></td></tr></table>

**Recommendation for Original, then Sound, with a note that the ideal version is unavailable (story 3)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-3/recommendation-ideal-unavailable-375.png" alt="Recommendation for Original, then Sound, with a note that the ideal version is unavailable (story 3) (phone)"></td><td valign="top"><img src="../screenshots/story-3/recommendation-ideal-unavailable-1280.png" alt="Recommendation for Original, then Sound, with a note that the ideal version is unavailable (story 3) (desktop)"></td></tr></table>

**A glossary term and the track list opened, with bonus tracks marked (story 3)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-3/recommendation-glossary-tracks-375.png" alt="A glossary term and the track list opened, with bonus tracks marked (story 3) (phone)"></td><td valign="top"><img src="../screenshots/story-3/recommendation-glossary-tracks-1280.png" alt="A glossary term and the track list opened, with bonus tracks marked (story 3) (desktop)"></td></tr></table>

*Note: in this screenshot the explanation of the glossary term appears in heading style next to “Reissue”. This is a known visual flaw and not the intended design.*

**Comparison of pressings: the recommended version first, and the buyer’s priorities first (story 4)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-4/compare-375.png" alt="Comparison of pressings: the recommended version first, and the buyer’s priorities first (story 4) (phone)"></td><td valign="top"><img src="../screenshots/story-4/compare-1280.png" alt="Comparison of pressings: the recommended version first, and the buyer’s priorities first (story 4) (desktop)"></td></tr></table>

**Version page: how it fits the priorities, its tracks and its listings (story 4)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-4/version-375.png" alt="Version page: how it fits the priorities, its tracks and its listings (story 4) (phone)"></td><td valign="top"><img src="../screenshots/story-4/version-1280.png" alt="Version page: how it fits the priorities, its tracks and its listings (story 4) (desktop)"></td></tr></table>

**Verified listings: green “Match”, yellow “Check” and, last, red “No match”; each listing shows its “Pressing check” line and a price label (stories 5, 6, 33)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-5/listings-375.png" alt="Verified listings: green “Match”, yellow “Check” and, last, red “No match”; each listing shows its “Pressing check” line and a price label (stories 5, 6, 33) (phone)"></td><td valign="top"><img src="../screenshots/story-5/listings-1280.png" alt="Verified listings: green “Match”, yellow “Check” and, last, red “No match”; each listing shows its “Pressing check” line and a price label (stories 5, 6, 33) (desktop)"></td></tr></table>

**A yellow listing: “Before you buy” states what is uncertain (story 5)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-5/listings-yellow-warning-375.png" alt="A yellow listing: “Before you buy” states what is uncertain (story 5) (phone)"></td><td valign="top"><img src="../screenshots/story-5/listings-yellow-warning-1280.png" alt="A yellow listing: “Before you buy” states what is uncertain (story 5) (desktop)"></td></tr></table>

**Listing check, green: three matching checks, photos and the condition in plain words (story 5)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-5/listing-check-green-375.png" alt="Listing check, green: three matching checks, photos and the condition in plain words (story 5) (phone)"></td><td valign="top"><img src="../screenshots/story-5/listing-check-green-1280.png" alt="Listing check, green: three matching checks, photos and the condition in plain words (story 5) (desktop)"></td></tr></table>

**Listing check, yellow: no matrix photo was provided (story 5)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-5/listing-check-yellow-no-matrix-375.png" alt="Listing check, yellow: no matrix photo was provided (story 5) (phone)"></td><td valign="top"><img src="../screenshots/story-5/listing-check-yellow-no-matrix-1280.png" alt="Listing check, yellow: no matrix photo was provided (story 5) (desktop)"></td></tr></table>

**Listing check, red: a different pressing, moved to its own version and not for sale here (story 5)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-5/listing-check-red-375.png" alt="Listing check, red: a different pressing, moved to its own version and not for sale here (story 5) (phone)"></td><td valign="top"><img src="../screenshots/story-5/listing-check-red-1280.png" alt="Listing check, red: a different pressing, moved to its own version and not for sale here (story 5) (desktop)"></td></tr></table>

**The same listing under its real version: yellow, “Moved here · check pending” (story 5)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-5/listing-check-moved-here-375.png" alt="The same listing under its real version: yellow, “Moved here · check pending” (story 5) (phone)"></td><td valign="top"><img src="../screenshots/story-5/listing-check-moved-here-1280.png" alt="The same listing under its real version: yellow, “Moved here · check pending” (story 5) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>The recommendation with its listings and their checks beside it (story 33)</b><br><img src="../screenshots/story-33/recommendation-beside-1280.png" alt="The recommendation with its listings and their checks beside it (story 33) (desktop)"></td></tr></table>

**A red listing is compared with the price range of its real version (story 6)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-6/fair-price-red-actual-range-375.png" alt="A red listing is compared with the price range of its real version (story 6) (phone)"></td><td valign="top"><img src="../screenshots/story-6/fair-price-red-actual-range-1280.png" alt="A red listing is compared with the price range of its real version (story 6) (desktop)"></td></tr></table>

**A version without a price range: no label and no range line (story 6)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-6/fair-price-no-range-375.png" alt="A version without a price range: no label and no range line (story 6) (phone)"></td><td valign="top"><img src="../screenshots/story-6/fair-price-no-range-1280.png" alt="A version without a price range: no label and no range line (story 6) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>Listening to the album: a preview playing (story 34)</b><br><img src="../screenshots/story-34/album-preview-playing-1280.png" alt="Listening to the album: a preview playing (story 34) (desktop)"></td><td valign="top" width="50%"><b>Previews unavailable: the page works without them (story 34)</b><br><img src="../screenshots/story-34/album-preview-itunes-down-1280.png" alt="Previews unavailable: the page works without them (story 34) (desktop)"></td></tr></table>

## 2.3 Buy

How a buyer pays: logging in, the cart, the checkout, the order confirmation, and what happens when a record is sold to someone else meanwhile.

**Logging in without leaving the page: the window opens over the record the buyer chose (stories 27, 29)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-27/log-in-to-buy-375.png" alt="Logging in without leaving the page: the window opens over the record the buyer chose (stories 27, 29) (phone)"></td><td valign="top"><img src="../screenshots/story-27/log-in-to-buy-1280.png" alt="Logging in without leaving the page: the window opens over the record the buyer chose (stories 27, 29) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>Creating an account in the same window (story 27)</b><br><img src="../screenshots/story-27/create-account-1280.png" alt="Creating an account in the same window (story 27) (desktop)"></td><td valign="top" width="50%"><b>Message shown after a wrong password (story 27)</b><br><img src="../screenshots/story-27/wrong-password-1280.png" alt="Message shown after a wrong password (story 27) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>Session ended during a checkout: the window opens over the page and what was typed is kept (story 29)</b><br><img src="../screenshots/story-29/session-ended-1280.png" alt="Session ended during a checkout: the window opens over the page and what was typed is kept (story 29) (desktop)"></td></tr></table>

**The cart (story 20)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-20/cart-375.png" alt="The cart (story 20) (phone)"></td><td valign="top"><img src="../screenshots/story-20/cart-1280.png" alt="The cart (story 20) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>Adding a record to the cart (story 20)</b><br><img src="../screenshots/story-20/add-to-cart-1280.png" alt="Adding a record to the cart (story 20) (desktop)"></td><td valign="top" width="50%"><b>Confirmation that the record was added (story 20)</b><br><img src="../screenshots/story-20/added-1280.png" alt="Confirmation that the record was added (story 20) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>The empty cart (story 20)</b><br><img src="../screenshots/story-20/cart-empty-1280.png" alt="The empty cart (story 20) (desktop)"></td><td valign="top" width="50%"><b>A record sold to someone else stays in the cart, greyed and tagged “Sold” (story 35)</b><br><img src="../screenshots/story-35/cart-sold-1280.png" alt="A record sold to someone else stays in the cart, greyed and tagged “Sold” (story 35) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>Checkout reached with “Buy now” while the cart holds other records: a notice says that only this record is bought (bug 37)</b><br><img src="../screenshots/story-35/buy-now-notice-1280.png" alt="Checkout reached with “Buy now” while the cart holds other records: a notice says that only this record is bought (bug 37) (desktop)"></td></tr></table>

**Checkout: delivery address, MB WAY, price breakdown and protection steps, with no card fields (story 7)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-7/checkout-375.png" alt="Checkout: delivery address, MB WAY, price breakdown and protection steps, with no card fields (story 7) (phone)"></td><td valign="top"><img src="../screenshots/story-7/checkout-1280.png" alt="Checkout: delivery address, MB WAY, price breakdown and protection steps, with no card fields (story 7) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>Checkout for the whole cart (story 20)</b><br><img src="../screenshots/story-20/checkout-1280.png" alt="Checkout for the whole cart (story 20) (desktop)"></td><td valign="top" width="50%"><b>Record sold while the buyer is on the checkout: “Sorry, this record was just sold” (story 7)</b><br><img src="../screenshots/story-7/checkout-just-sold-1280.png" alt="Record sold while the buyer is on the checkout: “Sorry, this record was just sold” (story 7) (desktop)"></td></tr></table>

**Order confirmation, with its next steps (stories 7, 30)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-7/order-confirmation-375.png" alt="Order confirmation, with its next steps (stories 7, 30) (phone)"></td><td valign="top"><img src="../screenshots/story-7/order-confirmation-1280.png" alt="Order confirmation, with its next steps (stories 7, 30) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>Next steps after “Order placed”, for a whole cart (story 30)</b><br><img src="../screenshots/story-30/order-placed-cart-1280.png" alt="Next steps after “Order placed”, for a whole cart (story 30) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>A sold or removed listing opened from a link (story 7)</b><br><img src="../screenshots/story-7/no-longer-available-1280.png" alt="A sold or removed listing opened from a link (story 7) (desktop)"></td></tr></table>

## 2.4 Your account

What a buyer manages after buying: orders and their steps, cancelling, messages to the seller, ratings, saved addresses and buying priorities.

<table><tr><td valign="top" width="50%"><b>The account button in the header (story 32)</b><br><img src="../screenshots/story-32/pill-1280.png" alt="The account button in the header (story 32) (desktop)"></td><td valign="top" width="50%"><b>The account menu opened from the button (story 32)</b><br><img src="../screenshots/story-32/menu-open-1280.png" alt="The account menu opened from the button (story 32) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>Your account, Account details tab (story 31)</b><br><img src="../screenshots/story-31/details-1280.png" alt="Your account, Account details tab (story 31) (desktop)"></td><td valign="top" width="50%"><b>Your account, Orders tab with no orders (story 31)</b><br><img src="../screenshots/story-31/orders-empty-1280.png" alt="Your account, Orders tab with no orders (story 31) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>Your account, For sale tab (story 31)</b><br><img src="../screenshots/story-31/for-sale-1280.png" alt="Your account, For sale tab (story 31) (desktop)"></td><td valign="top" width="50%"><b>Orders created by paying the cart, in Your account (story 20)</b><br><img src="../screenshots/story-20/orders-in-account-1280.png" alt="Orders created by paying the cart, in Your account (story 20) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>Saved addresses before anything is saved (bug 9)</b><br><img src="../screenshots/bug-9/account-empty-1280.png" alt="Saved addresses before anything is saved (bug 9) (desktop)"></td><td valign="top" width="50%"><b>A delivery address and a different billing address (bug 9)</b><br><img src="../screenshots/bug-9/account-billing-different-1280.png" alt="A delivery address and a different billing address (bug 9) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>An order in progress, under “On its way” (story 7)</b><br><img src="../screenshots/story-7/account-on-its-way-1280.png" alt="An order in progress, under “On its way” (story 7) (desktop)"></td><td valign="top" width="50%"><b>Confirmation before the money is released to the seller (story 7)</b><br><img src="../screenshots/story-7/account-are-you-sure-1280.png" alt="Confirmation before the money is released to the seller (story 7) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>A delivered order, with the seller paid; the rating question opens by itself (stories 7, 18)</b><br><img src="../screenshots/story-7/account-delivered-1280.png" alt="A delivered order, with the seller paid; the rating question opens by itself (stories 7, 18) (desktop)"></td><td valign="top" width="50%"><b>Writing a message to the seller from the order (bug 8)</b><br><img src="../screenshots/bug-8/message-form-1280.png" alt="Writing a message to the seller from the order (bug 8) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>The sent message stays on the order under “You wrote” (bug 8)</b><br><img src="../screenshots/bug-8/you-wrote-1280.png" alt="The sent message stays on the order under “You wrote” (bug 8) (desktop)"></td><td valign="top" width="50%"><b>A “Paid” order offers “Cancel order” (story 39)</b><br><img src="../screenshots/story-39/paid-with-link-1280.png" alt="A “Paid” order offers “Cancel order” (story 39) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>Cancelling asks for confirmation first (story 39)</b><br><img src="../screenshots/story-39/cancel-box-1280.png" alt="Cancelling asks for confirmation first (story 39) (desktop)"></td><td valign="top" width="50%"><b>A cancelled order: greyed out, with no steps (story 39)</b><br><img src="../screenshots/story-39/cancelled-1280.png" alt="A cancelled order: greyed out, with no steps (story 39) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>Rating the seller after confirming receipt (story 18)</b><br><img src="../screenshots/story-18/rate-this-seller-1280.png" alt="Rating the seller after confirming receipt (story 18) (desktop)"></td><td valign="top" width="50%"><b>The rating question (story 18)</b><br><img src="../screenshots/story-18/rate-question-1280.png" alt="The rating question (story 18) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>The seller’s rating shown on the listings (story 18)</b><br><img src="../screenshots/story-18/listings-rating-1280.png" alt="The seller’s rating shown on the listings (story 18) (desktop)"></td><td valign="top" width="50%"><b>Buying priorities shown in Your account (story 23)</b><br><img src="../screenshots/story-23/account-priorities-1280.png" alt="Buying priorities shown in Your account (story 23) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>Changing the buying priorities (story 26)</b><br><img src="../screenshots/story-26/change-priorities-1280.png" alt="Changing the buying priorities (story 26) (desktop)"></td></tr></table>

## 2.5 Sell

How a seller lists and manages a record: finding the album, the sell form, My listings (edit, remove, undo) and the buyer’s message.

**Selling: finding the album (story 8)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-8/sell-search-375.png" alt="Selling: finding the album (story 8) (phone)"></td><td valign="top"><img src="../screenshots/story-8/sell-search-1280.png" alt="Selling: finding the album (story 8) (desktop)"></td></tr></table>

**Selling: choosing the version (story 8)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-8/sell-versions-375.png" alt="Selling: choosing the version (story 8) (phone)"></td><td valign="top"><img src="../screenshots/story-8/sell-versions-1280.png" alt="Selling: choosing the version (story 8) (desktop)"></td></tr></table>

**The sell form for a first listing, where the city is required (story 8)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-8/sell-form-first-time-375.png" alt="The sell form for a first listing, where the city is required (story 8) (phone)"></td><td valign="top"><img src="../screenshots/story-8/sell-form-first-time-1280.png" alt="The sell form for a first listing, where the city is required (story 8) (desktop)"></td></tr></table>

**The sell form: the typical price range, price label and “No commission” appear while typing (story 8)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-8/sell-form-375.png" alt="The sell form: the typical price range, price label and “No commission” appear while typing (story 8) (phone)"></td><td valign="top"><img src="../screenshots/story-8/sell-form-1280.png" alt="The sell form: the typical price range, price label and “No commission” appear while typing (story 8) (desktop)"></td></tr></table>

**A published listing, shown yellow and marked “Your listing” (story 8)**

<table><tr><td valign="top" width="25%"><img src="../screenshots/story-8/sell-listed-375.png" alt="A published listing, shown yellow and marked “Your listing” (story 8) (phone)"></td><td valign="top"><img src="../screenshots/story-8/sell-listed-1280.png" alt="A published listing, shown yellow and marked “Your listing” (story 8) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>The “Selling from” field: the city and shop for this listing (bug 11)</b><br><img src="../screenshots/bug-11/sell-form-selling-from-1280.png" alt="The “Selling from” field: the city and shop for this listing (bug 11) (desktop)"></td><td valign="top" width="50%"><b>Two listings of one seller from two different places (bug 11)</b><br><img src="../screenshots/bug-11/two-listings-two-places-1280.png" alt="Two listings of one seller from two different places (bug 11) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>Your account, For sale tab: My listings (story 8)</b><br><img src="../screenshots/story-8/my-listings-1280.png" alt="Your account, For sale tab: My listings (story 8) (desktop)"></td><td valign="top" width="50%"><b>My listings: editing the price of a listing (story 8)</b><br><img src="../screenshots/story-8/my-listings-edit-1280.png" alt="My listings: editing the price of a listing (story 8) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>My listings: removing a listing asks for confirmation first (story 8)</b><br><img src="../screenshots/story-8/my-listings-confirm-1280.png" alt="My listings: removing a listing asks for confirmation first (story 8) (desktop)"></td><td valign="top" width="50%"><b>My listings: confirmation “Listing removed”, with an Undo button (story 8)</b><br><img src="../screenshots/story-8/my-listings-removed-1280.png" alt="My listings: confirmation “Listing removed”, with an Undo button (story 8) (desktop)"></td></tr></table>

<table><tr><td valign="top" width="50%"><b>Your account, For sale tab, Sold list: the buyer’s message under the record (bug 8)</b><br><img src="../screenshots/bug-8/seller-sold-tab-1280.png" alt="Your account, For sale tab, Sold list: the buyer’s message under the record (bug 8) (desktop)"></td></tr></table>

## Notes on the screens

- The records, prices, sellers, checks and payments are illustrative. Cover art, album details and previews come from public services. The refund issued when an order is cancelled is simulated: nothing is stored for it.
- Loading screens and error screens are checked manually (`docs/manual-tests.md`) and are therefore not shown here.

# Appendix: stories and bugs in the captions

Each caption names the numbered story, or the numbered bug report, that the screen belongs to. The stories are described in `specs/stories/` and the bug reports in `specs/bugs/`.

| Reference | What it is |
|---|---|
| Story 1 | Search for an album |
| Story 2 | Say what matters to me |
| Story 3 | Get one recommendation |
| Story 4 | Compare versions |
| Story 5 | See verified listings |
| Story 6 | Fair price |
| Story 7 | Buy with protection |
| Story 8 | Sell a record for free |
| Story 12 | Home page |
| Story 14 | Desktop footer |
| Story 16 | Search suggestions |
| Story 17 | Search results page |
| Story 18 | Rate the seller |
| Story 19 | Menu with chevrons |
| Story 20 | Cart |
| Story 21 | Album details without listings |
| Story 22 | Navy header (desktop) |
| Story 23 | Buying priorities on the account page |
| Story 24 | More genres and a crate row |
| Story 26 | Change buying priorities |
| Story 27 | Log in without leaving the page |
| Story 28 | One album page for every album |
| Story 29 | A larger log-in window, used for every log-in |
| Story 30 | Next steps after "Order placed" |
| Story 31 | Your account in tabs |
| Story 32 | Account button and menu |
| Story 33 | "Pressing check" on every listing |
| Story 34 | Listen to the album |
| Story 35 | A sold record stays in the cart |
| Story 36 | Arrows on the genre row (desktop) |
| Story 39 | Cancel an order while it is "Paid" |
| Bug 8 | No way to message the seller after paying |
| Bug 9 | Account screen: no password change and no saved addresses |
| Bug 11 | "Selling from" no longer shown when listing another item |
| Bug 37 | "Buy now" with records in the cart buys only that record, without a notice |
