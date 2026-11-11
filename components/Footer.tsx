// Desktop footer (story 14). Shown on 1280 px and wider only (Tailwind "xl"); no links (DECISIONS 2026-11-10).
// Design: docs/design/footer-desktop.html. Sits after the page content in the layout, so it never covers it.
export function Footer() {
  return (
    <footer className="hidden bg-navy text-cream xl:block">
      <div className="flex items-center justify-between gap-8 px-[max(1rem,calc(50vw-35rem))] py-7">
        <div>
          <p className="flex items-center gap-3 font-heading text-2xl tracking-wide">
            <span aria-hidden className="h-6 w-6 rounded-full border-[6px] border-cream" />
            SPINDLE
          </p>
          <p className="mt-2 text-sm text-sand">We help you pick the right pressing of a vinyl record and buy a verified copy safely.</p>
        </div>
        <p className="shrink-0 whitespace-nowrap rounded-full border border-cream/45 px-4 py-1.5 text-sm text-sand">
          All catalogue data is illustrative
        </p>
      </div>
    </footer>
  );
}
