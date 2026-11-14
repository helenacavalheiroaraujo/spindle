// Top-right of every page below 1024 px (story 9): "Log in" when signed out; signed in, the account pill (initials
// and ▾) that opens the account menu (story 32).
// Lives in the root layout, not in Header, because Header is also used inside client error screens.
// Also "Sell for free" (story 8; "+ Sell" on a phone, finding #76): signed out, it opens the log-in window (story 27).
import { Suspense } from "react";
import { LogInLink } from "./LogInLink";
import { CartLink } from "./CartLink";
import { LoginWindowLink } from "./LoginWindowLink";
import { AccountMenu } from "./AccountMenu";

// Phone and tablet only (story 19): from 1024 px the account and Sell sit in the menu, in the header (MainMenu).
// The session is read once, in the root layout, and passed in.
export function AccountBadge({ signedIn, name, email = "" }: { signedIn: boolean; name: string; email?: string }) {

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
          <AccountMenu name={name} email={email} variant="phone" />
        )}
      </div>
    </div>
  );
}
