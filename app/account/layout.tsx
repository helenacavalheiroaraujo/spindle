import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { currentUser } from "@/lib/db/session";
import { getProfileName } from "@/lib/db/profiles";
import { getAccountCounts } from "@/lib/db/account";
import { initials } from "@/lib/rules/initials";
import { withReturn } from "@/lib/rules/login";
import { AccountTabs } from "./AccountTabs";

// Your account (story 31, design option C): a profile header (the large initials avatar, as in the header, name and
// email) and underlined tabs with counts. Each tab is its own page under this layout, with its own loading mask and
// error screen, so the header and the tabs stay while a tab loads. Private; not the public profile (out of scope).
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect(withReturn("/login", "/account"));
  const [profileName, counts] = await Promise.all([
    getProfileName(user.id).catch(() => null),
    getAccountCounts(user.id).catch(() => null), // the tabs show no number; each tab still loads (or fails) by itself
  ]);
  const name = profileName || user.name;
  const letters = initials(name);

  return (
    <main className="px-4 pb-24 page-main">
      <Header />
      <div className="mt-4 flex items-center gap-3 lg:mt-7 lg:gap-[18px]">
        <span
          aria-hidden
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-navy text-xl font-[600] text-cream lg:h-20 lg:w-20 lg:text-[28px]"
        >
          {letters || "Me"}
        </span>
        <div className="min-w-0">
          {/* "Your account" is read by screen readers; the name is what shows (option C). */}
          <h1 className="font-heading text-3xl leading-tight lg:text-5xl">
            {name ? (
              <>
                <span className="sr-only">Your account: </span>
                {name}
              </>
            ) : (
              "Your account"
            )}
          </h1>
          <p className="break-all text-sm text-navy/70 lg:text-base">{user.email}</p>
        </div>
      </div>
      <AccountTabs counts={counts} />
      {children}
    </main>
  );
}
