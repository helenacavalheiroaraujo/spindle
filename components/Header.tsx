import { Suspense } from "react";
import Link from "next/link";
import { HeaderSearch } from "./HeaderSearch";
import { MenuDrawer, MenuRow } from "./MainMenu";

// Shared top bar with the Spindle logo (back to the home page). Desktop (story 19): two rows of fixed height, the same
// on every page. Top row: the logo on the left, the menu (MenuRow) on the right. Second row: the search, full width;
// on pages without a header search (selling) it stays as empty space so the page does not jump.
// Phone: the logo in the middle, the ☰ drawer top left and the account badge (in the layout) top right.
export function Header() {
  return (
    <header className="relative">
      <div className="flex items-center justify-center py-5 lg:h-14 lg:justify-between lg:py-0">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-heading text-xl tracking-wide lg:gap-3 lg:text-4xl">
          <span aria-hidden className="h-5 w-5 rounded-full border-[5px] border-navy lg:h-8 lg:w-8 lg:border-[8px]" />
          SPINDLE
        </Link>
        <Suspense>
          <MenuRow />
        </Suspense>
      </div>
      <div className="hidden lg:flex lg:h-16 lg:items-center">
        <Suspense>
          <HeaderSearch />
        </Suspense>
      </div>
      <Suspense>
        <MenuDrawer />
      </Suspense>
    </header>
  );
}
