# Story 3 · Get one recommendation

> Part of the Spindle MVP specification. Build order, out of scope, shared rules and traceability: [`SPEC.md`](../SPEC.md).


**As a buyer, I want one version picked for me, and why, so I don't get lost.**

## Scope
- Recommendation screen ("Get this one"), opened from the priorities screen (story 2)
- Picks **one version among those with active listings**, using the buyer's ranked priorities
- Shows **why**, in plain language, tied to the buyer's priorities
- Listings for that version (story 5): on **desktop**, beside the recommendation; on **phone**, a **"See verified listings"** button opens them on their own screen (as in the designs)

## How the pick is made
- **Sound** and **original** scores (1–5) are stored per version (illustrative data)
- The **condition** score is calculated: the best condition among the version's active listings (Near mint = 5, Very good = 4, Good = 3, Fair = 2)
- The **price** score is calculated from each version's lowest active price: **5 × (cheapest lowest price of the album ÷ this version's lowest price)**, rounded to a whole number, minimum 1 (e.g. €24 → 5, €32 → 4, €185 → 1)
- Each rank position has fixed **weights**: 1st = 3, 2nd = 2, 3rd = 1, 4th = 0.5 (starting values, to be tuned)
- **Total = sum of (score × weight)** for the chosen priorities; the highest total wins
- **Tie:** the cheaper version wins
- Only versions with at least one active listing can be recommended
- **Ideal version:** the highest total among all versions of the album, including those with no listings; a version with no listings scores 0 on price and condition. If it has no listings, the "ideal but unavailable" note is shown

## What the screen shows
- **Recommended version:** name (e.g. "2012 Remaster"), release year, country, label, format, number of listings, lowest price
- **Matches:** tags for the chosen priorities where the version scores 4 or 5 (e.g. "Matches: sound", "Matches: price")
- **Reasons:** one sentence per chosen priority, in rank order (max 3), from fixed text per version and per criterion; prices inside sentences come from the data (e.g. "Costs €[lowest price], vs €[first pressing price] for a first pressing"); a price of a version with no active listings is its typical range, with "typically" (e.g. "vs typically €150–€220 for a first pressing")
- **Technical terms** (e.g. "remaster", "first pressing", "matrix") always come with a short plain explanation
- **Source:** "Based on N collector ratings · Illustrative data"
- **Track list:** collapsed; tap to open; extra tracks labelled **"Bonus"**
- **Alternative:** the best version on the 1st priority alone, shown small, only if different from the recommendation, with a label per 1st priority: Price → "Cheapest option"; Sound → "Best sound"; Original → "Closest to the original"; Condition → "Best condition" (e.g. "Cheapest option: 1990 Reissue, €24"); on a tie, the cheaper version
- **Ideal but unavailable:** if the best version overall has no listings, a small note: "The ideal pressing for your priorities is the 1972 UK original, but nobody is selling it right now."
- **"Change"** (priorities) → back to story 2

## Acceptance criteria
- [x] With "1. Price, 2. Sound" and the example data, the 2012 Remaster is recommended (22 vs 19 points)
- [x] With "1. Price" only, the 1990 Reissue is recommended
- [x] On a tie, the cheaper version is recommended
- [x] A version with no listings is never the main recommendation
- [x] If the best overall version has no listings, the "ideal but unavailable" note is shown
- [x] The alternative is shown only when it differs from the recommendation
- [x] "Matches" tags appear only for chosen priorities with a score of 4 or 5
- [x] With "1. Sound, 2. Price", the first reason is about sound and the second about price
- [x] Prices in the reasons match the current listings, or the typical range of a version with no active listings
- [x] Every term in the glossary (at least: remaster, reissue, first pressing, matrix, and each condition grade) shows its plain explanation wherever it appears
- [x] The source line is shown
- [x] The track list is collapsed until tapped; extra tracks show "Bonus"

## Example data for the tests
| Version | Lowest price | Price score (calculated) | Sound score |
|---|---|---|---|
| 1990 Reissue | €24 | 5 | 2 |
| 2012 Remaster | €32 | 4 | 5 |

## Edge cases
- No version of the album has listings → does not reach this screen (story 1 shows "Nobody is selling this album right now" instead)
- Only one version has listings → it is recommended; no alternative
- Conflicting priorities → the weighted total decides; the alternative shows the other side

## Data used
- **Version:** release year, country, label, format, scores (sound, price, original, condition), number of collector ratings
- **Track:** version, position, title, is extra (yes/no)
- **Listing:** version, price (count and lowest price)
- **Glossary term:** term, plain explanation
- **Reason text:** version, criterion (sound / price / original / condition), sentence (may contain price placeholders)

## Non-functional
- The recommendation is calculated in one place (one function), covered by unit tests
- All data labelled illustrative

## Out of scope (MVP)
- 30-second previews (story 11)
- Social proof ("128 buyers chose…", "last copy sold…")
- "Compare pressings" (story 4, phase 4)
- AI-written explanations (fixed text, Assignment 1 p. 12)
