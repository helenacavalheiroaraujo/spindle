import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { getAlbumVersions } from "@/lib/db/albums";
import { currentUserId } from "@/lib/db/session";
import { withReturn } from "@/lib/rules/login";
import { VersionPicker } from "./VersionPicker";

// List of versions to pick from (story 8 · use case 1, finding #72, option B): every version of the album,
// even when nobody is selling it; the seller chooses one, then "Continue".
export default async function SellVersionsPage({ params }: { params: Promise<{ albumId: string }> }) {
  const { albumId } = await params;
  if (!(await currentUserId())) redirect(withReturn("/login", `/sell/albums/${albumId}`));
  const album = await getAlbumVersions(albumId);
  if (!album) notFound();

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16">
      <Header />
      <Link href="/sell" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold">
        <span aria-hidden>←</span> Back to search
      </Link>
      <div className="mt-3 flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={album.coverUrl} alt="" width={56} height={56} className="h-14 w-14 shrink-0 rounded-md" />
        <p className="min-w-0">
          <span className="block font-semibold leading-snug">{album.title}</span>
          <span className="block text-sm text-navy/70">
            {album.artist} · {album.versionCount} {album.versionCount === 1 ? "version" : "versions"}
          </span>
        </p>
      </div>
      <h1 className="mt-6 font-heading text-4xl leading-tight lg:text-5xl">Which one do you have?</h1>
      <p className="mt-1 text-sm text-navy/70">Check the year and label on the back cover or on the record.</p>
      <VersionPicker versions={album.versions} />
    </main>
  );
}
