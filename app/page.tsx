import { HomeSections } from "./HomeSections";
import { Header } from "@/components/Header";
import { SearchBox } from "@/components/SearchBox";

// Home page (story 12): title, search box, crates by genre and "This week at the shop".
// Searching opens the results page /search (story 17); results are never shown here.
export default function Home() {
  return (
    <main className="px-4 pb-16 page-main">
      <Header />
      <div className="mt-4">
        <h1 className="font-heading text-4xl leading-none sm:text-5xl lg:text-7xl">Pick a crate. We&apos;ll pick the pressing.</h1>
        <p className="mt-3 max-w-xl text-base">
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
