import { notFound, redirect } from "next/navigation";
import { getListingCheck } from "@/lib/db/listings";
import { currentUserId } from "@/lib/db/session";
import { getLastShippingAddress } from "@/lib/db/orders";
import { getSavedAddresses } from "@/lib/db/addresses";
import { startingAddress } from "@/lib/rules/shippingAddress";
import { currentProfileId, getProfileName } from "@/lib/db/profiles";
import { canCheckout, checkoutPath, isNoLongerAvailable, isOwnListing, ownListingPath } from "@/lib/rules/checkoutAccess";
import { ListingUnavailable } from "@/components/ListingUnavailable";
import { loginRecord } from "@/lib/rules/loginWindow";
import { SignInRequired } from "@/components/SignInRequired";
import { Header } from "@/components/Header";
import { SellerLine } from "@/components/SellerLine";
import { checkoutTotal } from "@/lib/rules/checkoutTotal";
import { CheckoutForm } from "./CheckoutForm";
import { pay } from "./actions";

const one = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v);

// Checkout, "Buy with protection" (story 7). Reached from Buy on a green or yellow listing; the version
// in the address is the one the buyer came from. Signed out → only the header and the log-in window, then back here (story 7 · Edge cases, story 29).
export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ listingId: string }>;
  searchParams: Promise<{ version?: string | string[] }>;
}) {
  const { listingId } = await params;
  const l = await getListingCheck(listingId);
  if (!l) notFound();
  if (isNoLongerAvailable(l.status)) return <ListingUnavailable />; // sold or removed (finding #61)
  const versionId = one((await searchParams).version) ?? l.claimedVersionId;

  const versionName = versionId === l.actualVersionId ? l.actualVersionName : l.claimedVersionName;
  // The record in the log-in window (design B): signed out, and if the session ends before Pay (story 29).
  const loginSummary = loginRecord({
    albumTitle: l.albumTitle,
    versionName,
    conditionCode: l.condition.code,
    seller: l.seller,
    city: l.city,
    price: l.price,
    cover: l.photos.cover,
  });

  const userId = await currentUserId();
  if (!userId) return <SignInRequired path={checkoutPath(listingId, versionId)} record={loginSummary} />; // story 29
  // The seller's own listing (finding #12, bug 12): back to the listing's page with a notice, never "not found".
  const profileId = await currentProfileId();
  if (isOwnListing(l.sellerId, profileId)) redirect(ownListingPath(listingId, versionId));
  // Red, sold or removed: never reaches the checkout.
  if (!canCheckout(l, versionId, profileId)) notFound();

  const [saved, last, accountName] = await Promise.all([
    getSavedAddresses(userId),
    getLastShippingAddress(userId),
    getProfileName(userId).catch(() => null),
  ]);
  // Saved address first (bug 9), then the last order (bug 6), then the name given at sign-up (bug 27).
  const initialAddress = startingAddress(saved.delivery, last, accountName);

  const amounts = checkoutTotal(l.price);

  const record = (
    <section aria-label="The record" className="flex items-center gap-3">
      {l.photos.cover ? (
        <img src={l.photos.cover} alt="" className="h-12 w-12 shrink-0 rounded-lg border border-line object-cover" />
      ) : (
        <span aria-hidden className="h-12 w-12 shrink-0 rounded-lg border border-line bg-white/60" />
      )}
      <p className="text-sm">
        <span className="block font-semibold">
          {l.albumTitle}, {versionName}
        </span>
        <span className="text-navy/70">
          {l.condition.name} ({l.condition.code}). <SellerLine seller={l.seller} city={l.city} />
        </span>
      </p>
    </section>
  );

  return (
    <main className="px-4 pb-16 page-main">
      <Header />
      <h1 className="mt-4 font-heading text-4xl leading-tight lg:text-6xl">Buy with protection</h1>

      <CheckoutForm
        pay={pay.bind(null, listingId, versionId)}
        soldHref={`/versions/${versionId}/listings`}
        record={record}
        rows={[
          ["Record", amounts.recordPrice],
          ["Insured shipping", amounts.shipping],
          ["Buyer protection", amounts.protectionFee],
        ]}
        total={amounts.total}
        initialAddress={initialAddress}
        login={{ purpose: "buy", record: loginSummary }}
      />
    </main>
  );
}
