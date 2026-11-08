// Top-right of every page (story 9): "Log in" when signed out; the user's initials when signed in,
// which open Your account (name, email, Log out — DECISIONS · story 9).
// Lives in the root layout, not in Header, because Header is also used inside client error screens.
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
    <div className="absolute right-4 top-4 z-20">
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
