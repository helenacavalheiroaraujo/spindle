// Everything the recommendation screen needs for one album (story 3). Facts only: the rules decide.
import { db } from "./client";
import { LISTING_FACTS_COLUMNS, toListingFacts } from "./listings";
import { isActiveFor } from "@/lib/rules/activeListings";
import type { ConditionCode } from "@/lib/rules/recommendation";
import type { Priority } from "@/lib/rules/priorities";
import type { GlossaryTerm } from "@/lib/rules/glossary";

export type VersionDetails = {
  id: string;
  name: string;
  releaseYear: number;
  country: string;
  label: string;
  format: string;
  soundScore: number;
  originalScore: number;
  ratingCount: number;
  typicalMin: number | null;
  typicalMax: number | null;
  activePrices: number[]; // active listings only (Shared rules)
  activeConditions: ConditionCode[];
  tracks: { position: string; title: string; isExtra: boolean }[];
  reasons: Partial<Record<Priority, string>>;
};

export type RecommendationData = {
  album: { id: string; title: string; artist: string; releaseYear: number; coverUrl: string };
  versions: VersionDetails[];
  glossary: GlossaryTerm[];
};

// Null when there is no such album.
export async function getRecommendationData(albumId: string): Promise<RecommendationData | null> {
  const client = db();
  const albumResult = await client
    .from("albums")
    .select(
      `id, title, artist, release_year, cover_url,
       versions (id, name, release_year, country, label, format, sound_score, original_score, rating_count,
         typical_price_min, typical_price_max,
         tracks (position, title, is_extra),
         reason_texts (criterion, sentence))`,
    )
    .eq("id", albumId)
    .maybeSingle();
  if (albumResult.error?.code === "22P02") return null; // not a valid album id
  if (albumResult.error) throw albumResult.error;
  const album = albumResult.data;
  if (!album) return null;

  const versionIds = album.versions.map((v) => v.id);
  const [listings, terms] = await Promise.all([
    client
      .from("listings")
      .select(`price, condition_code, ${LISTING_FACTS_COLUMNS}`)
      .eq("status", "on_sale")
      .or(`claimed_version_id.in.(${versionIds.join(",")}),actual_version_id.in.(${versionIds.join(",")})`),
    client.from("glossary_terms").select("term, explanation"),
  ]);
  if (listings.error) throw listings.error;
  if (terms.error) throw terms.error;

  const versions: VersionDetails[] = album.versions.map((v) => {
    const active = listings.data.filter((l) => isActiveFor(toListingFacts(l), v.id));
    return {
      id: v.id,
      name: v.name,
      releaseYear: v.release_year,
      country: v.country,
      label: v.label,
      format: v.format,
      soundScore: v.sound_score,
      originalScore: v.original_score,
      ratingCount: v.rating_count,
      typicalMin: v.typical_price_min === null ? null : Number(v.typical_price_min),
      typicalMax: v.typical_price_max === null ? null : Number(v.typical_price_max),
      activePrices: active.map((l) => Number(l.price)),
      activeConditions: active.map((l) => l.condition_code as ConditionCode),
      tracks: [...v.tracks]
        .sort((a, b) => a.position.localeCompare(b.position, "en", { numeric: true }))
        .map((t) => ({ position: t.position, title: t.title, isExtra: t.is_extra })),
      reasons: Object.fromEntries(v.reason_texts.map((r) => [r.criterion, r.sentence])),
    };
  });

  return {
    album: { id: album.id, title: album.title, artist: album.artist, releaseYear: album.release_year, coverUrl: album.cover_url },
    versions,
    // Condition grades are not glossary terms here: their names ("Good") are everyday words in the
    // reasons. They show their explanation where a listing shows its grade (story 5).
    glossary: terms.data,
  };
}

// The same data for the page of one version (story 4): the album's data plus which version was asked for.
// Null when there is no such version.
export async function getVersionPageData(versionId: string): Promise<(RecommendationData & { versionId: string }) | null> {
  const result = await db().from("versions").select("album_id").eq("id", versionId).maybeSingle();
  if (result.error?.code === "22P02") return null; // not a valid version id
  if (result.error) throw result.error;
  if (!result.data) return null;
  const data = await getRecommendationData(result.data.album_id);
  return data ? { ...data, versionId } : null;
}
