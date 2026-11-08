import Link from "next/link";
import type { ListingDetails } from "@/lib/db/listings";
import { allRed, listingsForVersion } from "@/lib/rules/listingOrder";
import { formatPriorities, type Priority } from "@/lib/rules/priorities";
import { formatPrice } from "@/lib/rules/recommendation";
import { yellowWarning } from "@/lib/rules/yellowWarning";
import { priceLabel, type TypicalRange } from "@/lib/rules/fairPrice";
import { LightLegend, TrafficLight } from "@/components/TrafficLight";
import { BuyButton } from "@/components/BuyButton";
import { checkoutPath } from "@/lib/rules/checkoutAccess";
import { sellerText } from "@/lib/rules/seller";
import { SellerLine } from "@/components/SellerLine";

// Verified listings for one version (story 5), each with its price label (story 6): on its own screen on phone, beside the recommendation on desktop.
// "from" tells the listing check screen where its Back button goes.
export function ListingList({
  versionId,
  listings,
  typicalRange,
  ranking,
  from,
  Heading,
}: {
  versionId: string;
  listings: ListingDetails[];
  typicalRange: TypicalRange; // this version's range, for the line below the list

  ranking: Priority[];
  from: "list" | "recommendation";
  Heading: "h1" | "h2";
}) {
  const rows = listingsForVersion(listings, versionId);
  const forSale = rows.filter((r) => r.light !== "red").length;
  const moved = rows.length - forSale;
  const query = `version=${versionId}${ranking.length ? `&priorities=${formatPriorities(ranking)}` : ""}${
    from === "recommendation" ? "&from=recommendation" : ""
  }`;

  return (
    <>
      <Heading className="font-heading text-4xl leading-tight">
        {forSale} for sale{moved > 0 && ` · ${moved} moved`}
      </Heading>
      <div className="mt-3 border-b border-line pb-3">
        <LightLegend />
      </div>

      {allRed(rows) && (
        <p role="note" className="mt-4 rounded-2xl border border-line bg-white/50 p-4 font-semibold">
          No listing matches this version yet
        </p>
      )}

      <ul aria-label="Verified listings">
        {rows.map(({ listing: l, light, movedHere }) => {
          const label = `${formatPrice(l.price)}, ${l.condition.name}, ${sellerText(l.seller)}`;
          return (
            <li key={l.id} aria-label={label} className="flex flex-wrap items-start gap-x-4 gap-y-3 border-b border-line py-4">
              <span aria-hidden className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy">
                <span className="h-3 w-3 rounded-full bg-cream" />
              </span>
              <Link href={`/listings/${l.id}?${query}`} aria-label={`Open ${label}`} className="min-w-0 flex-1 rounded-lg text-sm">
                {light === "red" ? (
                  <>
                    <p className="font-semibold">It&apos;s a different pressing · moved to {l.actualVersionName}</p>
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
                </p>
                <p className="mt-1 font-semibold underline underline-offset-4">See the checks</p>
              </Link>
              <TrafficLight light={light} />
              {light !== "red" && (
                <div className="flex w-full justify-end">
                  <BuyButton
                    href={checkoutPath(l.id, versionId)}
                    listingLabel={label}
                    warning={light === "yellow" ? yellowWarning(l.checks, l.hasMatrixPhoto, movedHere) : null}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>

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
