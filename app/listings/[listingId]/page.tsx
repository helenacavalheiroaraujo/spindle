import Link from "next/link";
import { notFound } from "next/navigation";
import { getListingCheck } from "@/lib/db/listings";
import { checklist, checkSummary, type CheckMark } from "@/lib/rules/listingCheck";
import { listingsForVersion } from "@/lib/rules/listingOrder";
import { formatPriorities, parsePriorities } from "@/lib/rules/priorities";
import { formatPrice } from "@/lib/rules/recommendation";
import { yellowWarning } from "@/lib/rules/yellowWarning";
import { Header } from "@/components/Header";
import { TrafficLight } from "@/components/TrafficLight";
import { BuyButton } from "@/components/BuyButton";
import { checkoutPath, isOwnListing } from "@/lib/rules/checkoutAccess";
import { currentProfileId } from "@/lib/db/profiles";
import { YourListing } from "@/components/YourListing";
import { sellerText } from "@/lib/rules/seller";
import { SellerLine } from "@/components/SellerLine";

const one = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v);

const MARK: Record<CheckMark, { symbol: string; word: string; className: string }> = {
  match: { symbol: "✓", word: "Matches", className: "bg-green-600 text-white" },
  uncertain: { symbol: "?", word: "Uncertain", className: "bg-amber-400 text-navy" },
  pending: { symbol: "?", word: "Check pending", className: "bg-amber-400 text-navy" },
  no_match: { symbol: "✗", word: "Doesn't match", className: "bg-red-600 text-white" },
};

// Listing check screen, "Is it really this one?" (story 5). The version in the address says where the
// buyer came from: the same listing is red under its claimed version and yellow under its actual one.
export default async function ListingCheckPage({
  params,
  searchParams,
}: {
  params: Promise<{ listingId: string }>;
  searchParams: Promise<{ version?: string | string[]; priorities?: string | string[]; from?: string | string[] }>;
}) {
  const { listingId } = await params;
  const query = await searchParams;
  const [l, viewerId] = await Promise.all([getListingCheck(listingId), currentProfileId()]);
  if (!l) notFound();

  const versionId = one(query.version) ?? l.claimedVersionId;
  const row = listingsForVersion([l], versionId)[0];
  if (!row) notFound(); // not on sale, or not shown under that version
  const { light, movedHere } = row;

  const rows = checklist(l.checks, l.hasMatrixPhoto, movedHere);
  const summary = checkSummary(light, rows, movedHere, row.movedToVersionId ? l.actualVersionName : null);
  const versionName = versionId === l.actualVersionId ? l.actualVersionName : l.claimedVersionName;
  const ranking = parsePriorities(one(query.priorities));
  const prioritiesQuery = ranking.length ? `?priorities=${formatPriorities(ranking)}` : "";
  // Opened beside the recommendation (desktop) → back there; opened from the phone list → back to the list.
  const fromRecommendation = one(query.from) === "recommendation";
  const backHref = fromRecommendation
    ? ranking.length
      ? `/albums/${l.albumId}/recommendation${prioritiesQuery}`
      : `/albums/${l.albumId}/priorities`
    : `/versions/${versionId}/listings${prioritiesQuery}`;
  const label = `${formatPrice(l.price)}, ${l.condition.name}, ${sellerText(l.seller)}`;

  return (
    <main className="mx-auto max-w-2xl px-4 pb-16">
      <Header />
      <div className="flex items-center gap-3">
        <Link
          href={backHref}
          aria-label={fromRecommendation ? "Back to the recommendation" : "Back to the listings"}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-navy/30"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
        <p className="text-sm">
          <span className="block font-semibold">{versionName}</span>
          <span className="text-navy/70">{l.albumTitle}, {l.artist}</span>
        </p>
      </div>

      <h1 className="mt-6 font-heading text-4xl leading-tight">Is it really this one?</h1>

      <section aria-label="Result" className="mt-4 flex items-center gap-3 rounded-2xl border border-line bg-white/60 p-4">
        <TrafficLight light={light} />
        <p className="font-semibold">{summary}</p>
      </section>

      <section aria-labelledby="checklist" className="mt-6">
        <h2 id="checklist" className="font-heading text-2xl">Checklist</h2>
        <ul aria-label="Checklist" className="mt-2">
          {rows.map((r) => {
            const m = MARK[r.mark];
            return (
              <li key={r.item} className="flex items-center gap-3 border-b border-line py-3">
                <span aria-hidden className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold ${m.className}`}>
                  {m.symbol}
                </span>
                <span className="flex-1">{r.label}</span>
                <span className="text-sm text-navy/70">{r.note ?? m.word}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="photos" className="mt-6">
        <h2 id="photos" className="font-heading text-2xl">The seller&apos;s photos</h2>
        <ul className="mt-2 grid grid-cols-3 gap-3">
          {(["cover", "record", "matrix"] as const).map((kind) => {
            const src = l.photos[kind];
            return (
              <li key={kind} className="text-center text-xs">
                {src ? (
                  <img src={src} alt={`${kind} photo`} className="aspect-square w-full rounded-xl border border-line object-cover" />
                ) : (
                  <span className="flex aspect-square w-full items-center justify-center rounded-xl border border-dashed border-navy/30 p-2 text-navy/70">
                    No {kind} photo
                  </span>
                )}
                <span className="mt-1 block capitalize">{kind}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="condition" className="mt-6 rounded-2xl border border-line bg-sand p-4 text-navy">
        <h2 id="condition" className="text-sm text-navy/70">Condition</h2>
        <p className="mt-1 text-lg font-semibold">
          {l.condition.code} means {l.condition.name.toLowerCase()}, with {l.condition.explanation.toLowerCase()}
        </p>
      </section>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p>
          <span className="block text-2xl font-bold">{formatPrice(l.price)}</span>
          <span className="text-sm text-navy/70">
            <SellerLine seller={l.seller} city={l.city} />
          </span>
        </p>
        {light === "red" ? (
          <p className="font-semibold">Not for sale here</p>
        ) : isOwnListing(l.sellerId, viewerId) ? (
          <YourListing />
        ) : (
          <BuyButton
            text="Buy with protection"
            href={checkoutPath(l.id, versionId)}
            listingLabel={label}
            warning={light === "yellow" ? yellowWarning(l.checks, l.hasMatrixPhoto, movedHere) : null}
          />
        )}
      </div>

      <p className="mt-6 text-sm text-navy/70">Check results and photos are illustrative data</p>
    </main>
  );
}
