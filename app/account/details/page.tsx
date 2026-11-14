import { redirect } from "next/navigation";
import { currentUser } from "@/lib/db/session";
import { getSavedAddresses } from "@/lib/db/addresses";
import { getSavedRanking } from "@/lib/db/preferences";
import { withReturn } from "@/lib/rules/login";
import { LogOutButton } from "../LogOutButton";
import { PasswordForm } from "../PasswordForm";
import { AddressesForm } from "../AddressesForm";
import { PrioritiesSection } from "../PrioritiesSection";

// Your account, Account details tab (story 31): buying priorities with "Change" (stories 23, 26; hidden when none is
// saved), change password and saved addresses (bug 9), and Log out at the bottom. Name and email are in the profile
// header (layout.tsx), not here.
export default async function DetailsTab() {
  const user = await currentUser();
  if (!user) redirect(withReturn("/login", "/account/details"));
  const [saved, ranking] = await Promise.all([getSavedAddresses(user.id), getSavedRanking(user.id)]);

  return (
    <div className="lg:max-w-2xl">
      {ranking && ranking.length > 0 && <PrioritiesSection saved={ranking} />}
      <PasswordForm />
      <AddressesForm saved={saved} />
      <LogOutButton />
    </div>
  );
}
