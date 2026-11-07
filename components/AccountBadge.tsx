// Top-right of every page (story 9): the user's initials when signed in.
// Lives in the root layout, not in Header, because Header is also used inside client error screens.
// "Log in" when signed out comes with the login flow.
import { currentUserId } from "@/lib/db/session";
import { getProfileName } from "@/lib/db/profiles";
import { initials } from "@/lib/rules/initials";

export async function AccountBadge() {
  let letters = "";
  let name = "";
  try {
    const userId = await currentUserId();
    if (userId) {
      name = (await getProfileName(userId)) ?? "";
      letters = initials(name);
    }
  } catch {
    return null; // the badge never breaks the page under it
  }
  if (!letters) return null;

  return (
    <div className="absolute right-4 top-4 z-20">
      <span
        role="img"
        aria-label={`Signed in as ${name}`}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-navy text-sm font-semibold text-cream"
      >
        {letters}
      </span>
    </div>
  );
}
