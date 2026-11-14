import Link from "next/link";
import { getMyListings } from "@/lib/db/listings";
import { getSellerProfile } from "@/lib/db/profiles";
import { messagesForSoldListings } from "@/lib/db/messages";
import { currentUser } from "@/lib/db/session";
import { myListingTabs } from "@/lib/rules/myListings";
import { MyListings } from "@/app/my-listings/MyListings";

// Your account, For sale tab (story 31): the My listings content of story 8 ("On sale" and "Sold", edit, remove)
// and "Sell a record". /my-listings opens this tab. No listings: "Nothing for sale yet" (story 31 · Edge cases).
export default async function ForSaleTab() {
  const user = await currentUser();
  if (!user) return null; // signed out: the layout shows the log-in window (story 29)
  const profile = await getSellerProfile(user.id, user.name);
  if (!profile) throw new Error("No profile for the signed-in user.");
  const tabs = myListingTabs(await getMyListings(profile.id));
  const messages = await messagesForSoldListings(tabs.sold.map((l) => l.id)); // what buyers wrote (bug 8)
  const none = tabs.onSale.length === 0 && tabs.sold.length === 0;

  return (
    <div className="mt-2">
      {none ? (
        <p className="mt-4 rounded-2xl border border-line bg-white/60 p-5">Nothing for sale yet</p>
      ) : (
        <MyListings onSale={tabs.onSale} sold={tabs.sold} messages={messages} />
      )}
      <Link href="/sell" className="mt-5 inline-flex min-h-12 items-center rounded-full bg-navy px-6 font-semibold text-cream">
        Sell a record
      </Link>
    </div>
  );
}
