import { notFound, redirect } from "next/navigation";
import { getAlbumHeader } from "@/lib/db/albums";
import { getSavedRanking } from "@/lib/db/preferences";
import { currentUserId } from "@/lib/db/session";
import { formatPriorities, parsePriorities, type Priority } from "@/lib/rules/priorities";
import { Header } from "@/components/Header";
import { PriorityPicker } from "./PriorityPicker";

// Priorities screen (story 2). "?priorities=price,sound" refills the current ranking ("Change" from story 3).
// Phase 2: a signed-in buyer with a saved ranking skips this screen, unless they came from "Change".
export default async function PrioritiesPage({
  params,
  searchParams,
}: {
  params: Promise<{ albumId: string }>;
  searchParams: Promise<{ priorities?: string | string[] }>;
}) {
  const { albumId } = await params;
  const { priorities } = await searchParams;
  const album = await getAlbumHeader(albumId);
  if (!album) notFound();
  const fromAddress = parsePriorities(Array.isArray(priorities) ? priorities[0] : priorities);

  if (fromAddress.length === 0) {
    const saved = await savedRankingOfViewer();
    if (saved) redirect(`/albums/${album.id}/recommendation?priorities=${formatPriorities(saved)}`);
  }

  return (
    <main className="px-4 pb-16 page-main">
      <Header />
      <div className="lg:mt-8 lg:grid lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-x-12">
      <div>
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={album.coverUrl} alt="" width={48} height={48} className="h-12 w-12 shrink-0 rounded-md lg:hidden" />
        <p className="min-w-0">
          <span className="block truncate font-semibold">{album.title}</span>
          <span className="block text-sm text-navy/70">
            {album.artist} · {album.versionCount} {album.versionCount === 1 ? "version" : "versions"} to choose from
          </span>
        </p>
      </div>

      {/* Desktop (UX #5): the cover on the left, the options on the right, as in the design. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={album.coverUrl} alt="" width={288} height={288} className="mt-6 hidden aspect-square w-full rounded-2xl lg:block" />
      </div>
      <div>
      <h1 className="mt-8 lg:mt-3 font-heading text-4xl leading-tight sm:text-5xl">What matters most to you?</h1>
      <p className="mt-2">Pick one or more, in order. We&apos;ll handle the rest.</p>

      <PriorityPicker
        albumId={album.id}
        initial={fromAddress}
      />
      </div>
      </div>
    </main>
  );
}

// The signed-in buyer's saved ranking, or null. If it cannot be loaded, the screen is shown as for a new buyer.
async function savedRankingOfViewer(): Promise<Priority[] | null> {
  try {
    const userId = await currentUserId();
    return userId ? await getSavedRanking(userId) : null;
  } catch (error) {
    console.error(error);
    return null;
  }
}
