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
| 2 · Purchase | `user_preferences` (story 2), `orders` (story 7); story 9 adds no table, the app fills `profiles.user_id` at sign-up | 9, 7, 2 | one migration per story, created with that story |
| 3 · Seller | no new tables (listings, photos in Storage) | 8 | — |

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
| `cover_url` | text | |

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
| `explanation` | text | approved texts: Almost like new, no marks · Light signs of wear · Visible wear and some audible noise · Heavily played, noticeable noise |
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
| `price` | numeric(8,2), > 0 | story 8: 0 or negative refused |
| `status` | on_sale / sold / removed | |
| `cover_photo_url`, `record_photo_url` | text, nullable | required by the sell form (story 8), not by the table |
| `matrix_photo_url` | text, nullable | missing → matrix check is "uncertain" (story 5) |
| `created_at` | timestamp | |

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

## Phase 2 tables (planned, not yet created)

### `user_preferences`
| Column | Type | Notes |
|---|---|---|
| `user_id` | → Supabase Auth user, primary key | |
| `ranking` | ordered list of criteria, 1–4 items | story 2 |

### `orders`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid, primary key | |
| `buyer_id` | → `profiles` | |
| `listing_id` | → `listings`, unique | one order per listing: a sold listing cannot be bought again (story 7) |
| `record_price`, `shipping`, `protection_fee`, `total` | numeric(8,2) | amounts at the time of paying |
| `status` | paid_waiting_seller / seller_paid | |
| `ship_name`, `ship_street`, `ship_postcode`, `ship_city` | text | typed per order |
| `payment_method` | mbway / card | label only, no card details |
| `created_at` | timestamp | |
