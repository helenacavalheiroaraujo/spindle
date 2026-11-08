import { Suspense } from "react";
import Link from "next/link";
import { HeaderSearch } from "./HeaderSearch";

// Shared top bar with the Spindle logo (back to the home page). On desktop (story 12) the logo sits on the left,
// followed by the search; the account badge and "Sell for free" stay on the right (AccountBadge, in the layout).
// wide: the page is wider than the account badge's left edge, so the search leaves room for it.
export function Header({ wide = false }: { wide?: boolean }) {
  return (
    <header className={`flex items-center justify-center py-5 lg:justify-start lg:gap-6 ${wide ? "lg:pr-40" : ""}`}>
      <Link href="/" className="flex shrink-0 items-center gap-2 font-heading text-xl tracking-wide">
        <span aria-hidden className="h-5 w-5 rounded-full border-[5px] border-navy" />
        SPINDLE
      </Link>
      <Suspense>
        <HeaderSearch />
      </Suspense>
    </header>
  );
}
