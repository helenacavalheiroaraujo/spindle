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
      <Link href="/" className="inline-flex min-h-12 items-center text-sm font-semibold">
        ← Back to home
      </Link>
      <h1 className="sr-only">{genre.name}</h1>
      <Crate genre={genre} count={recordsLabel(albums.length)} large />
      <p className="mb-2 mt-4 text-sm text-navy/70">Newest first · Illustrative data</p>
      <GenreAlbums albums={albums} />
    </main>
  );
}
