import { AlbumSearch } from "./AlbumSearch";
import { HomeSections } from "./HomeSections";
import { Header } from "@/components/Header";

// Home page (story 12): title, search (story 1), crates by genre and "This week at the shop".
// "?q=" is a search typed in the header on desktop.
export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const { q } = await searchParams;
  const initial = (Array.isArray(q) ? q[0] : q) ?? "";
  return (
    <main className="mx-auto max-w-2xl px-4 pb-16 lg:max-w-5xl">
      <Header />
      <div className="mt-4 lg:flex lg:items-end lg:justify-between lg:gap-12">
        <h1 className="font-heading text-4xl leading-none sm:text-5xl lg:text-7xl">Pick a crate. We&apos;ll pick the pressing.</h1>
        <p className="mt-3 text-base lg:max-w-xs lg:text-sm lg:text-navy/80">
          No jargon, no homework. We tell you which version to buy and check every listing.
        </p>
      </div>
      <AlbumSearch key={initial} initial={initial} boxOnPhoneOnly />
      <HomeSections />
    </main>
  );
}
