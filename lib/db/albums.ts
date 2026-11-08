// Album reads for the search (story 1). Facts only: the rules in lib/rules/ decide.
import { db } from "./client";
import { hasActiveListings, type ListingFacts } from "@/lib/rules/activeListings";
import { albumAccess, type AlbumAccess } from "@/lib/rules/albumAccess";
import type { CheckItem, CheckResult } from "@/lib/rules/trafficLight";

export type AlbumSummary = {
  id: string;
  title: string;
  artist: string;
  releaseYear: number;
  coverUrl: string;
  versionCount: number;
  hasListings: boolean;
  access: AlbumAccess;
};

// Every album with its number of versions, whether it has active listings, and whether it opens.
// The catalogue is small, so search and suggestions run on the full list (DECISIONS.md).
export async function listAlbumSummaries(): Promise<AlbumSummary[]> {
  const client = db();
  const [albums, listings, reasons] = await Promise.all([
    client.from("albums").select("id, title, artist, release_year, cover_url, versions (id)"),
    client
      .from("listings")
      .select("status, claimed_version_id, actual_version_id, matrix_photo_url, check_results (item, result)")
      .eq("status", "on_sale"),
    client.from("reason_texts").select("version_id"),
  ]);
  if (albums.error) throw albums.error;
  if (listings.error) throw listings.error;
  if (reasons.error) throw reasons.error;
  const withReasons = new Set(reasons.data.map((r) => r.version_id));

  const facts: ListingFacts[] = listings.data.map((l) => ({
    status: l.status,
    claimedVersionId: l.claimed_version_id,
    actualVersionId: l.actual_version_id,
    hasMatrixPhoto: l.matrix_photo_url !== null,
    checks: Object.fromEntries(l.check_results.map((c) => [c.item, c.result])) as Record<CheckItem, CheckResult>,
  }));

  return albums.data.map((a) => {
    const versionIds = a.versions.map((v) => v.id);
    const hasListings = hasActiveListings(facts, versionIds);
    return {
      id: a.id,
      title: a.title,
      artist: a.artist,
      releaseYear: a.release_year,
      coverUrl: a.cover_url,
      versionCount: versionIds.length,
      hasListings,
      access: albumAccess(hasListings, versionIds.some((v) => withReasons.has(v))),
    };
  });
}

export type AlbumHeader = { id: string; title: string; artist: string; coverUrl: string; versionCount: number };

// One album for the header of the priorities screen (story 2), or null if there is no such album.
export async function getAlbumHeader(albumId: string): Promise<AlbumHeader | null> {
  const { data, error } = await db()
    .from("albums")
    .select("id, title, artist, cover_url, versions (id)")
    .eq("id", albumId)
    .maybeSingle();
  if (error?.code === "22P02") return null; // not a valid album id
  if (error) throw error;
  if (!data) return null;
  return { id: data.id, title: data.title, artist: data.artist, coverUrl: data.cover_url, versionCount: data.versions.length };
}

// --- Sell (story 8) ---------------------------------------------------------

export type SellVersion = { id: string; name: string; releaseYear: number; country: string; label: string; format: string };
export type AlbumVersions = AlbumHeader & { versions: SellVersion[] };

// An album with every version in the catalogue, oldest first, even when nobody sells it. Null when there is no such album.
export async function getAlbumVersions(albumId: string): Promise<AlbumVersions | null> {
  const { data, error } = await db()
    .from("albums")
    .select("id, title, artist, cover_url, versions (id, name, release_year, country, label, format)")
    .eq("id", albumId)
    .maybeSingle();
  if (error?.code === "22P02") return null; // not a valid album id
  if (error) throw error;
  if (!data) return null;
  const versions = data.versions
    .map((v) => ({ id: v.id, name: v.name, releaseYear: v.release_year, country: v.country, label: v.label, format: v.format }))
    .sort((a, b) => a.releaseYear - b.releaseYear || a.name.localeCompare(b.name));
  return { id: data.id, title: data.title, artist: data.artist, coverUrl: data.cover_url, versionCount: versions.length, versions };
}

export type VersionToSell = {
  id: string;
  name: string;
  albumId: string;
  albumTitle: string;
  typicalRange: { min: number | null; max: number | null };
};

// The version picked on the sell form. Null when it is not in the catalogue.
export async function getVersionToSell(versionId: string): Promise<VersionToSell | null> {
  const { data, error } = await db()
    .from("versions")
    .select("id, name, typical_price_min, typical_price_max, albums (id, title)")
    .eq("id", versionId)
    .maybeSingle();
  if (error?.code === "22P02") return null; // not a valid version id
  if (error) throw error;
  if (!data) return null;
  const album = data.albums as unknown as { id: string; title: string };
  return {
    id: data.id,
    name: data.name,
    albumId: album.id,
    albumTitle: album.title,
    typicalRange: {
      min: data.typical_price_min === null ? null : Number(data.typical_price_min),
      max: data.typical_price_max === null ? null : Number(data.typical_price_max),
    },
  };
}
