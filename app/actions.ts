"use server";
// Search on the server (story 1): the browser never reads the database.
import { listAlbumSummaries, type AlbumSummary } from "@/lib/db/albums";
import { searchAlbums } from "@/lib/rules/albumSearch";
import { searchSuggestions } from "@/lib/rules/searchSuggestions";

export type SearchResponse = { albums: AlbumSummary[]; suggestions: AlbumSummary[] };

export async function search(typed: string): Promise<SearchResponse> {
  const all = await listAlbumSummaries();
  const albums = searchAlbums(all, typed);
  return { albums, suggestions: albums.length === 0 ? searchSuggestions(all, typed) : [] };
}
