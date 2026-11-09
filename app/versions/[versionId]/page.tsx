import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getVersionPageData, type VersionDetails } from "@/lib/db/recommendation";
import { formatPriorities, parsePriorities, PRIORITIES, type Priority } from "@/lib/rules/priorities";
import { fillReason, formatPrice, type PriceFacts } from "@/lib/rules/recommendation";
import { fitOf } from "@/lib/rules/compare";
import { Header } from "@/components/Header";
import { ListingsBeside } from "@/components/ListingsBeside";
import { GlossaryText } from "@/app/albums/[albumId]/recommendation/GlossaryText";

const LABEL = Object.fromEntries(PRIORITIES.map((p) => [p.id, p.label])) as Record<Priority, string>;

const lowestOf = (v: VersionDetails) => (v.activePrices.length ? Math.min(...v.activePrices) : null);
const priceFacts = (v: VersionDetails): PriceFacts => ({
  lowestPrice: lowestOf(v),
  typicalMin: v.typicalMin,
  typicalMax: v.typicalMax,
});

// Version page (story 4), opened from a column of "Compare pressings". Design: docs/design/version-page.html.
// The ranking comes from the address: "?priorities=price,sound".
export default async function VersionPage({
  params,
  searchParams,
}: {
  params: Promise<{ versionId: string }>;
  searchParams: Promise<{ priorities?: string | string[] }>;
}) {
  const { versionId } = await params;
  const { priorities } = await searchParams;
  const data = await getVersionPageData(versionId);
  if (!data) notFound();
  const { album, versions, glossary } = data;
  const version = versions.find((v) => v.id === versionId)!;

  const ranking = parsePriorities(Array.isArray(priorities) ? priorities[0] : priorities);
  if (ranking.length === 0) redirect(`/albums/${album.id}/priorities`);
  const rank = formatPriorities(ranking);

  const lowest = lowestOf(version);
  const count = version.activePrices.length;
  const firstPressing = [...versions].sort((a, b) => a.releaseYear - b.releaseYear)[0];
  const { matches, misses } = fitOf(ranking, version, versions);
  const reasons = ranking
    .map((p, i) => {
      const sentence = version.reasons[p];
      const text = sentence ? fillReason(sentence, { own: priceFacts(version), firstPressing: priceFacts(firstPressing) }) : null;
      return text ? { key: p, rank: i + 1, text } : null;
    })
    .filter((r): r is { key: Priority; rank: number; text: string } => r !== null);

  return (
    <main className="mx-auto max-w-2xl px-4 pb-16 lg:max-w-6xl">
      <Header />
      <Link
        href={`/albums/${album.id}/compare?priorities=${rank}`}
        className="inline-flex items-center gap-3 text-sm font-medium"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-navy/30">
          <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </span>
        Back to compare
      </Link>

      <div className="mt-4 lg:grid lg:grid-cols-[1fr_400px] lg:items-start lg:gap-8">
        <div className="space-y-4">
          <section className="rounded-2xl border border-[#d9ccb2] bg-[#ece3d1] p-5">
            <p className="text-sm text-navy/70">{album.title} · version</p>
            <h1 className="font-heading text-4xl leading-none lg:text-6xl">
              <GlossaryText text={version.name} terms={glossary} />
            </h1>
            <p className="mt-2 text-sm text-navy/70">
              {version.releaseYear} · {version.country} · {version.label} · {version.format}
              {count > 0 && ` · ${count} ${count === 1 ? "listing" : "listings"}`}
            </p>
            {lowest !== null && <p className="mt-3 text-[22px] font-medium">From {formatPrice(lowest)}</p>}
            <ul aria-label="Fit with your priorities" className="mt-3 flex flex-wrap gap-2">
              {matches.map((p) => (
                <li key={p} className="rounded-full border border-navy/30 bg-white/60 px-3.5 py-1 text-[13px] font-medium">
                  Matches: {LABEL[p].toLowerCase()}
                </li>
              ))}
              {misses.map((p) => (
                <li key={p} className="rounded-full border-[1.5px] border-navy px-3.5 py-1 text-[13px] font-medium">
                  Not a match: {LABEL[p].toLowerCase()}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-line bg-[#faf7f1] p-4">
            <h2 className="font-heading text-[22px] leading-tight">How it fits your priorities</h2>
            <ul aria-label="How it fits your priorities" className="mt-2 list-disc space-y-2 pl-5">
              {reasons.map((r) => (
                <li key={r.key}>
                  <strong>
                    {r.rank}. {LABEL[r.key]}:
                  </strong>{" "}
                  <GlossaryText text={r.text} terms={glossary} />
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[13px] text-navy/70">
              Based on {version.ratingCount} collector ratings · Illustrative data
            </p>
          </section>

          <details className="rounded-2xl border border-line bg-[#faf7f1]">
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

          {count > 0 && (
            <div className="lg:hidden">
              <Link
                href={`/versions/${version.id}/listings?priorities=${rank}`}
                className="flex min-h-14 items-center justify-center rounded-full bg-navy px-6 text-lg font-semibold text-cream"
              >
                See verified listings
              </Link>
              <p className="mt-2 text-center text-xs text-navy/70">
                {count} verified {count === 1 ? "listing" : "listings"} · from {formatPrice(lowest!)}
              </p>
            </div>
          )}
        </div>

        {/* Desktop: the listings sit beside the version (story 4 · Scope). */}
        <ListingsBeside
          versionId={version.id}
          ranking={ranking}
          typicalRange={{ min: version.typicalMin, max: version.typicalMax }}
        />
      </div>
    </main>
  );
}
