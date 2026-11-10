import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getRecommendationData, type VersionDetails } from "@/lib/db/recommendation";
import { formatPriorities, parsePriorities, PRIORITIES, type Priority } from "@/lib/rules/priorities";
import { fillReason, formatPrice, recommend, type PriceFacts } from "@/lib/rules/recommendation";
import { compareColumns } from "@/lib/rules/compare";
import { Header } from "@/components/Header";
import { ListingsBeside } from "@/components/ListingsBeside";
import { GlossaryText } from "./GlossaryText";

const LABEL = Object.fromEntries(PRIORITIES.map((p) => [p.id, p.label])) as Record<Priority, string>;

const lowestOf = (v: VersionDetails) => (v.activePrices.length ? Math.min(...v.activePrices) : null);
const priceFacts = (v: VersionDetails): PriceFacts => ({
  lowestPrice: lowestOf(v),
  typicalMin: v.typicalMin,
  typicalMax: v.typicalMax,
});

// Recommendation screen (story 3). The ranking comes from the address: "?priorities=price,sound".
export default async function RecommendationPage({
  params,
  searchParams,
}: {
  params: Promise<{ albumId: string }>;
  searchParams: Promise<{ priorities?: string | string[] }>;
}) {
  const { albumId } = await params;
  const { priorities } = await searchParams;
  const ranking = parsePriorities(Array.isArray(priorities) ? priorities[0] : priorities);
  const changeHref = `/albums/${albumId}/priorities${ranking.length ? `?priorities=${formatPriorities(ranking)}` : ""}`;
  if (ranking.length === 0) redirect(changeHref);

  const data = await getRecommendationData(albumId);
  if (!data) notFound();
  const { album, versions, glossary } = data;
  const byId = (id: string) => versions.find((v) => v.id === id)!;

  const result = recommend(ranking, versions);
  if (!result) {
    // Story 1 stops the buyer before this screen; this covers an old link.
    return (
      <main className="px-4 pb-16 page-main page-narrow">
        <Header />
        <p className="mt-8 text-lg font-semibold">Nobody is selling this album right now.</p>
        <Link href="/search" className="mt-4 inline-block underline">Back to search</Link>
      </main>
    );
  }

  const version = byId(result.recommendedId);
  const lowest = lowestOf(version)!;
  const firstPressing = [...versions].sort((a, b) => a.releaseYear - b.releaseYear)[0];
  const reasons = result.reasons
    .map((p) => {
      const sentence = version.reasons[p];
      return sentence ? fillReason(sentence, { own: priceFacts(version), firstPressing: priceFacts(firstPressing) }) : null;
    })
    .filter((s): s is string => s !== null);
  const alternative = result.alternative && byId(result.alternative.versionId);
  const ideal = result.idealUnavailableId && byId(result.idealUnavailableId);
  const count = version.activePrices.length;
  const compareHref = `/albums/${albumId}/compare?priorities=${formatPriorities(ranking)}`;
  const canCompare = compareColumns(ranking, versions, 3).length >= 2; // story 4: at least two versions on sale

  return (
    <main className="px-4 pb-16 page-main">
      <Header />
      {/* Desktop (design option C): a large cover anchors the left; the whole decision reads down the right. */}
      <div className="lg:grid lg:grid-cols-[25rem_minmax(0,1fr)] lg:gap-14">
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="flex justify-end lg:justify-start">
            <span className="rounded-full border border-navy/30 px-3 py-1 text-xs">Illustrative data</span>
          </div>

          <div className="mt-6 flex items-center gap-4 lg:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={album.coverUrl}
              alt=""
              width={400}
              height={400}
              className="h-24 w-24 shrink-0 rounded-lg lg:h-auto lg:w-full lg:rounded-2xl"
            />
            <p className="text-sm lg:mt-4">
              <span className="block font-semibold lg:font-heading lg:text-3xl lg:leading-tight">{album.title}</span>
              <span className="text-navy/70 lg:text-base">{album.artist}, {album.releaseYear}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:max-w-[40rem]">
          <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-navy/70 lg:mt-0">Get this one</p>
          <h1 className="font-heading text-4xl leading-tight sm:text-5xl">
            <GlossaryText text={version.name} terms={glossary} />
          </h1>
          <p className="mt-2 text-navy/80">
            {version.releaseYear} · {version.country} · {version.label} · {version.format}
          </p>
          <p className="mt-1 font-semibold lg:hidden">
            {count} for sale · from {formatPrice(lowest)}
          </p>

          {result.matches.length > 0 && (
            <ul aria-label="Matches" className="mt-4 flex flex-wrap gap-2 lg:hidden">
              {result.matches.map((p) => (
                <li key={p} className="rounded-full bg-navy/10 px-3 py-1 text-sm font-medium">
                  Matches: {LABEL[p].toLowerCase()}
                </li>
              ))}
            </ul>
          )}

          <ul aria-label="Why this one" className="mt-5 space-y-3">
            {reasons.map((sentence) => (
              <li key={sentence} className="flex gap-3">
                {/* Phone: an open circle as before. Desktop (design option A): a tick, so the reasons do not look like tasks. */}
                <span
                  aria-hidden
                  className="mt-1.5 h-3 w-3 shrink-0 rounded-full border-2 border-navy lg:mt-0.5 lg:flex lg:h-[22px] lg:w-[22px] lg:items-center lg:justify-center lg:border-0 lg:bg-navy lg:text-cream"
                >
                  <svg viewBox="0 0 24 24" className="hidden h-3.5 w-3.5 lg:block" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="m5 12 5 5 9-10" />
                  </svg>
                </span>
                <span><GlossaryText text={sentence} terms={glossary} /></span>
              </li>
            ))}
          </ul>

          <p className="mt-5 text-sm text-navy/70">
            Based on {version.ratingCount} collector ratings · Illustrative data
          </p>

          {alternative && (
            <p className="mt-4 text-sm">
              {result.alternative!.label}:{" "}
              <GlossaryText text={alternative.name} terms={glossary} />, {formatPrice(lowestOf(alternative)!)}
            </p>
          )}

          {ideal && (
            <p role="note" className="mt-4 rounded-2xl border border-line bg-white/50 p-4 text-sm">
              <GlossaryText
                text={`The ideal pressing for your priorities is the ${ideal.name}, but nobody is selling it right now.`}
                terms={glossary}
              />
            </p>
          )}

          {/* Desktop: "Based on … Change" sits under the reasons, before the listings. */}
          {basedOn()}

          {/* Desktop: the listings, the fair price and Compare pressings continue the same column (story 3 · Scope, finding #21). */}
          <div className="lg:mt-8">
            <ListingsBeside
              versionId={version.id}
              ranking={ranking}
              typicalRange={{ min: version.typicalMin, max: version.typicalMax }}
              compareHref={canCompare ? compareHref : null}
              priceBar
            />
          </div>

          {version.tracks.length > 0 && (
          <details className="mt-6 rounded-2xl border border-line">
            <summary className="flex min-h-12 cursor-pointer items-center px-4 font-semibold">
              Track list ({version.tracks.length})
            </summary>
            <ol className="px-4 pb-4">
              {version.tracks.map((t) => (
                <li key={t.position} className="flex items-center gap-3 border-t border-line py-2 text-sm">
                  <span className="w-8 text-navy/60">{t.position}</span>
                  <span className="flex-1">{t.title}</span>
                  {t.isExtra && <span className="rounded-full bg-brown px-2 py-0.5 text-xs text-cream">Bonus</span>}
                </li>
              ))}
            </ol>
          </details>
          )}

          <div className="mt-8 flex flex-col gap-3">
            {/* Phone: listings open on their own screen (story 5). Desktop: they sit beside this (story 5). */}
            <Link
              href={`/versions/${version.id}/listings?priorities=${formatPriorities(ranking)}`}
              className="flex min-h-14 items-center justify-center rounded-full bg-navy px-6 text-lg font-semibold text-cream lg:hidden"
            >
              See verified listings
            </Link>
            {/* Story 4: only when at least two versions are on sale. */}
            {canCompare && (
              <Link
                href={compareHref}
                className="flex min-h-14 items-center justify-center rounded-full border border-navy px-6 text-lg font-semibold lg:hidden"
              >
                Compare pressings
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );

  // The ranking in use and the way to change it. One element: under the reasons on desktop, last on phone (CSS order).
  function basedOn() {
    return (
      <p className="order-last mt-4 flex flex-wrap items-center justify-center gap-x-2 text-sm lg:order-none lg:justify-start">
        <span>Based on: {ranking.map((p) => LABEL[p]).join(", ")}</span>
        <span aria-hidden>·</span>
        <Link href={changeHref} className="inline-flex min-h-12 items-center font-semibold underline">
          Change
        </Link>
      </p>
    );
  }
}
