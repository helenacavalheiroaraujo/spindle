"use client";
// The albums of a genre (story 12), with the same rows and the same taps as the search results (story 1):
// an album that opens goes to the priorities screen; one with no listings shows the message here.
import { useState } from "react";
import { AlbumRow } from "@/app/AlbumSearch";
import type { AlbumSummary } from "@/lib/db/albums";

export function GenreAlbums({ albums }: { albums: AlbumSummary[] }) {
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
      <ul className="divide-y divide-line border-y border-line lg:grid lg:grid-cols-2 lg:gap-x-10 lg:divide-y-0 lg:border-b-0 [&>li]:border-b [&>li]:border-line">
        {albums.map((a) => (
          <li key={a.id}>
            <AlbumRow album={a} mode="buy" onNobodySelling={setNobodySelling} />
          </li>
        ))}
      </ul>
    </>
  );
}
