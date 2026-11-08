"use client";
// The album rows of the results page (story 17): the same rows and taps as story 1. An album with no listings
// shows its message here, on the page.
import { useState } from "react";
import { AlbumRow } from "@/app/AlbumSearch";
import type { AlbumSummary } from "@/lib/db/albums";

export function SearchResults({ albums }: { albums: AlbumSummary[] }) {
  const [nobodySelling, setNobodySelling] = useState<AlbumSummary | null>(null);
  return (
    <>
      {nobodySelling && (
        <div role="status" className="mb-4 rounded-2xl border border-line bg-sand p-5 text-navy">
          <p className="font-heading text-2xl">Nobody is selling this album right now</p>
          <p className="mt-1 text-sm text-navy/80">
            {nobodySelling.title} · {nobodySelling.artist}
          </p>
        </div>
      )}
      <ul aria-label="Search results" className="divide-y divide-line border-y border-line">
        {albums.map((a) => (
          <li key={a.id}>
            <AlbumRow album={a} mode="buy" onNobodySelling={setNobodySelling} />
          </li>
        ))}
      </ul>
    </>
  );
}
