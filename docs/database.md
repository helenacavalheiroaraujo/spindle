# Spindle MVP — Database

> Data tables before screens (CLAUDE.md, "How we build a story"). What each story needs: the "Data used" section of each story in `specs/`. Where database code lives: `lib/db/` (`ARCHITECTURE.md`).

## Principles

- **Store facts, calculate judgements.** The database keeps what is true about albums, versions and listings. Anything the SPEC calls a rule (traffic light, active listing, price score, condition score, price label, checkout total) is calculated in `lib/rules/`, never stored. A stored judgement would go stale and contradict the rule (same reason as findings #1 and #2).
- **Illustrative data.** Every catalogue row, score, check result and seller in `supabase/seed.sql` is illustrative (Assignment 1, p. 12).
- **The browser never reads the database.** Row Level Security is switched on for every table with no public policies, so only the app's server code (`lib/db/`) can read or write.
- **Prices in euros**, stored as `numeric(8,2)` (exact cents, no rounding errors).

## Tables by phase

| Phase | Tables | Stories | Migration |
|---|---|---|---|
| 1 · Core | `albums`, `versions`, `tracks`, `glossary_terms`, `reason_texts`, `condition_grades`, `profiles`, `listings`, `check_results` | 1, 2, 3, 5, 6 | `0001_core.sql` |
| 2 · Purchase | `user_preferences` (story 2), `orders` (story 7); story 9 adds no table, the app fills `profiles.user_id` at sign-up | 9, 7, 2 | `0002_orders.sql` (story 7), `0004_preferences.sql` (story 2) |
| 3 · Seller | no new tables: a price limit on `listings`, the `listing-photos` bucket in Storage and `create_listing(...)` | 8 | `0003_sell.sql` |
| 4 · If time allows | `reviews` (story 18); `albums.genre` (story 12); `cart_items` (story 20); `addresses` (bug 9); `order_messages` (bug 8) | 18, 12, 20 | `0007_reviews.sql` (story 18), `0006_genres.sql` (story 12), `0009_cart.sql` (story 20), `0010_addresses.sql` (bug 9), `0011_order_messages.sql` (bug 8) |

## Diagram (phase 1)

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

## Phase 1 tables

### `albums`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid, primary key | |
| `title` | text | searched (story 1) |
| `artist` | text | searched (story 1) |
| `release_year` | integer | search results: newest first |
| `cover_url` | text | link to the real cover on Cover Art Archive (`coverartarchive.org/release-group/<id>/front-500`); required |
| `genre` | text, optional: Rock, Jazz, Soul and funk, Fado, Electronic or Hip-hop | crates on the home page (story 12, `0006_genres.sql`); empty → in no crate |

### `versions`
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

### `tracks`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid, primary key | |
| `version_id` | → `versions` | |
| `position` | text | e.g. "A1", "B3" |
| `title` | text | |
| `is_extra` | boolean | shown as "Bonus" (story 3) |

### `reason_texts`
One sentence per version and criterion (story 3, finding #3).

| Column | Type | Notes |
|---|---|---|
| `version_id` | → `versions` | primary key with `criterion` |
| `criterion` | sound / price / original / condition | |
| `sentence` | text | may contain price placeholders, e.g. `{lowest_price}`, filled from the listings |

### `glossary_terms`
| Column | Type | Notes |
|---|---|---|
| `term` | text, primary key | e.g. "remaster", "matrix" |
| `explanation` | text | plain explanation (story 3) |

### `condition_grades`
Fixed list in the buyer's language (finding #8).

| Column | Type | Notes |
|---|---|---|
| `code` | text, primary key | NM, VG+, VG, G |
| `name` | text | Near mint, Very good, Good, Fair |
| `explanation` | text | approved texts: No marks, almost like new (`0005_condition_text.sql`, finding #59) · Light signs of wear · Visible wear and some audible noise · Heavily played, noticeable noise |
| `sort_order` | integer | best first |

The condition **score** (Near mint = 5 … Fair = 2) lives in `lib/rules/recommendation.ts`, not here.

### `profiles`
Public seller details. Passwords and emails stay in Supabase Auth.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, primary key | |
| `user_id` | → Supabase Auth user, nullable, unique | empty for illustrative sellers in the seed; filled in by the app's server code at sign-up (story 9), and created at login or before Buy / Sell if missing |
| `name` | text | |
| `city` | text, nullable | shown on listings |
| `shop_name` | text, nullable | filled → "Shop"; empty → "Private seller" (story 9) |

### `listings`
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
| `seller_city`, `seller_shop_name` | text, nullable | bug 11 (`0008_listing_place.sql`): where this listing is sold from, chosen on the sell form. Empty on older listings, which show the seller's profile `city` and `shop_name` instead (`lib/rules/seller.ts`, `listingPlace`) |

### `check_results`
The three-item checklist per listing (story 5). Mock data.

| Column | Type | Notes |
|---|---|---|
| `listing_id` | → `listings` | primary key with `item` |
| `item` | cover_label / country_year / matrix | |
| `result` | match / uncertain / no_match | |

## How the shared rules read these tables

- **Traffic light** (`lib/rules/trafficLight.ts`): from the listing's three `check_results` and whether it has a matrix photo.
- **Active listing** (`lib/rules/activeListings.ts`): `status = on_sale` and the traffic light is green or yellow. A red listing counts for its `actual_version_id`, where it is shown yellow.
- **Lowest price, counts, "No listings"**: from active listings only.
- **Price label** (`lib/rules/fairPrice.ts`): `listings.price` against the version's typical range.

## Phase 2 tables

### `user_preferences` (created: `0004_preferences.sql`)
| Column | Type | Notes |
|---|---|---|
| `user_id` | → Supabase Auth user, primary key | |
| `ranking` | ordered list of criteria, 1–4 items | story 2 |

### `orders` (created: `0002_orders.sql`)
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

### `reviews` (created: `0007_reviews.sql`)
| Column | Type | Notes |
|---|---|---|
| `id` | uuid, primary key | |
| `order_id` | → `orders`, unique, nullable | one review per order: a second one is refused by the table (story 18). Empty for the illustrative reviews in the seed, which have no real order |
| `seller_id` | → `profiles` | the seller being rated: taken from the order's listing, never from what the browser sends |
| `rating` | smallint | 1 to 5; the table refuses anything else |
| `created_at` | timestamp | |

Who can review is checked in `lib/db/reviews.ts` (`addReview`): only the buyer of the order, and only while it is "Seller paid". The average and the count are never stored: `lib/rules/sellerRating.ts` works them out from the rows. No comment column: comments are a later story.

### `cart_items` (created: `0009_cart.sql`)
| Column | Type | Notes |
|---|---|---|
| `id` | uuid, primary key | |
| `buyer_id` | → `profiles` | the cart belongs to the account (story 20) |
| `listing_id` | → `listings` | `unique (buyer_id, listing_id)`: the same listing cannot be in the same cart twice. Two buyers can have the same listing in their carts: nothing is reserved |
| `created_at` | timestamp | the cart shows the records in the order they were added |

Who can add (not red, not sold, not the seller's own: `lib/rules/cartAccess.ts`) is checked in `lib/db/cart.ts` (`addToCart`), never trusted from the browser. A record that can no longer be bought is deleted from the cart by `getCart`, which returns the message for it once. The total is never stored: `lib/rules/cartTotal.ts` works it out from the listings' prices.

**`place_orders(...)`** (same migration): Pay for the whole cart in one step, all or nothing. For each record it marks the listing `sold` only if it is still `on_sale` and creates its order (with the listing's price and the total calculated in `lib/rules/`); if any listing is no longer on sale it raises `listing_not_on_sale` and changes nothing. The paid records leave the buyer's cart in the same step. Only the server key can call it.

### `addresses` (created: `0010_addresses.sql`, bug 9)
| Column | Type | Notes |
|---|---|---|
| `id` | uuid, primary key | |
| `profile_id` | → `profiles` | deleted with the profile |
| `kind` | text | `delivery` or `billing`; `unique (profile_id, kind)`: at most one of each |
| `name`, `street`, `city` | text | not empty |
| `postcode` | text | `0000-000`, the same check as `orders.ship_postcode` |
| `updated_at` | timestamp | |

No `billing` row means "billing is the same as delivery". The browser never reads the table: `lib/db/addresses.ts` does, with the server key, for the signed-in user only. The checkout starts with the saved delivery address, otherwise the address of the last order (`lib/rules/shippingAddress.ts`, `startingAddress`). The billing address is only stored and shown on "Your account": orders keep only the shipping address.

### `order_messages` (created: `0011_order_messages.sql`, bug 8)
| Column | Type | Notes |
|---|---|---|
| `id` | uuid, primary key | |
| `order_id` | → `orders` | `unique`: one message per order. Deleted with the order |
| `body` | text | not empty, at most 500 characters |
| `created_at` | timestamp | |

The buyer writes it on the order ("Message the seller"); the seller reads it under the sold record in My listings. Who can send (the buyer of the order, only while it is "Paid") is checked in `lib/db/messages.ts`, never trusted from the browser. There are no replies and no unread state.

## Phase 3 · Seller (`0003_sell.sql`)

No new tables. Story 8 writes to `listings`, `check_results` and `profiles` (city and shop name, the first time).

- **Price limit:** `listings.price` must be at most €1000 (finding #79). The full price rule, with its messages, lives in `lib/rules/`.
- **Photos:** Storage bucket `listing-photos`, public (a photo is read through its link, like the seed photos), 5 MB per file, JPEG, PNG or WebP. The browser reduces each photo before sending; the app's server code uploads it with the server key. The links are saved in `cover_photo_url`, `record_photo_url` and `matrix_photo_url`.
- **`create_listing(...)`:** "List for sale" in one step, all or nothing. Creates the listing (claimed = actual version, `on_sale`) and its three `check_results`, all `uncertain`, so a new listing is yellow (story 5). The first time, it also saves the seller's `city` (required) and `shop_name` (optional); once saved, they are not changed (finding #82). Raises `version_not_found`, `city_required` or `photos_required` and changes nothing. Only the server key can call it.
- **Bug 11 (`0008_listing_place.sql`):** adds `listings.seller_city` and `listings.seller_shop_name` (nullable, additive) and replaces `create_listing(...)` with the same arguments. The listing now stores the city and shop name it was published with; if `p_city` is empty it takes the profile's. The profile still keeps only the first city and shop name. Same errors as before.
- **Bug 10 (no migration):** editing a listing on sale updates `price`, `condition_code` and the photo links in one update, only if it is still `on_sale`; the version never changes.
- **Edit price, remove, undo:** single-row updates in `lib/db/listings.ts`, each only if the listing is in the expected status (edit and remove: `on_sale`; undo: `removed`). If the listing was sold meanwhile, nothing changes and the app shows "This record was just sold".
