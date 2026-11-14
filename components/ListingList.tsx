import Link from "next/link";
import type { ListingDetails } from "@/lib/db/listings";
import { allRed, listingsForVersion } from "@/lib/rules/listingOrder";
import { formatPriorities, type Priority } from "@/lib/rules/priorities";
import { formatPrice } from "@/lib/rules/recommendation";
import { yellowWarning } from "@/lib/rules/yellowWarning";
import { priceBar as barFor, priceLabel, type TypicalRange } from "@/lib/rules/fairPrice";
import { CARD_TINT, PressingCheck } from "@/components/PressingCheck";
import { BuyButton } from "@/components/BuyButton";
import { AddToCart } from "@/components/AddToCart";
import { checkoutPath, isOwnListing } from "@/lib/rules/checkoutAccess";
import { YourListing } from "@/components/YourListing";
import { sellerText } from "@/lib/rules/seller";
import { SellerLine } from "@/components/SellerLine";
import { SellerRating } from "@/components/SellerRating";
import { loginRecord } from "@/lib/rules/loginWindow";

// Verified listings for one version (story 5), each with its price label (story 6): on its own screen on phone, beside the recommendation on desktop.
// "from" tells the listing check screen where its Back button goes. viewerId: the signed-in user's profile id,
// so their own listings show "Your listing" instead of Buy (story 8 · finding #12).
export function ListingList({
  versionId,
  record,
  listings,
  typicalRange,
  ranking,
  from,
  Heading,
  viewerId,
  priceBar = false,
}: {
  versionId: string;
  record: { albumTitle: string; versionName: string }; // for the record summary in the log-in window (story 27)
  listings: ListingDetails[];
  typicalRange: TypicalRange; // this version's range, for the line below the list

  ranking: Priority[];
  from: "list" | "recommendation";
  Heading: "h1" | "h2";
  viewerId: string | null;
  priceBar?: boolean; // the fair price bar above the sentence: only next to the recommendation on desktop (design option A)
}) {
  const rows = listingsForVersion(listings, versionId);
  const forSale = rows.filter((r) => r.light !== "red").length;
  const moved = rows.length - forSale;
  const query = `version=${versionId}${ranking.length ? `&priorities=${formatPriorities(ranking)}` : ""}${
    from === "recommendation" ? "&from=recommendation" : ""
  }`;

  const prioritiesQuery = ranking.length ? `?priorities=${formatPriorities(ranking)}` : "";

  return (
    <>
      <Heading className="font-heading text-4xl leading-tight">
        {forSale} for sale{moved > 0 && ` · ${moved} moved`}
      </Heading>

      {allRed(rows) && (
        <p role="note" className="mt-4 rounded-2xl border border-line bg-white/50 p-4 font-semibold">
          No listing matches this version yet
        </p>
      )}

      <ul aria-label="Verified listings" className={`mt-3 space-y-3 ${from === "list" ? "lg:grid lg:grid-cols-2 lg:gap-x-8 lg:gap-y-3 lg:space-y-0" : ""}`}>
        {rows.map(({ listing: l, light, movedHere, movedToVersionId }) => {
          const label = `${formatPrice(l.price)}, ${l.condition.name}, ${sellerText(l.seller)}`;
          const summary = loginRecord({ ...record, conditionCode: l.condition.code, seller: l.seller, city: l.city, price: l.price });
          return (
            <li key={l.id} aria-label={label} className={`flex flex-wrap items-start gap-x-4 gap-y-3 rounded-2xl border p-4 ${CARD_TINT[light]}`}>
              <span aria-hidden className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy">
                <span className="h-3 w-3 rounded-full bg-cream" />
              </span>
              <div className="min-w-0 flex-1 text-sm">
              {/* Finding #10 (DECISIONS 2026-11-09): "Moved to …" opens the listings of the version it moved to.
                  "It's a different pressing" is said once, in the Pressing check line (DECISIONS 2026-11-14, story 33). */}
              {light === "red" && movedToVersionId && (
                <p className="font-semibold">
                  <Link href={`/versions/${movedToVersionId}/listings${prioritiesQuery}`} className="underline underline-offset-4">
                    Moved to {l.actualVersionName}
                  </Link>
                </p>
              )}
              <Link href={`/listings/${l.id}?${query}`} aria-label={`Open ${label}`} className="block rounded-lg hover:bg-sand/60">
                {light === "red" ? (
                  <>
                    <p className="text-navy/70">Not for sale here</p>
                    <Price price={l.price} range={l.actualTypicalRange} />
                  </>
                ) : (
                  <>
                    <Price price={l.price} range={l.actualTypicalRange} big />
                    {movedHere && <p className="font-semibold">Moved here · check pending</p>}
                  </>
                )}
                <p>
                  {l.condition.name} ({l.condition.code}): {l.condition.explanation.toLowerCase()}
                </p>
                <p className="text-navy/70">
                  <SellerLine seller={l.seller} city={l.city} />
                  <SellerRating rating={l.rating} />
                </p>
                <PressingCheck light={light} />
              </Link>
              </div>
              {light !== "red" && (
                <div className="flex w-full justify-end lg:w-auto lg:has-[[role=group]]:w-full">
                  {isOwnListing(l.sellerId, viewerId) ? (
                    <YourListing />
                  ) : (
                    <div className="flex w-full flex-col items-end">
                      <BuyButton
                        href={checkoutPath(l.id, versionId)}
                        listingLabel={label}
                        record={summary}
                        warning={light === "yellow" ? yellowWarning(l.checks, l.hasMatrixPhoto, movedHere) : null}
                      />
                      <AddToCart listingId={l.id} listingLabel={label} record={summary} />
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {priceBar && <FairPriceBar range={typicalRange} lowest={lowestOnSale(rows)} />}
      {typicalRange.min !== null && typicalRange.max !== null && (
        <p className="mt-6 font-semibold">
          Typical price for this pressing: {formatPrice(typicalRange.min)}–{formatPrice(typicalRange.max)}
        </p>
      )}
      <p className="mt-2 text-sm text-navy/70">Check results and typical prices are illustrative data</p>
    </>
  );
}

// Price with its label (story 6). A red listing passes its actual version's range (shared rule).
// No range → no label, never a guess.
function Price({ price, range, big = false }: { price: number; range: TypicalRange; big?: boolean }) {
  const label = priceLabel(price, range);
  return (
    <p className="flex flex-wrap items-center gap-2">
      <span className={big ? "text-lg font-bold" : "font-semibold"}>{formatPrice(price)}</span>
      {label && (
        <span className="whitespace-nowrap rounded-full border border-line bg-white/70 px-2.5 py-0.5 text-xs font-semibold">
          {label}
        </span>
      )}
    </p>
  );
}

const lowestOnSale = (rows: { listing: { price: number }; light: string }[]): number | null => {
  const prices = rows.filter((r) => r.light !== "red").map((r) => r.listing.price);
  return prices.length ? Math.min(...prices) : null;
};

// Where the lowest price on sale sits against the typical range (design option A, desktop recommendation).
// The sentence below it still says the range in words.
function FairPriceBar({ range, lowest }: { range: TypicalRange; lowest: number | null }) {
  const bar = lowest === null ? null : barFor(lowest, range);
  if (!bar || range.min === null || range.max === null) return null;
  return (
    <div
      role="img"
      aria-label={`The lowest price, ${formatPrice(lowest!)}, against the typical range ${formatPrice(range.min)} to ${formatPrice(range.max)}`}
      className="mt-6 px-3"
    >
      <div className="relative mt-8 h-2 rounded-full bg-line">
        <span className="absolute inset-y-0 rounded-full bg-[#c9b896]" style={{ left: `${bar.bandLeft}%`, width: `${bar.bandRight - bar.bandLeft}%` }} />
        <span className="absolute -top-1.5 h-5 w-5 -translate-x-1/2 rounded-full border-[3px] border-cream bg-navy" style={{ left: `${bar.marker}%` }}>
          <span className="absolute bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-navy px-2.5 text-sm font-semibold text-cream">
            {formatPrice(lowest!)}
          </span>
        </span>
      </div>
      <div className="relative mt-2 h-5 text-sm text-navy/70">
        <span className="absolute -translate-x-1/2" style={{ left: `${bar.bandLeft}%` }}>{formatPrice(range.min)}</span>
        <span className="absolute -translate-x-1/2" style={{ left: `${bar.bandRight}%` }}>{formatPrice(range.max)}</span>
      </div>
    </div>
  );
}
