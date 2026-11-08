"use server";
// Server actions: the browser never reads the database. Search (story 1), listings beside the recommendation (story 5).
import { listAlbumSummaries, type AlbumSummary } from "@/lib/db/albums";
import { searchAlbums } from "@/lib/rules/albumSearch";
import { searchSuggestions } from "@/lib/rules/searchSuggestions";
import { getVersionListings, type ListingDetails } from "@/lib/db/listings";
import { currentProfileId } from "@/lib/db/profiles";

export type SearchResponse = { albums: AlbumSummary[]; suggestions: AlbumSummary[] };

export async function search(typed: string): Promise<SearchResponse> {
  const all = await listAlbumSummaries();
  const albums = searchAlbums(all, typed);
  return { albums, suggestions: albums.length === 0 ? searchSuggestions(all, typed) : [] };
}

// Listings beside the recommendation on desktop (story 5): loaded on their own, so a failure only
// affects that area, and phones (which open the listings on their own screen) never load them.
// viewerId: the signed-in user's profile id, for "Your listing" on their own listings (finding #12).
export async function versionListings(versionId: string): Promise<{ listings: ListingDetails[]; viewerId: string | null }> {
  const [data, viewerId] = await Promise.all([getVersionListings(versionId), currentProfileId()]);
  return { listings: data?.listings ?? [], viewerId };
}
