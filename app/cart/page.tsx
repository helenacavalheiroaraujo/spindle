import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { SellerLine } from "@/components/SellerLine";
import { getCart } from "@/lib/db/cart";
import { currentUserId } from "@/lib/db/session";
import { euros } from "@/lib/rules/checkoutTotal";
import { withReturn } from "@/lib/rules/login";
import { cartTotal } from "@/lib/rules/cartTotal";
import { CartSummary } from "./CartSummary";
import { RemoveButton } from "./RemoveButton";

// The cart (story 20 · use cases 2, 3 and 5; design part 3, option A): the records as rows with "Remove", then the
// sand summary card and "Go to checkout". On desktop the summary sits beside the list. Needs an account.
export default async function CartPage() {
  const userId = await currentUserId();
  if (!userId) redirect(withReturn("/login", "/cart"));
  const { items, messages } = await getCart(userId);
  const amounts = cartTotal(items.map((i) => i.price));

  return (
    <main className="px-4 pb-16 page-main">
      <Header />
      <h1 className="mt-6 font-heading text-4xl leading-tight lg:text-6xl">Your cart</h1>

      {messages.map((message) => (
        <p key={message} role="status" className="mt-4 rounded-2xl border border-light-amber/60 bg-light-amber/10 p-4 text-sm">
          {message}
        </p>
      ))}

      {items.length === 0 ? (
        <section aria-label="Empty cart" className="mt-6 rounded-3xl border border-line bg-sand p-6 lg:max-w-xl">
          <h2 className="font-heading text-3xl leading-tight">Your cart is empty</h2>
          <Link href="/" className="mt-6 flex min-h-12 items-center justify-center rounded-full bg-navy px-6 font-semibold text-cream">
            Search for an album
          </Link>
        </section>
      ) : (
        <div className="mt-4 flex flex-col gap-6 lg:grid lg:grid-cols-[1fr_400px] lg:items-start lg:gap-12">
          <ul aria-label="Records in your cart">
            {items.map((item) => (
              <li key={item.listingId} className="flex items-start gap-3 border-b border-line py-4">
                {item.cover ? (
                  <img src={item.cover} alt="" className="h-14 w-14 shrink-0 rounded-lg border border-line object-cover" />
                ) : (
                  <span aria-hidden className="h-14 w-14 shrink-0 rounded-lg border border-line bg-white/60" />
                )}
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-navy/70">
                    {item.condition.code} · <SellerLine seller={item.seller} city={item.city} />
                  </p>
                  <RemoveButton listingId={item.listingId} title={item.title} />
                </div>
                <p className="text-lg font-bold">{euros(item.price)}</p>
              </li>
            ))}
          </ul>

          <CartSummary amounts={amounts}>
            <Link
              href="/cart/checkout"
              className="mt-2 flex min-h-14 items-center justify-center rounded-full bg-navy px-6 text-lg font-semibold text-cream"
            >
              Go to checkout
            </Link>
            <p className="mt-2 text-center text-sm text-navy/70">Simulated payment · Illustrative data</p>
          </CartSummary>
        </div>
      )}
    </main>
  );
}
