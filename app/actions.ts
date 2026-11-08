"use server";
// Server actions: the browser never reads the database. Search (story 1), saved priorities (story 2), home page (story 12), listings beside the recommendation (story 5).
import { listAlbumSummaries, type AlbumSummary } from "@/lib/db/albums";
import { crates, featuredAlbum, type Genre } from "@/lib/rules/home";
import { searchAlbums } from "@/lib/rules/albumSearch";
import { searchSuggestions } from "@/lib/rules/searchSuggestions";
import { getVersionListings, type ListingDetails } from "@/lib/db/listings";
import { currentProfileId } from "@/lib/db/profiles";
import { saveRanking } from "@/lib/db/preferences";
import { currentUserId } from "@/lib/db/session";
import { parsePriorities } from "@/lib/rules/priorities";

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

// "See recommendation" (story 2 · phase 2): a signed-in buyer's ranking is saved, replacing any saved one
// (finding #11). Signed out: nothing is saved. A failed save does not stop the buyer; the ranking still
// travels in the address.
export async function savePriorities(value: string): Promise<void> {
  const userId = await currentUserId();
  if (!userId) return;
  try {
    await saveRanking(userId, parsePriorities(value));
  } catch (error) {
    console.error(error);
  }
}

export type HomeData = {
  crates: { genre: Genre; count: number }[];
  featured: { id: string; title: string; artist: string; releaseYear: number; coverUrl: string } | null;
};

// Crates and the featured album for the home page (story 12): loaded on their own, so a failure only affects
// those sections and the search stays usable.
export async function homeData(): Promise<HomeData> {
  const albums = await listAlbumSummaries();
  const featured = featuredAlbum(albums);
  return {
    crates: crates(albums),
    featured: featured && {
      id: featured.id,
      title: featured.title,
      artist: featured.artist,
      releaseYear: featured.releaseYear,
      coverUrl: featured.coverUrl,
    },
  };
}
