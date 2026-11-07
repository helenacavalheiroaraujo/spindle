import { AlbumSearch } from "./AlbumSearch";

// Home + search (story 1).
export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-4 pb-16">
      <header className="flex items-center justify-center py-5">
        <span className="flex items-center gap-2 font-heading text-xl tracking-wide">
          <span aria-hidden className="h-5 w-5 rounded-full border-[5px] border-navy" />
          SPINDLE
        </span>
      </header>
      <h1 className="mt-4 font-heading text-4xl leading-tight sm:text-5xl">Which record do you want to buy?</h1>
      <p className="mt-2 text-base">No jargon, no homework. We tell you which version to buy and check every listing.</p>
      <AlbumSearch />
    </main>
  );
}
