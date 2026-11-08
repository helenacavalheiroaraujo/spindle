import Link from "next/link";
import { listAlbumSummaries } from "@/lib/db/albums";
import { isTooShort, searchAlbums, SHORT_SEARCH_MESSAGE } from "@/lib/rules/albumSearch";
import { searchSuggestions } from "@/lib/rules/searchSuggestions";
import { Header } from "@/components/Header";
import { SearchBox } from "@/components/SearchBox";
import { SearchResults } from "./SearchResults";

// Search results page (story 17): /search?q=… shows only the results. The rules (match, newest first, suggestions,
// 3 characters) live in lib/rules; this page only shows what they return.
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const { q } = await searchParams;
  const typed = ((Array.isArray(q) ? q[0] : q) ?? "").trim();
  const tooShort = isTooShort(typed);
  const all = tooShort ? [] : await listAlbumSummaries();
  const albums = searchAlbums(all, typed);
  const suggestions = albums.length === 0 ? searchSuggestions(all, typed) : [];

  return (
    <main className="mx-auto max-w-2xl px-4 pb-16 lg:max-w-3xl">
      <Header />
      <SearchBox key={typed} initial={typed} />
      <Link href="/" className="mt-4 inline-flex min-h-12 items-center gap-2 text-sm font-semibold">
        <span aria-hidden>←</span> Back to home
      </Link>

      {tooShort && (
        <>
          <h1 className="sr-only">Search</h1>
          <p role="status" className="mt-4 text-lg font-medium">
            {SHORT_SEARCH_MESSAGE}
          </p>
        </>
      )}

      {!tooShort && albums.length > 0 && (
        <>
          <h1 className="mt-2 font-heading text-4xl leading-none sm:text-5xl lg:text-6xl">Results for “{typed}”</h1>
          <p className="mb-2 mt-2 text-sm text-navy/70">
            {albums.length} {albums.length === 1 ? "album" : "albums"} · newest first
          </p>
          <SearchResults albums={albums} />
        </>
      )}

      {!tooShort && albums.length === 0 && (
        <>
          <h1 className="mt-2 font-heading text-4xl leading-none sm:text-5xl lg:text-6xl">No albums found for “{typed}”</h1>
          {suggestions.length > 0 && (
            <div className="mt-4 rounded-2xl border border-line bg-sand p-4">
              <p className="mb-2 font-medium">Did you mean…?</p>
              <SearchResults albums={suggestions} />
            </div>
          )}
        </>
      )}

      <p className="mt-6 inline-block rounded-full border border-line px-3 py-1 text-xs">Illustrative data</p>
    </main>
  );
}
