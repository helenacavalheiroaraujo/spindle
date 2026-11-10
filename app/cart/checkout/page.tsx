import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/app/checkout/[listingId]/CheckoutForm";
import { Header } from "@/components/Header";
import { SellerLine } from "@/components/SellerLine";
import { getCart } from "@/lib/db/cart";
import { getLastShippingAddress } from "@/lib/db/orders";
import { currentUserId } from "@/lib/db/session";
import { withReturn } from "@/lib/rules/login";
import { cartSummaryRows, cartTotal } from "@/lib/rules/cartTotal";
import { payCart } from "./actions";

// Checkout of the cart (story 20 · use case 4): story 7's checkout, extended. The address is typed once; Pay creates
// one order for each record. If a record left the cart meanwhile, the cart screen says so first (Edge cases).
export default async function CartCheckoutPage() {
  const userId = await currentUserId();
  if (!userId) redirect(withReturn("/login", "/cart/checkout"));
  const { items, messages } = await getCart(userId, false);
  if (items.length === 0 || messages.length > 0) redirect("/cart");

  const initialAddress = await getLastShippingAddress(userId);
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
      <Link
        href="/cart"
        aria-label="Back to your cart"
        className="flex h-12 w-12 items-center justify-center rounded-full border border-navy/30"
      >
        <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </Link>
      <h1 className="mt-4 font-heading text-4xl leading-tight lg:text-6xl">Buy with protection</h1>

      <CheckoutForm
        pay={payCart}
        soldHref="/cart"
        record={records}
        rows={cartSummaryRows(amounts)}
        total={amounts.total}
        initialAddress={initialAddress}
      />
    </main>
  );
}
