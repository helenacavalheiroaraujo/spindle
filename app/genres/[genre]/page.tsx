import Link from "next/link";
import { notFound } from "next/navigation";
import { listAlbumSummaries } from "@/lib/db/albums";
import { albumsInGenre, genreFromSlug, recordsLabel } from "@/lib/rules/home";
import { Crate } from "@/components/Crate";
import { Header } from "@/components/Header";
import { GenreAlbums } from "./GenreAlbums";

// Genre screen (story 12): what a crate opens. The albums of that genre, newest first, as in the search results.
export default async function GenrePage({ params }: { params: Promise<{ genre: string }> }) {
  const { genre: slug } = await params;
  const genre = genreFromSlug(slug);
  if (!genre) notFound();
  const albums = albumsInGenre(await listAlbumSummaries(), genre);
  if (albums.length === 0) notFound(); // crates are shown only for genres with albums

  return (
    <main className="mx-auto max-w-2xl px-4 pb-16 lg:max-w-5xl">
      <Header />
      <Link href="/" className="inline-flex items-center gap-3 text-sm font-semibold">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-navy/30">
          <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </span>
        Back to home
      </Link>
      <h1 className="sr-only">{genre.name}</h1>
      <div className="mt-3">
        <Crate genre={genre} count={recordsLabel(albums.length)} large />
      </div>
      <p className="mb-2 mt-4 text-sm text-navy/70">Newest first · Illustrative data</p>
      <GenreAlbums albums={albums} />
    </main>
  );
}
