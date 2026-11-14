import Link from "next/link";
import { notFound } from "next/navigation";
import { getVersionTracks, listAlbumSummaries } from "@/lib/db/albums";
import { getViewerSavedRanking } from "@/lib/db/preferences";
import { loadAlbumDetails } from "@/lib/external/albumDetails";
import { loadPreviews } from "@/lib/external/itunes";
import { matchPreviews } from "@/lib/rules/trackPreview";
import { albumAction, fallbackTracks, type AlbumAction } from "@/lib/rules/albumAction";
import { Header } from "@/components/Header";
import { TrackList } from "./TrackList";

// The album page (story 28 · DECISIONS 2026-11-14): every album tap opens it. Only the action card under the title changes:
// "Help me choose a version", "See your recommendation · Based on: …", or "Nobody is selling this album right now" (story 21).
// Also shows the musician, release date, label and tracks (story 21), from MusicBrainz and Wikipedia; if MusicBrainz
// returns no tracks, the track list comes from the album's earliest version in our database (story 28).
// An album not in the demo has no page.
//
// Layout (bug 20; story 28, design option A′): on desktop the cover, the release facts and the track list sit on the left;
// the title, the action card and the musician's text sit on the right. On phone it is one column in this order: cover (60%
// of the width, so the action button shows without scrolling), title, action card, facts, musician, source, track list.
// The two groups are "contents" on phone and columns on desktop; the `order` classes keep the phone order.
// Story 34: each track matched on iTunes gets a 30-second preview; if iTunes does not answer, the list shows without them.
export default async function AlbumPage({ params }: { params: Promise<{ albumId: string }> }) {
  const { albumId } = await params;
  const album = (await listAlbumSummaries()).find((a) => a.id === albumId);
  if (!album) notFound();
  const action = albumAction(album.id, album.access, album.access === "open" ? await getViewerSavedRanking() : null);
  if (action.kind === "none") notFound();

  const [loaded, ownTracks, itunesTracks] = await Promise.all([
    loadAlbumDetails(album.title, album.artist).catch(() => null),
    getVersionTracks(album.id)
      .then(fallbackTracks)
      .catch(() => [] as string[]),
    loadPreviews(album.title, album.artist).catch(() => []),
  ]);
  const details = loaded && {
    ...loaded,
    tracks: loaded.tracks.length > 0 ? loaded.tracks : ownTracks,
  };
  const tracks = details?.tracks ?? ownTracks;
  const previews = matchPreviews(tracks, itunesTracks);
  const hasDetails =
    details !== null && (details.releaseDate !== null || details.label !== null || tracks.length > 0 || details.musician !== null);

  return (
    <main className="px-4 pb-16 page-main">
      <Header />
      <div className="flex flex-col lg:mt-8 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start lg:gap-x-12">
        <div className="contents lg:flex lg:flex-col lg:gap-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={album.coverUrl}
            alt=""
            width={340}
            height={340}
            className="order-1 mx-auto h-auto w-3/5 rounded-2xl lg:w-full"
          />
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

          {tracks.length > 0 && (
            <div className="order-6 mt-8 lg:mt-0">
              <TrackList tracks={tracks} previews={previews} />
            </div>
          )}
        </div>

        <div className="contents lg:flex lg:flex-col lg:gap-6">
          <div className="order-2 mt-4 lg:mt-0">
            <h1 className="font-heading text-3xl leading-tight lg:text-4xl">{album.title}</h1>
            <p className="mt-1 text-navy/70">
              {album.artist} · {album.releaseYear}
            </p>
          </div>

          <ActionCard action={action} />

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

              <p className="mt-6 inline-block rounded-full border border-line px-3 py-1 text-sm text-navy/70">
                Source: MusicBrainz · Wikipedia
              </p>
            </div>
          ) : (
            <p className="order-5 mt-6 text-sm text-navy/70">The details of this album are not available right now.</p>
          )}
        </div>
      </div>
    </main>
  );
}

// The sand card under the title (design option A′). On desktop the text sits left and the button right.
function ActionCard({ action }: { action: Exclude<AlbumAction, { kind: "none" }> }) {
  if (action.kind === "nobody_selling") {
    return (
      <section role="status" className="order-3 mt-4 rounded-2xl border border-line bg-sand p-5 text-navy lg:mt-0">
        <h2 className="font-heading text-2xl">Nobody is selling this album right now</h2>
        <p className="mt-2 text-navy/80">Check back later, or browse other albums in this genre.</p>
      </section>
    );
  }
  const choose = action.kind === "choose";
  return (
    <section
      aria-labelledby="album-action"
      className="order-3 mt-4 rounded-2xl border border-line bg-sand p-5 text-navy lg:mt-0 lg:flex lg:items-center lg:justify-between lg:gap-6"
    >
      <div>
        <h2 id="album-action" className="font-heading text-2xl">
          {choose ? "Several versions are on sale" : "Your recommendation is ready"}
        </h2>
        <p className="mt-1 text-navy/80">
          {choose ? "Tell us what matters to you and we pick one for you." : "We picked a version using your priorities."}
        </p>
      </div>
      <div className="mt-4 lg:mt-0 lg:shrink-0">
        <Link
          href={action.href}
          className="flex min-h-14 items-center justify-center rounded-full bg-navy px-6 text-lg font-semibold text-cream"
        >
          {choose ? "Help me choose a version" : "See your recommendation"}
        </Link>
        {action.kind === "recommendation" && (
          <p className="mt-1 flex flex-wrap items-center justify-center gap-x-2 text-sm">
            <span>Based on: {action.basedOn}</span>
            <span aria-hidden>·</span>
            <Link href={action.changeHref} className="inline-flex min-h-11 items-center font-semibold underline">
              Change
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
