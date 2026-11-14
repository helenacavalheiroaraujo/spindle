import { redirect } from "next/navigation";
import { CheckoutForm } from "@/app/checkout/[listingId]/CheckoutForm";
import { Header } from "@/components/Header";
import { SellerLine } from "@/components/SellerLine";
import { getCart } from "@/lib/db/cart";
import { getLastShippingAddress } from "@/lib/db/orders";
import { getSavedAddresses } from "@/lib/db/addresses";
import { startingAddress } from "@/lib/rules/shippingAddress";
import { getProfileName } from "@/lib/db/profiles";
import { currentUserId } from "@/lib/db/session";
import { cartSummaryRows, cartTotal } from "@/lib/rules/cartTotal";
import { payCart } from "./actions";
import { SignInRequired } from "@/components/SignInRequired";

// Checkout of the cart (story 20 · use case 4): story 7's checkout, extended. The address is typed once; Pay creates
// one order for each record. If a record left the cart meanwhile, the cart screen says so first (Edge cases).
export default async function CartCheckoutPage() {
  const userId = await currentUserId();
  if (!userId) return <SignInRequired path="/cart/checkout" />; // story 29
  const { items, messages } = await getCart(userId, false);
  if (items.length === 0 || messages.length > 0) redirect("/cart");

  const [saved, last, accountName] = await Promise.all([
    getSavedAddresses(userId),
    getLastShippingAddress(userId),
    getProfileName(userId).catch(() => null),
  ]);
  // Saved address first (bug 9), then the last order (bug 6), then the name given at sign-up (bug 27).
  const initialAddress = startingAddress(saved.delivery, last, accountName);
  const amounts = cartTotal(items.map((i) => i.price));

  const records = (
    <section aria-label="The records" className="flex flex-col gap-3">
      {items.map((item) => (
        <div key={item.listingId} className="flex items-center gap-3">
          {item.cover ? (
            <img src={item.cover} alt="" className="h-12 w-12 shrink-0 rounded-lg border border-line object-cover" />
          ) : (
            <span aria-hidden className="h-12 w-12 shrink-0 rounded-lg border border-line bg-white/60" />
          )}
          <p className="text-sm">
            <span className="block font-semibold">{item.title}</span>
            <span className="text-navy/70">
              {item.condition.name} ({item.condition.code}). <SellerLine seller={item.seller} city={item.city} />
            </span>
          </p>
        </div>
      ))}
    </section>
  );

  return (
    <main className="px-4 pb-16 page-main">
      <Header />
      <h1 className="mt-4 font-heading text-4xl leading-tight lg:text-6xl">Buy with protection</h1>

      <CheckoutForm
        pay={payCart}
        soldHref="/cart"
        record={records}
        rows={cartSummaryRows(amounts)}
        total={amounts.total}
        initialAddress={initialAddress}
        login={{ purpose: "cartView" }}
      />
    </main>
  );
}
