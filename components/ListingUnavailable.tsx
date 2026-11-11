import { Header } from "@/components/Header";

// A listing opened from a link after it was sold or removed (finding #61, DECISIONS 2026-11-08).
export function ListingUnavailable() {
  return (
    <main className="px-4 pb-16 page-main page-narrow">
      <Header />
      <section aria-label="Unavailable" className="mt-6 rounded-3xl border border-line bg-sand p-6">
        <h1 className="font-heading text-4xl leading-tight">This record is no longer available</h1>
      </section>
    </main>
  );
}
