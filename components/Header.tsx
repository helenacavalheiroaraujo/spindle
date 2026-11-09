import { Suspense } from "react";
import Link from "next/link";
import { HeaderSearch } from "./HeaderSearch";
import { MenuDrawer, MenuRow } from "./MainMenu";

// Shared top bar with the Spindle logo (back to the home page). On desktop (story 12) the logo sits on the left,
// followed by the search; the account badge and "Sell for free" stay on the right (AccountBadge, in the layout).
// On desktop the padding on the right keeps the search clear of the account badge and "Sell for free" (AccountBadge, in the
// layout, sits at the right end of the page width, like the header): the badge is about 270 px wide.
export function Header() {
  return (
    <header className="relative">
      <div className="flex items-center justify-center py-5 lg:justify-start lg:gap-6 lg:pr-[270px]">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-heading text-xl tracking-wide lg:gap-3 lg:text-4xl">
          <span aria-hidden className="h-5 w-5 rounded-full border-[5px] border-navy lg:h-8 lg:w-8 lg:border-[8px]" />
          SPINDLE
        </Link>
        <Suspense>
          <HeaderSearch />
        </Suspense>
      </div>
      <Suspense>
        <MenuDrawer />
        <MenuRow />
      </Suspense>
    </header>
  );
}
