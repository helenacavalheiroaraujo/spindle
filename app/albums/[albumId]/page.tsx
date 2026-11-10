import { notFound, redirect } from "next/navigation";
import { listAlbumSummaries } from "@/lib/db/albums";
import { Header } from "@/components/Header";

// Album with no listings (bug 17, DECISIONS 2026-11-10): the genre screen opens it. It says nobody is selling it.
// An album that opens goes to its priorities screen; one not in the demo has no page.
export default async function AlbumNoListingsPage({ params }: { params: Promise<{ albumId: string }> }) {
  const { albumId } = await params;
  const album = (await listAlbumSummaries()).find((a) => a.id === albumId);
  if (!album) notFound();
  if (album.access === "open") redirect(`/albums/${album.id}/priorities`);
  if (album.access !== "no_listings") notFound();

  return (
    <main className="px-4 pb-16 page-main page-narrow">
      <Header />
      <div className="lg:grid lg:grid-cols-[340px_1fr] lg:gap-12">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={album.coverUrl} alt="" width={340} height={340} className="h-auto w-full rounded-2xl" />
        <div>
          <h1 className="mt-6 font-heading text-4xl leading-tight lg:mt-0">{album.title}</h1>
          <p className="mt-1 text-navy/70">
            {album.artist}, {album.releaseYear}
          </p>
          <section role="status" className="mt-6 rounded-2xl border border-line bg-sand p-5 text-navy">
            <h2 className="font-heading text-2xl">Nobody is selling this album right now</h2>
            <p className="mt-2 text-navy/80">Check back later, or browse other albums in this genre.</p>
          </section>
          <p className="mt-6 text-sm text-navy/70">Illustrative data</p>
        </div>
      </div>
    </main>
  );
}
