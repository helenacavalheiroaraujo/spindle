import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getRecommendationData, type VersionDetails } from "@/lib/db/recommendation";
import { formatPriorities, parsePriorities, PRIORITIES, type Priority } from "@/lib/rules/priorities";
import {
  compareColumns,
  compareRows,
  conditionName,
  firstPressingId,
  soundWord,
  typicalRangeText,
  type CompareRowId,
} from "@/lib/rules/compare";
import { Header } from "@/components/Header";

const LABEL = Object.fromEntries(PRIORITIES.map((p) => [p.id, p.label])) as Record<Priority, string>;

const ROW_LABEL: Record<CompareRowId, string> = {
  price: "Typical price",
  sound: "Sound",
  firstPressing: "First pressing",
  condition: "Best condition on sale",
  forSale: "For sale",
};

// Table width per number of versions shown on desktop (Tailwind needs the class names written out).
const THIRD = "hidden lg:table-cell";

// Compare pressings (story 4), design: docs/design/compare-desktop.html.
// The ranking comes from the address, like the recommendation: "?priorities=price,sound".
export default async function ComparePage({
  params,
  searchParams,
}: {
  params: Promise<{ albumId: string }>;
  searchParams: Promise<{ priorities?: string | string[] }>;
}) {
  const { albumId } = await params;
  const { priorities } = await searchParams;
  const ranking = parsePriorities(Array.isArray(priorities) ? priorities[0] : priorities);
  if (ranking.length === 0) redirect(`/albums/${albumId}/priorities`);

  const data = await getRecommendationData(albumId);
  if (!data) notFound();
  const { album, versions } = data;

  const rank = formatPriorities(ranking);
  const backHref = `/albums/${albumId}/recommendation?priorities=${rank}`;
  // Up to 3 versions: the third is hidden on a phone (2 there).
  const ids = compareColumns(ranking, versions, 3);
  if (ids.length < 2) redirect(backHref); // nothing to compare: "Compare pressings" is not shown either
  const columns = ids.map((id) => versions.find((v) => v.id === id)!);
  const firstId = firstPressingId(versions);
  const rows = compareRows(ranking);

  return (
    <main className="mx-auto max-w-2xl px-4 pb-16 lg:max-w-6xl">
      <Header />
      <Link href={backHref} className="inline-flex items-center gap-3 text-sm font-medium">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-navy/30">
          <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </span>
        Your recommendation
      </Link>

      <section className="mt-4 flex items-center gap-4 rounded-2xl border border-[#d9ccb2] bg-[#ece3d1] p-4 lg:gap-7 lg:px-7 lg:py-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={album.coverUrl} alt="" width={120} height={120} className="h-[84px] w-[84px] shrink-0 rounded-lg border border-[#d9ccb2] lg:h-[120px] lg:w-[120px]" />
        <div>
          <p className="text-sm text-navy/70">{album.artist} · {album.title}</p>
          <h1 className="font-heading text-4xl leading-none lg:text-6xl">Compare pressings</h1>
          <ul aria-label="Your priorities" className="mt-3 flex flex-wrap gap-2">
            {ranking.map((p, i) => (
              <li key={p} className="rounded-full border border-navy/30 bg-white/60 px-3 py-1 text-sm font-medium">
                {i + 1} · {LABEL[p]}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="mt-6 overflow-hidden rounded-[18px] border border-line bg-[#faf7f1]">
        <table className="w-full table-fixed border-collapse text-left">
          <caption className="sr-only">Compare pressings of {album.title}</caption>
          <colgroup>
            <col className="w-[84px] lg:w-[180px]" />
          </colgroup>
          <thead>
            <tr>
              <td />
              {columns.map((v, i) => (
                <VersionHead key={v.id} version={v} recommended={i === 0} href={`/versions/${v.id}?priorities=${rank}`} className={i === 2 ? THIRD : ""} />
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => {
              const last = ri === rows.length - 1;
              const chosen = row.rank !== null;
              return (
                <tr key={row.id} className="border-t border-line">
                  <th
                    scope="row"
                    className={`px-2 py-3.5 align-middle text-[13px] font-medium lg:px-5 lg:py-[18px] lg:text-sm ${
                      chosen ? "bg-sand shadow-[inset_4px_0_0_#1d2433]" : ""
                    }`}
                  >
                    <span className="flex flex-col gap-1.5 lg:flex-row lg:flex-wrap lg:items-center lg:gap-2.5">
                      <RowIcon id={row.id} />
                      <span>{ROW_LABEL[row.id]}</span>
                      {row.rank !== null && (
                        <span className="self-start whitespace-nowrap rounded-full border border-navy/40 bg-white/60 px-2 py-px text-[11px] font-medium">
                          Your #{row.rank}
                        </span>
                      )}
                    </span>
                  </th>
                  {columns.map((v, i) => (
                    <td
                      key={v.id}
                      className={`px-2 py-3.5 align-middle lg:px-[22px] lg:py-[18px] ${i === 2 ? THIRD : ""} ${
                        chosen ? "bg-sand" : ""
                      } ${i === 0 ? `bg-[#fdfbf7] ${chosen ? "!bg-[#f7ecd6]" : ""} ${frame(last)}` : ""}`}
                    >
                      <Value row={row.id} version={v} isFirstPressing={v.id === firstId} />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-center text-xs text-navy/70">
        Typical prices are illustrative data · Tap a version to see its details and verified listings
      </p>
    </main>
  );
}

// Navy frame around the recommended column, all the way down (a shape, not only a colour).
const frame = (last: boolean) =>
  last
    ? "shadow-[inset_2px_0_0_#1d2433,inset_-2px_0_0_#1d2433,inset_0_-2px_0_#1d2433]"
    : "shadow-[inset_2px_0_0_#1d2433,inset_-2px_0_0_#1d2433]";

function VersionHead({
  version,
  recommended,
  href,
  className,
}: {
  version: VersionDetails;
  recommended: boolean;
  href: string;
  className: string;
}) {
  return (
    <th scope="col" className={`p-0 align-top font-normal ${className} ${recommended ? `bg-[#fdfbf7] ${frameTop}` : ""}`}>
      <Link href={href} className="block pb-3.5 lg:pb-[22px]">
        <span
          className={`block min-h-7 whitespace-nowrap px-2 py-1.5 text-[11px] font-medium tracking-wide lg:min-h-[34px] lg:px-[22px] lg:py-2 lg:text-xs ${
            recommended ? "bg-navy text-cream" : "bg-[#e2dacb]"
          }`}
        >
          {recommended ? "★ Recommended" : "Next best"}
        </span>
        <span className="block px-2 pt-3 lg:px-[22px] lg:pt-[18px]">
          <span className="block font-heading text-[34px] leading-none lg:text-[52px]">{version.releaseYear}</span>
          <span className="mt-1 block text-xs text-navy/70 lg:text-[13px]">
            {version.country} · {version.label} · {version.format}
          </span>
          <span className="mt-2.5 inline-flex min-h-6 items-center gap-1 border-b-[1.5px] border-navy text-[13px] font-medium">
            <span className="lg:hidden">See version</span>
            <span className="hidden lg:inline">See this version</span>
            <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m9 6 6 6-6 6" />
            </svg>
          </span>
          <span className="sr-only"> {version.name}</span>
        </span>
      </Link>
    </th>
  );
}
const frameTop = "shadow-[inset_2px_0_0_#1d2433,inset_-2px_0_0_#1d2433]";

function Value({ row, version, isFirstPressing }: { row: CompareRowId; version: VersionDetails; isFirstPressing: boolean }) {
  switch (row) {
    case "price": {
      const range = typicalRangeText(version.typicalMin, version.typicalMax);
      return range ? (
        <span className="font-heading text-[26px] leading-none lg:text-[40px]">{range}</span>
      ) : (
        <span className="text-sm font-medium">Not known yet</span>
      );
    }
    case "sound":
      return <span className="font-medium lg:text-[17px]">{soundWord(version.soundScore)}</span>;
    case "firstPressing":
      return (
        <span className="inline-flex items-center gap-1.5 font-medium lg:text-[17px]">
          <span
            aria-hidden
            className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-navy ${
              isFirstPressing ? "bg-navy text-cream" : ""
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="3">
              <path d={isFirstPressing ? "m5 12 5 5 9-10" : "m6 6 12 12M18 6 6 18"} />
            </svg>
          </span>
          {isFirstPressing ? "Yes" : "No"}
        </span>
      );
    case "condition":
      return <span className="font-medium lg:text-[17px]">{conditionName(version.activeConditions)}</span>;
    case "forSale":
      return <span className="font-medium lg:text-[17px]">{version.activePrices.length}</span>;
  }
}

const ICON: Record<CompareRowId, React.ReactNode> = {
  price: (
    <>
      <path d="M3 12V4h8l10 10-8 8z" />
      <circle cx="7.5" cy="8.5" r="1.2" />
    </>
  ),
  sound: <path d="M3 12h2M7 7v10M11 4v16M15 8v8M19 10v4" />,
  firstPressing: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M10 9.5 12 8v8" />
    </>
  ),
  condition: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  forSale: (
    <>
      <rect x="4" y="4" width="16" height="5" rx="1.5" />
      <rect x="4" y="11" width="16" height="5" rx="1.5" />
      <path d="M4 19h16" />
    </>
  ),
};

function RowIcon({ id }: { id: CompareRowId }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
      {ICON[id]}
    </svg>
  );
}
