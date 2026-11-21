import Link from "next/link";
import { Header } from "@/components/Header";
import { SellerLine } from "@/components/SellerLine";
import { getCart } from "@/lib/db/cart";
import { currentUserId } from "@/lib/db/session";
import { euros } from "@/lib/rules/checkoutTotal";
import { cartTotal } from "@/lib/rules/cartTotal";
import { canGoToCheckout, unavailableMessage, unavailableTag } from "@/lib/rules/cartAccess";
import { CartCountSync } from "@/components/CartCountSync";
import { CartSummary } from "./CartSummary";
import { RemoveButton } from "./RemoveButton";
import { SignInRequired } from "@/components/SignInRequired";

// The cart (story 20 · use cases 2 and 3; design part 3, option A): the records as rows with "Remove", then the
// sand summary card and "Go to checkout". On desktop the summary sits beside the list. Needs an account.
// A record that can no longer be bought stays, greyed, until removed; "Go to checkout" waits for that (story 35, option A).
// Each record's name and cover open its listing (bug 35).
export default async function CartPage() {
  const userId = await currentUserId();
  if (!userId) return <SignInRequired path="/cart" />; // story 29, bug 32
  const items = await getCart(userId);
  const available = items.filter((i) => i.available);
  const amounts = cartTotal(available.map((i) => i.price));
  const canPay = canGoToCheckout(items);

  return (
    <main className="px-4 pb-16 page-main">
      <Header />
      <h1 className="mt-6 font-heading text-4xl leading-tight lg:text-6xl">Your cart</h1>

      <CartCountSync available={available.length} />
      {items
        .filter((i) => !i.available)
        .map((i) => (
          <p key={i.listingId} role="status" className="mt-4 rounded-2xl border border-light-amber/60 bg-light-amber/10 p-4 text-sm">
            {unavailableMessage(i.title, i.status)}
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
            {items.map((item) => {
              const href = `/listings/${item.listingId}?version=${item.versionId}`;
              const cover = item.cover ? (
                <img src={item.cover} alt="" className="h-14 w-14 shrink-0 rounded-lg border border-line object-cover" />
              ) : (
                <span aria-hidden className="h-14 w-14 shrink-0 rounded-lg border border-line bg-white/60" />
              );
              return (
                <li
                  key={item.listingId}
                  aria-label={item.available ? undefined : `${item.title}, ${unavailableTag(item.status)}`}
                  className="flex items-start gap-3 border-b border-line py-4"
                >
                  {item.available ? (
                    <Link href={href} tabIndex={-1} aria-hidden>
                      {cover}
                    </Link>
                  ) : (
                    <span className="opacity-50 grayscale">{cover}</span>
                  )}
                  <div className={`min-w-0 flex-1 text-sm ${item.available ? "" : "text-navy/50"}`}>
                    <p className="font-semibold">
                      {item.available ? (
                        <Link href={href} className="underline-offset-4 hover:underline">
                          {item.title}
                        </Link>
                      ) : (
                        item.title
                      )}
                      {!item.available && (
                        <span className="ml-2 inline-block rounded-full border border-navy/40 px-2 py-0.5 text-xs font-semibold">
                          {unavailableTag(item.status)}
                        </span>
                      )}
                    </p>
                    <p className={item.available ? "text-navy/70" : ""}>
                      {item.condition.code} · <SellerLine seller={item.seller} city={item.city} />
                    </p>
                    <RemoveButton listingId={item.listingId} title={item.title} />
                  </div>
                  <p className={`text-lg font-bold ${item.available ? "" : "text-navy/50 line-through"}`}>{euros(item.price)}</p>
                </li>
              );
            })}
          </ul>

          <CartSummary amounts={amounts}>
            {canPay ? (
              <Link
                href="/cart/checkout"
                className="mt-2 flex min-h-14 items-center justify-center rounded-full bg-navy px-6 text-lg font-semibold text-cream"
              >
                Go to checkout
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  disabled
                  aria-describedby="cart-blocked"
                  className="mt-2 flex min-h-14 w-full items-center justify-center rounded-full bg-navy/15 px-6 text-lg font-semibold text-navy/50"
                >
                  Go to checkout
                </button>
                <p id="cart-blocked" className="mt-2 text-center text-sm text-navy/70">
                  Remove the sold record to continue.
                </p>
              </>
            )}
            <p className="mt-2 text-center text-sm text-navy/70">Simulated payment · Illustrative data</p>
          </CartSummary>
        </div>
      )}
    </main>
  );
}
