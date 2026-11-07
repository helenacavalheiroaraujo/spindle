import Link from "next/link";
import { notFound } from "next/navigation";
import { getVersionListings } from "@/lib/db/listings";
import { allRed, listingsForVersion } from "@/lib/rules/listingOrder";
import { parsePriorities, formatPriorities } from "@/lib/rules/priorities";
import { formatPrice } from "@/lib/rules/recommendation";
import { yellowWarning } from "@/lib/rules/yellowWarning";
import { Header } from "@/components/Header";
import { LightLegend, TrafficLight } from "@/components/TrafficLight";
import { BuyButton } from "./BuyButton";

// Verified listings for one version (story 5): its own screen on phone, opened with "See verified listings".
export default async function ListingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ versionId: string }>;
  searchParams: Promise<{ priorities?: string | string[] }>;
}) {
  const { versionId } = await params;
  const { priorities } = await searchParams;
  const data = await getVersionListings(versionId);
  if (!data) notFound();
  const { version, listings } = data;

  const ranking = parsePriorities(Array.isArray(priorities) ? priorities[0] : priorities);
  const backHref = ranking.length
    ? `/albums/${version.albumId}/recommendation?priorities=${formatPriorities(ranking)}`
    : `/albums/${version.albumId}/priorities`;

  const rows = listingsForVersion(listings, version.id);
  const forSale = rows.filter((r) => r.light !== "red").length;
  const moved = rows.length - forSale;

  return (
    <main className="mx-auto max-w-2xl px-4 pb-16">
      <Header />
      <div className="flex items-center gap-3">
        <Link
          href={backHref}
          aria-label="Back to the recommendation"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-navy/30"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
        <p className="text-sm">
          <span className="block font-semibold">{version.name}</span>
          <span className="text-navy/70">{version.albumTitle}, {version.artist}</span>
        </p>
      </div>

      <h1 className="mt-6 font-heading text-4xl leading-tight">
        {forSale} for sale{moved > 0 && ` · ${moved} moved`}
      </h1>
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
          const label = `${formatPrice(l.price)}, ${l.condition.name}, ${l.sellerName}`;
          return (
            <li key={l.id} aria-label={label} className="flex flex-wrap items-start gap-x-4 gap-y-3 border-b border-line py-4">
              <span aria-hidden className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy">
                <span className="h-3 w-3 rounded-full bg-cream" />
              </span>
              <Link
                href={`/listings/${l.id}?version=${version.id}${ranking.length ? `&priorities=${formatPriorities(ranking)}` : ""}`}
                aria-label={`Open ${label}`}
                className="min-w-0 flex-1 rounded-lg text-sm"
              >
                {light === "red" ? (
                  <>
                    <p className="font-semibold">It&apos;s a different pressing · moved to {l.actualVersionName}</p>
                    <p className="text-navy/70">Not for sale here</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-bold">{formatPrice(l.price)}</p>
                    {movedHere && <p className="font-semibold">Moved here · check pending</p>}
                  </>
                )}
                <p>
                  {l.condition.name} ({l.condition.code}): {l.condition.explanation.toLowerCase()}
                </p>
                <p className="text-navy/70">
                  {l.sellerName}
                  {l.city && `, ${l.city}`}
                </p>
                <p className="mt-1 font-semibold underline underline-offset-4">See the checks</p>
              </Link>
              <TrafficLight light={light} />
              {light !== "red" && (
                <div className="flex w-full justify-end">
                  <BuyButton
                    listingLabel={label}
                    warning={light === "yellow" ? yellowWarning(l.checks, l.hasMatrixPhoto, movedHere) : null}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <p className="mt-6 text-sm text-navy/70">Check results are illustrative data</p>
    </main>
  );
}
