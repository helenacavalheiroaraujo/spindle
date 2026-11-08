import { HomeSections } from "./HomeSections";
import { Header } from "@/components/Header";
import { SearchBox } from "@/components/SearchBox";

// Home page (story 12): title, search box, crates by genre and "This week at the shop".
// Searching opens the results page /search (story 17); results are never shown here.
export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-4 pb-16 lg:max-w-5xl">
      <Header />
      <div className="mt-4 lg:flex lg:items-end lg:justify-between lg:gap-12">
        <h1 className="font-heading text-4xl leading-none sm:text-5xl lg:text-7xl">Pick a crate. We&apos;ll pick the pressing.</h1>
        <p className="mt-3 text-base lg:max-w-xs lg:text-sm lg:text-navy/80">
          No jargon, no homework. We tell you which version to buy and check every listing.
        </p>
      </div>
      <div className="mt-6">
        <SearchBox />
      </div>
      <HomeSections />
    </main>
  );
}
