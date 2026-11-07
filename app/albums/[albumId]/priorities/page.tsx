import Link from "next/link";
import { notFound } from "next/navigation";
import { getAlbumHeader } from "@/lib/db/albums";
import { parsePriorities } from "@/lib/rules/priorities";
import { Header } from "@/components/Header";
import { PriorityPicker } from "./PriorityPicker";

// Priorities screen (story 2). "?priorities=price,sound" refills the current ranking ("Change" from story 3).
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

  return (
    <main className="mx-auto max-w-2xl px-4 pb-16">
      <Header />
      <div className="flex items-center gap-3">
        <Link
          href="/"
          aria-label="Back to search"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-navy/30"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={album.coverUrl} alt="" width={48} height={48} className="h-12 w-12 shrink-0 rounded-md" />
        <p className="min-w-0">
          <span className="block truncate font-semibold">{album.title}</span>
          <span className="block text-sm text-navy/70">
            {album.artist} · {album.versionCount} {album.versionCount === 1 ? "version" : "versions"} to choose from
          </span>
        </p>
      </div>

      <h1 className="mt-8 font-heading text-4xl leading-tight sm:text-5xl">What matters most to you?</h1>
      <p className="mt-2">Pick one or more, in order. We&apos;ll handle the rest.</p>

      <PriorityPicker
        albumId={album.id}
        initial={parsePriorities(Array.isArray(priorities) ? priorities[0] : priorities)}
      />
    </main>
  );
}
