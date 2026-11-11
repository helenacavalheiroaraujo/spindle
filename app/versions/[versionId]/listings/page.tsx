import { notFound } from "next/navigation";
import { getVersionListings } from "@/lib/db/listings";
import { currentProfileId } from "@/lib/db/profiles";
import { parsePriorities } from "@/lib/rules/priorities";
import { Header } from "@/components/Header";
import { ListingList } from "@/components/ListingList";

// Verified listings for one version (story 5): its own screen on phone, opened with "See verified listings".
export default async function ListingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ versionId: string }>;
  searchParams: Promise<{ priorities?: string | string[] }>;
}) {
  const { versionId } = await params;
  const { priorities } = await searchParams;
  const [data, viewerId] = await Promise.all([getVersionListings(versionId), currentProfileId()]);
  if (!data) notFound();
  const { version, listings } = data;

  const ranking = parsePriorities(Array.isArray(priorities) ? priorities[0] : priorities);

  return (
    <main className="px-4 pb-16 page-main">
      <Header />
      <div className="flex items-center gap-3">
        <p className="text-sm">
          <span className="block font-semibold">{version.name}</span>
          <span className="text-navy/70">{version.albumTitle}, {version.artist}</span>
        </p>
      </div>

      <div className="mt-6">
        <ListingList
          versionId={version.id}
          listings={listings}
          typicalRange={version.typicalRange}
          ranking={ranking}
          from="list"
          Heading="h1"
          viewerId={viewerId}
        />
      </div>
    </main>
  );
}
