import { notFound, redirect } from "next/navigation";
import { listAlbumSummaries } from "@/lib/db/albums";
import { loadAlbumDetails } from "@/lib/external/albumDetails";
import { catalogueNotice, musicianNotice, sourcesLine } from "@/lib/rules/albumDetails";
import { Header } from "@/components/Header";

// Album with no listings (bug 17, DECISIONS 2026-11-10): the genre screen opens it. It says nobody is selling it.
// Also shows the musician, release date, label and tracks (DECISIONS 2026-11-10, album page), from MusicBrainz and Wikipedia.
// An album that opens goes to its priorities screen; one not in the demo has no page.
//
// Layout (bug 20, owner's request 2026-11-11): on desktop the cover, the release facts and the track list sit on the left;
// the title, the status and the musician's text sit on the right. On phone it is one column in this order: cover, title,
// status, facts, musician, source, track list. The two groups are "contents" on phone and columns on desktop; the `order`
// classes keep the phone order.
export default async function AlbumNoListingsPage({ params }: { params: Promise<{ albumId: string }> }) {
  const { albumId } = await params;
  const album = (await listAlbumSummaries()).find((a) => a.id === albumId);
  if (!album) notFound();
  if (album.access === "open") redirect(`/albums/${album.id}/priorities`);
  if (album.access !== "no_listings") notFound();

  const details = await loadAlbumDetails(album.title, album.artist).catch(() => null);
  const hasDetails =
    details !== null &&
    (details.releaseDate !== null || details.label !== null || details.tracks.length > 0 || details.musician !== null);
  const catalogueMissing = details && catalogueNotice(details.catalogueStatus);
  const musicianMissing = details && musicianNotice(details.musicianStatus);
  const sources = details && sourcesLine(details.catalogueStatus, details.musicianStatus);

  return (
    <main className="px-4 pb-16 page-main">
      <Header />
      <div className="flex flex-col lg:mt-8 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start lg:gap-x-12">
        <div className="contents lg:flex lg:flex-col lg:gap-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={album.coverUrl} alt="" width={340} height={340} className="order-1 h-auto w-full rounded-2xl" />
          {hasDetails && (details.releaseDate || details.label) && (
            <dl className="order-4 mt-6 divide-y divide-line rounded-2xl border border-line bg-sand px-5 lg:mt-0">
              {details.releaseDate && (
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-navy/70">Released</dt>
                  <dd className="font-semibold">{details.releaseDate}</dd>
                </div>
              )}
              {details.label && (
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-navy/70">Label</dt>
                  <dd className="font-semibold">{details.label}</dd>
                </div>
              )}
            </dl>
          )}
          {hasDetails && catalogueMissing && <p className="order-4 mt-6 text-sm text-navy/70 lg:mt-0">{catalogueMissing}</p>}

          {hasDetails && details.tracks.length > 0 && (
            <div className="order-6 mt-8 lg:mt-0">
              <section>
                <h2 className="font-heading text-2xl">Track list</h2>
                <ol className="mt-2 divide-y divide-line rounded-2xl border border-line bg-sand px-5">
                  {details.tracks.map((track, i) => (
                    <li key={`${i}-${track}`} className="flex gap-4 py-3">
                      <span className="w-6 font-semibold text-navy/70">{i + 1}</span>
                      <span>{track}</span>
                    </li>
                  ))}
                </ol>
              </section>
            </div>
          )}
        </div>

        <div className="contents lg:flex lg:flex-col lg:gap-6">
          <div className="order-2 mt-6 lg:mt-0">
            <h1 className="font-heading text-4xl leading-tight">{album.title}</h1>
            <p className="mt-1 text-navy/70">
              {album.artist} · {album.releaseYear}
            </p>
          </div>

          <section role="status" className="order-3 mt-6 rounded-2xl border border-line bg-sand p-5 text-navy lg:mt-0">
            <h2 className="font-heading text-2xl">Nobody is selling this album right now</h2>
            <p className="mt-2 text-navy/80">Check back later, or browse other albums in this genre.</p>
          </section>

          {hasDetails ? (
            <div className="order-5">
              {details.musician && (
                <section className="mt-8 lg:mt-0">
                  <h2 className="font-heading text-2xl">About {details.musician.name}</h2>
                  <p className="mt-2 text-navy/80">{details.musician.text}</p>
                  <a
                    href={details.musician.url}
                    className="mt-2 inline-block font-semibold text-navy underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Read more on Wikipedia
                  </a>
                </section>
              )}
              {!details.musician && musicianMissing && <p className="mt-8 text-sm text-navy/70 lg:mt-0">{musicianMissing}</p>}

              {sources && (
                <p className="mt-6 inline-block rounded-full border border-line px-3 py-1 text-sm text-navy/70">{sources}</p>
              )}
            </div>
          ) : (
            <p className="order-5 mt-6 text-sm text-navy/70">The details of this album are not available right now.</p>
          )}
        </div>
      </div>
    </main>
  );
}
