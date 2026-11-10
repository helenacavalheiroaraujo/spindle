import { Suspense } from "react";
import Link from "next/link";
import { HeaderSearch } from "./HeaderSearch";
import { MenuDrawer, MenuRow } from "./MainMenu";

// Shared top bar with the Spindle logo (back to the home page). Desktop (stories 19, 22): a navy top row, 56 px high,
// with the logo on the left and the menu (MenuRow) on the right, in cream; under it a cream strip with the search (64 px).
// Phone: the logo in the middle, the ☰ drawer top left and the account badge (in the layout) top right; no navy.
export function Header() {
  return (
    <header className="relative">
      <div className="flex items-center justify-center py-5 lg:h-14 lg:justify-between lg:bg-navy lg:py-0 lg:text-cream">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-heading text-xl tracking-wide lg:gap-3 lg:text-4xl">
          <span aria-hidden className="h-5 w-5 rounded-full border-[5px] border-navy lg:h-8 lg:w-8 lg:border-[8px] lg:border-cream" />
          SPINDLE
        </Link>
        <Suspense>
          <MenuRow />
        </Suspense>
      </div>
      <Suspense>
        <HeaderSearch />
      </Suspense>
      <Suspense>
        <MenuDrawer />
      </Suspense>
    </header>
  );
}
