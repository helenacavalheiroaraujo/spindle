// Top-right of every page below 1024 px (story 9): "Log in" when signed out; the user's initials when signed in,
// which open Your account (name, email, Log out — DECISIONS · story 9).
// Lives in the root layout, not in Header, because Header is also used inside client error screens.
// Also "Sell for free" (story 8; "+ Sell" on a phone, finding #76): signed out, it opens the log-in window (story 27).
import { Suspense } from "react";
import Link from "next/link";
import { initials } from "@/lib/rules/initials";
import { LogInLink } from "./LogInLink";
import { CartLink } from "./CartLink";
import { LoginWindowLink } from "./LoginWindowLink";

// Phone and tablet only (story 19): from 1024 px the account and Sell sit in the menu, in the header (MainMenu).
// The session is read once, in the root layout, and passed in.
export function AccountBadge({ signedIn, name }: { signedIn: boolean; name: string }) {
  const letters = initials(name);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-4 z-20 lg:hidden">
      <div className="page-main flex items-center justify-end gap-2 px-4 [&>*]:pointer-events-auto">
        {/* Phone: "Sell" is in the menu (story 15), whose ☰ button takes the top-left slot. */}
        {/* Signed out: opens the log-in window (story 27). */}
        <LoginWindowLink
          href="/sell"
          className="hidden min-h-11 sm:flex items-center rounded-full bg-navy px-4 text-sm font-semibold text-cream"
        >
          <span aria-hidden>+&nbsp;</span>Sell&nbsp;for free
        </LoginWindowLink>
        <CartLink />
        {!signedIn ? (
          <Suspense>
            <LogInLink />
          </Suspense>
        ) : (
          <Link
            href="/account"
            aria-label={name ? `Your account, signed in as ${name}` : "Your account"}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-navy text-sm font-semibold text-cream"
          >
            {letters || "Me"}
          </Link>
        )}
      </div>
    </div>
  );
}
