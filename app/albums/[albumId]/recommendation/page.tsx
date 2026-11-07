import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getRecommendationData, type VersionDetails } from "@/lib/db/recommendation";
import { formatPriorities, parsePriorities, PRIORITIES, type Priority } from "@/lib/rules/priorities";
import { fillReason, formatPrice, recommend, type PriceFacts } from "@/lib/rules/recommendation";
import { Header } from "@/components/Header";
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
      <main className="mx-auto max-w-2xl px-4 pb-16">
        <Header />
        <p className="mt-8 text-lg font-semibold">Nobody is selling this album right now.</p>
        <Link href="/" className="mt-4 inline-block underline">Back to search</Link>
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

  return (
    <main className="mx-auto max-w-2xl px-4 pb-16">
      <Header />
      <div className="flex items-center justify-between">
        <Link
          href={changeHref}
          aria-label="Back to priorities"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-navy/30"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
        <span className="rounded-full border border-navy/30 px-3 py-1 text-xs">Illustrative data</span>
      </div>

      <div className="mt-6 flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={album.coverUrl} alt="" width={96} height={96} className="h-24 w-24 shrink-0 rounded-lg" />
        <p className="text-sm">
          <span className="block font-semibold">{album.title}</span>
          <span className="text-navy/70">{album.artist}, {album.releaseYear}</span>
        </p>
      </div>

      <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-navy/70">Get this one</p>
      <h1 className="font-heading text-4xl leading-tight sm:text-5xl">
        <GlossaryText text={version.name} terms={glossary} />
      </h1>
      <p className="mt-2 text-navy/80">
        {version.releaseYear} · {version.country} · {version.label} · {version.format}
      </p>
      <p className="mt-1 font-semibold">
        {count} for sale · from {formatPrice(lowest)}
      </p>

      {result.matches.length > 0 && (
        <ul aria-label="Matches" className="mt-4 flex flex-wrap gap-2">
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
            <span aria-hidden className="mt-1.5 h-3 w-3 shrink-0 rounded-full border-2 border-navy" />
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

      <div className="mt-8 flex flex-col gap-3">
        {/* Phone: listings open on their own screen (story 5). Desktop: they sit beside this (story 5). */}
        <Link
          href={`/versions/${version.id}/listings`}
          className="flex min-h-14 items-center justify-center rounded-full bg-navy px-6 text-lg font-semibold text-cream lg:hidden"
        >
          See verified listings
        </Link>
        <p className="flex flex-wrap items-center justify-center gap-x-2 text-sm">
          <span>Your priorities: {ranking.map((p, i) => `${i + 1}. ${LABEL[p]}`).join(" · ")}</span>
          <Link href={changeHref} className="inline-flex min-h-12 items-center font-semibold underline">
            Change
          </Link>
        </p>
      </div>
    </main>
  );
}
