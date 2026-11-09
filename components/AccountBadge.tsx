// Top-right of every page (story 9): "Log in" when signed out; the user's initials when signed in,
// which open Your account (name, email, Log out — DECISIONS · story 9).
// Lives in the root layout, not in Header, because Header is also used inside client error screens.
// Also "Sell for free" (story 8; "+ Sell" on a phone, finding #76): signed out, /sell sends to log-in first.
import { Suspense } from "react";
import Link from "next/link";
import { currentUserId } from "@/lib/db/session";
import { getProfileName } from "@/lib/db/profiles";
import { initials } from "@/lib/rules/initials";
import { LogInLink } from "./LogInLink";

export async function AccountBadge() {
  let signedIn = false;
  let name = "";
  try {
    const userId = await currentUserId();
    if (userId) {
      signedIn = true;
      name = (await getProfileName(userId)) ?? "";
    }
  } catch {
    return null; // the badge never breaks the page under it
  }
  const letters = initials(name);

  return (
    <div className="pointer-events-none absolute inset-x-4 top-4 z-20 flex items-center justify-end gap-2 [&>*]:pointer-events-auto">
      {/* Phone: "Sell" is in the menu (story 15), whose ☰ button takes the top-left slot. */}
      <Link
        href="/sell"
        className="hidden min-h-11 sm:flex items-center rounded-full bg-navy px-4 text-sm font-semibold text-cream"
      >
        <span aria-hidden>+&nbsp;</span>Sell&nbsp;for free
      </Link>
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
  );
}
