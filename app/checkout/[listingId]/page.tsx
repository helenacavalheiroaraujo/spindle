import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getListingCheck } from "@/lib/db/listings";
import { currentUserId } from "@/lib/db/session";
import { getLastShippingAddress } from "@/lib/db/orders";
import { currentProfileId } from "@/lib/db/profiles";
import { canCheckout, checkoutPath, isNoLongerAvailable } from "@/lib/rules/checkoutAccess";
import { ListingUnavailable } from "@/components/ListingUnavailable";
import { withReturn } from "@/lib/rules/login";
import { Header } from "@/components/Header";
import { SellerLine } from "@/components/SellerLine";
import { checkoutTotal } from "@/lib/rules/checkoutTotal";
import { CheckoutForm } from "./CheckoutForm";

const one = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v);

// Checkout, "Buy with protection" (story 7). Reached from Buy on a green or yellow listing; the version
// in the address is the one the buyer came from. Signed out → log in first, then back here (story 7 · Edge cases).
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

  const userId = await currentUserId();
  if (!userId) redirect(withReturn("/login", checkoutPath(listingId, versionId)));
  // Red, sold or removed, or the seller's own listing (finding #12): never reaches the checkout.
  if (!canCheckout(l, versionId, await currentProfileId())) notFound();

  const initialAddress = await getLastShippingAddress(userId);

  const versionName = versionId === l.actualVersionId ? l.actualVersionName : l.claimedVersionName;

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
      <Link
        href={`/listings/${listingId}?version=${versionId}`}
        aria-label="Back to the listing"
        className="flex h-12 w-12 items-center justify-center rounded-full border border-navy/30"
      >
        <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </Link>
      <h1 className="mt-4 font-heading text-4xl leading-tight lg:text-6xl">Buy with protection</h1>

      <CheckoutForm listingId={listingId} versionId={versionId} record={record} amounts={checkoutTotal(l.price)} initialAddress={initialAddress} />
    </main>
  );
}
