import { AlbumSearch } from "./AlbumSearch";
import { Header } from "@/components/Header";

// Home + search (story 1).
export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-4 pb-16">
      <Header />
      <h1 className="mt-4 font-heading text-4xl leading-tight sm:text-5xl">Which record do you want to buy?</h1>
      <p className="mt-2 text-base">No jargon, no homework. We tell you which version to buy and check every listing.</p>
      <AlbumSearch />
    </main>
  );
}
