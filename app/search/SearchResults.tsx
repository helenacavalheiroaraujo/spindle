"use client";
// The album rows of the results page (story 17): the same rows and taps as story 1. An album with no listings
// opens its own page (bug 28).
import { AlbumRow } from "@/app/AlbumSearch";
import type { AlbumSummary } from "@/lib/db/albums";

export function SearchResults({ albums }: { albums: AlbumSummary[] }) {
  return (
    <ul aria-label="Search results" className="divide-y divide-line border-y border-line">
      {albums.map((a) => (
        <li key={a.id}>
          <AlbumRow album={a} mode="buy" />
        </li>
      ))}
    </ul>
  );
}
