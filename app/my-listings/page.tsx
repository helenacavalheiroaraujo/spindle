import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { getMyListings } from "@/lib/db/listings";
import { getSellerProfile } from "@/lib/db/profiles";
import { currentUser } from "@/lib/db/session";
import { withReturn } from "@/lib/rules/login";
import { myListingTabs } from "@/lib/rules/myListings";
import { MyListings } from "./MyListings";

// My listings (story 8 · use case 3; finding #74, option B): tabs "On sale" and "Sold", reached from Your account.
export default async function MyListingsPage() {
  const user = await currentUser();
  if (!user) redirect(withReturn("/login", "/my-listings"));
  const profile = await getSellerProfile(user.id, user.name);
  if (!profile) throw new Error("No profile for the signed-in user.");
  const tabs = myListingTabs(await getMyListings(profile.id));

  return (
    <main className="mx-auto max-w-5xl px-4 pb-24">
      <Header />
      <h1 className="mt-4 font-heading text-4xl leading-tight lg:text-6xl">My listings</h1>
      <MyListings onSale={tabs.onSale} sold={tabs.sold} />
    </main>
  );
}
