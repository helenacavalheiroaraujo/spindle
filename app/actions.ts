"use server";
// Server actions: the browser never reads the database. Search (story 1), listings beside the recommendation (story 5).
import { listAlbumSummaries, type AlbumSummary } from "@/lib/db/albums";
import { searchAlbums } from "@/lib/rules/albumSearch";
import { searchSuggestions } from "@/lib/rules/searchSuggestions";
import { getVersionListings, type ListingDetails } from "@/lib/db/listings";

export type SearchResponse = { albums: AlbumSummary[]; suggestions: AlbumSummary[] };

export async function search(typed: string): Promise<SearchResponse> {
  const all = await listAlbumSummaries();
  const albums = searchAlbums(all, typed);
  return { albums, suggestions: albums.length === 0 ? searchSuggestions(all, typed) : [] };
}

// Listings beside the recommendation on desktop (story 5): loaded on their own, so a failure only
// affects that area, and phones (which open the listings on their own screen) never load them.
export async function versionListings(versionId: string): Promise<ListingDetails[]> {
  const data = await getVersionListings(versionId);
  return data?.listings ?? [];
}
