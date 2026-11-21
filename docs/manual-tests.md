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
| M21 | 20 | Cart | Tap the cart icon in the header (signed in) | "Loading your cart…" | "We couldn't load your cart. Check your connection." | Not run |
| M22 | 20 | Cart checkout | In the cart, tap "Go to checkout" | "Loading the checkout…" | "We couldn't load the checkout. Check your connection." | Not run |
| M23 | 21 | Album with no listings | Search "blackstar" and tap the album | "Loading the album…" | "We couldn't load this album. Check your connection." | Not run |
| M24 | 28 | Album page with listings | Search "ziggy" and tap the album | "Loading the album…" | "We couldn't load this album. Check your connection." | Not run · Bug 29 (specs/bugs/bug-29-album-release-date-label-missing.md) |
| M26 | 30 | Order placed (cart) | Pay in the cart checkout (signed in) | "Loading your orders…" | "We couldn't load your orders. Check your connection." | Not run |
| M27 | 31 | Account tab: For sale | Your account → For sale | "Loading your listings…" | "We couldn't load your listings. Check your connection." | Not run |
| M28 | 31 | Account tab: Account details | Your account → Account details | "Loading your details…" | "We couldn't load your account details. Check your connection." | Not run |

## Other manual checks

| ID | Story | What to do | What must happen | Result |
|---|---|---|---|---|
| M11 | 8 | **Failed photo upload on a phone.** In `lib/db/photos.ts` change `BUCKET` to a name that does not exist, restart, and fill in the sell form with two photos → List for sale. Undo the change afterwards | "We couldn't upload your photos. Nothing was listed; your details are kept."; no listing is created; "Try again" brings back the form with the price, condition and photos as typed. (Automated on desktop only: WebKit cannot rewrite a request that carries files) | Not run |
| M12 | 8 | **The sell form keeps what was typed** after "We couldn't list your record": with the wrong key, fill in the form and List for sale | The message is shown; "Try again" brings back the form with everything as typed | Not run |
| M17 | 24 | Crate row, desktop: Home page with 7 or more crates: drag the row with the trackpad | The row moves with the trackpad; a drag opens no crate | Not run |
| M18 | 24 | Crate row, phone: Home page on a phone: swipe the crate row sideways | The row moves sideways; the progress line follows | Not run |
| M19 | 25 | Buy and Add to cart: A green listing on the recommendation page (desktop) and the listings screen (phone) | There is visible space between "Buy" and "Add to cart" | Not run |
| M20 | 25 | Recommendation page, desktop: Open a recommendation at 1280 px | The track list is under the cover; the three reasons are cards side by side; "Get this one" starts level with the cover | Not run |
| M25 | 28 | **Album details from MusicBrainz (bug 29).** On the live site, open the album page of "Let's Dance", "Divenire", "The Dark Side of the Moon" and "Ziggy Stardust", waiting a few seconds between albums; then open each one again | Let's Dance: Released March 1983, Label EMI America, 8 tracks. Divenire: 7 November 2006, Decca Records, 12 tracks. The Dark Side of the Moon: 24 March 1973, Harvest, 10 tracks. Ziggy Stardust: 6 June 1972, RCA Victor, 11 tracks. The second visit shows the same at once. Known and accepted: "AM" shows 1 January 2013 (wrong in MusicBrainz) | Not run |
| M29 | 12 | **Home sections fail.** With the wrong key (see above), open the home page | "Loading the shop…" first; then "We couldn't load the shop. Check your connection." with "Try again"; the search box stays usable; "Try again" shows the crates once the key is right | Not run |
| M30 | 16 | **Search suggestions fail.** With the wrong key, type "bowie" in the search box (3 characters or more) | "Searching…" first; then "We couldn't load the albums. Check your connection." with "Try again"; the typed text stays; "Try again" shows the suggestions once the key is right | Not run |
| M31 | 21 | **No details for an album with no listings.** Open an album that nobody is selling (e.g. "Blackstar") with MusicBrainz and Wikipedia unreachable: put `MUSICBRAINZ_URL=http://localhost:9` in `.env.local`, add `127.0.0.1 en.wikipedia.org` to `/etc/hosts`, restart `npm run dev`. Undo both afterwards. The way to make both fail is not tried yet | "Nobody is selling this album right now" and "The details of this album are not available right now."; no release date, label, musician or tracks; the page works | Not run |
| M32 | 26 | **Change buying priorities fails.** Your account → buying priorities → Change, pick a new order, Save, with the wrong key. Check at 375 px and 1280 px | "Saving…" first; then "We couldn't save your order." with "Try again"; the saved order stays as it was; "Try again" saves it once the key is right | Not run |
| M33 | 27 | **Log in fails in the window.** Signed out, open the log-in window (menu "Log in"), type an email and a password, turn the Wi-Fi off, then press "Log in". Turn the Wi-Fi on afterwards | "Logging you in…" first; then "We couldn't log you in." with "Try again"; the email and password stay typed; "Try again" logs in once the Wi-Fi is on | Not run |
| M34 | 34 | **Album previews from live iTunes.** On the live site, open the album page of "The Dark Side of the Moon" and "Ziggy Stardust" | The line "Previews are from the album on iTunes, not from a specific pressing."; matched tracks show "▶ Preview" and play 30 seconds; only one plays at a time; an unmatched track has no button (the automated tests use a local stand-in for iTunes) | Not run |
| M35 | bug 30 | **Autofilled email in the log-in window.** On the phone or browser where it was seen (with a saved log-in or a password manager), open the log-in window (menu "Log in", Buy, Add to cart or Sell), let the browser fill in the email, then type the password | The filled-in email stays when the password is typed, and "Log in" works (the automated test sets the value without the browser's own event) | Not run |
