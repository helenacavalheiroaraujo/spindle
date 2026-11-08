# Manual test record — Spindle MVP

> Checks that no automated test covers (DECISIONS · Testing). Each row is what to do, what must happen, and the result.
> **Result:** "Not run" until someone has done the check; then the date, the size (phone 375 px / desktop 1280 px) and OK or what went wrong.
> Everything is checked at both sizes. All data is illustrative.

## How to make a screen fail or load slowly

- **Loading mask** (pages built on the server): start `npm run dev` fresh and open the screen by tapping a link to it for the first time. While the page is compiled the shared loading mask shows for a moment. It only shows in development.
- **Error screen**: in `.env.local` put a wrong value after `SUPABASE_SECRET_KEY=` (the last line wins), restart `npm run dev`, open the screen, check it, then put the real key back and restart. Every read from the database now fails.
- Never do this on the online (Vercel) app.

## Loading mask and error screen of the server screens

For each screen: the loading mask says what is loading; the error screen says what failed in plain words, offers "Try again", and "Try again" loads the screen once the key is right.

| ID | Story | Screen | How to open it | Loading text | Error text | Result |
|---|---|---|---|---|---|---|
| M1 | 2 | Priorities | Tap an album in the search results | "Loading the album…" | "We couldn't load this album. Check your connection." | Not run |
| M2 | 3 | Recommendation | "See recommendation" | "Finding your pressing…" | "We couldn't load the recommendation. Check your connection." | Not run |
| M3 | 5 | Verified listings (phone) | "See verified listings" | "Checking listings…" | "We couldn't load the listings. Check your connection." | Not run |
| M4 | 5 | Listing check | Open a listing | "Checking this listing…" | "We couldn't load this listing. Check your connection." | Not run |
| M5 | 7 | Checkout | "Buy with protection" (signed in) | "Loading the checkout…" | "We couldn't load the checkout. Check your connection." | Not run |
| M6 | 7 | Order confirmation | Pay (signed in) | "Loading your order…" | "We couldn't load your order. Check your connection." | Not run |
| M7 | 8 | Sell: the versions of an album | /sell → pick an album | the loading mask | "We couldn't load the versions. Check your connection." | Not run |
| M8 | 8 | Sell form | Pick a version → Continue | the loading mask | "We couldn't load the sell form. Check your connection." | Not run |
| M9 | 8 | My listings | Your account → My listings | "Loading your listings…" | "We couldn't load your listings. Check your connection." | Not run |
| M10 | 12 | Genre screen | Tap a crate on the home page | "Loading the crate…" | "We couldn't load this crate. Check your connection." | Not run |
| M13 | 7 | Your account (with "On its way") | Tap the initials in the header (signed in) | "Loading your account…" | "We couldn't load your account. Check your connection." | Not run |
| M14 | 17 | Search results | Search for "bowie" (Search button or Enter) | "Searching…" | "We couldn't load the albums. Check your connection." | Not run |
| M15 | 4 | Compare pressings | Open a recommendation (e.g. Ziggy Stardust, 1. Price, 2. Sound), tap "Compare pressings" | "Comparing pressings…" | "We couldn't load the comparison. Check your connection." | Not run |
| M16 | 4 | Version page | On the comparison, tap "See this version" | "Loading this version…" | "We couldn't load this version. Check your connection." | Not run |

## Other manual checks

| ID | Story | What to do | What must happen | Result |
|---|---|---|---|---|
| M11 | 8 | **Failed photo upload on a phone.** In `lib/db/photos.ts` change `BUCKET` to a name that does not exist, restart, and fill in the sell form with two photos → List for sale. Undo the change afterwards | "We couldn't upload your photos. Nothing was listed; your details are kept."; no listing is created; "Try again" brings back the form with the price, condition and photos as typed. (Automated on desktop only: WebKit cannot rewrite a request that carries files) | Not run |
| M12 | 8 | **The sell form keeps what was typed** after "We couldn't list your record": with the wrong key, fill in the form and List for sale | The message is shown; "Try again" brings back the form with everything as typed | Not run |
