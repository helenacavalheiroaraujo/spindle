"use client";
// The albums of a genre (story 12), with the same rows and the same taps as the search results (story 1),
// except an album with no listings: it opens its own page that says nobody is selling it (bug 17, DECISIONS 2026-11-10).
import { AlbumRow } from "@/app/AlbumSearch";
import type { AlbumSummary } from "@/lib/db/albums";

export function GenreAlbums({ albums }: { albums: AlbumSummary[] }) {
  return (
    <ul className="divide-y divide-line border-y border-line lg:grid lg:grid-cols-2 lg:gap-x-10 lg:divide-y-0 lg:border-b-0 [&>li]:border-b [&>li]:border-line">
      {albums.map((a) => (
        <li key={a.id}>
          <AlbumRow album={a} mode="buy" onNobodySelling={() => {}} noListingsHref={(id) => `/albums/${id}`} />
        </li>
      ))}
    </ul>
  );
}
