import { notFound } from "next/navigation";
import { getOrdersForBuyerByIds } from "@/lib/db/orders";
import { currentUserId } from "@/lib/db/session";
import { euros } from "@/lib/rules/checkoutTotal";
import { orderPlacedPath, paidSummary, parseOrderIds } from "@/lib/rules/orderPlaced";
import { Header } from "@/components/Header";
import { SellerLine } from "@/components/SellerLine";
import { OrderPlacedActions } from "@/components/OrderPlacedActions";
import { OrderProgress } from "@/components/OrderProgress";
import { SignInRequired } from "@/components/SignInRequired";

// "Order placed" after Pay in the cart (story 30 · option B): a summary with the two next steps, then one card per
// record with its price paid and its progress bar. Only the buyer of every order can open it (as story 7).
export default async function OrdersPlacedPage({ searchParams }: { searchParams: Promise<{ ids?: string | string[] }> }) {
  const ids = parseOrderIds((await searchParams).ids);
  const userId = await currentUserId();
  if (!userId) return <SignInRequired path="/orders/placed" />; // story 29
  const orders = await getOrdersForBuyerByIds(ids, userId);
  if (!orders) notFound();
  const summary = paidSummary(orders.map((o) => o.total));

  return (
    <main className="px-4 pb-16 page-main">
      <Header />
      <section
        aria-label="Order"
        className="mt-4 rounded-3xl border border-line bg-sand p-5 text-navy lg:flex lg:items-center lg:justify-between lg:gap-6 lg:px-7 lg:py-6"
      >
        <div className="flex items-start gap-4">
          <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-lg text-cream">
            ✓
          </span>
          <div>
            <h1 className="font-heading text-4xl leading-none lg:text-5xl">Order placed</h1>
            <p className="mt-2 text-lg lg:text-xl">
              {summary}
              <span className="hidden lg:inline"> · each seller ships their own</span>
            </p>
            <p className="text-sm text-navy/70 lg:hidden">Each seller ships their own.</p>
          </div>
        </div>
        <div className="hidden shrink-0 lg:block">
          <OrderPlacedActions />
        </div>
      </section>

      <ul aria-label="Records bought" className="mt-3 grid gap-3 lg:grid-cols-2 lg:gap-4">
        {orders.map((order) => (
          <li
            key={order.id}
            aria-label={`${order.albumTitle}, ${order.versionName}`}
            className="rounded-2xl border border-line bg-white/60 p-4"
          >
            <div className="flex items-center gap-3">
              {order.cover ? (
                <img src={order.cover} alt="" className="h-12 w-12 shrink-0 rounded-lg border border-line object-cover" />
              ) : (
                <span aria-hidden className="h-12 w-12 shrink-0 rounded-lg border border-line bg-white/60" />
              )}
              <p className="flex-1 text-sm">
                <span className="block font-semibold">
                  {order.albumTitle}, {order.versionName}
                </span>
                <span className="text-navy/70">
                  {order.condition.name} ({order.condition.code}) · <SellerLine seller={order.seller} city={order.city} />
                </span>
              </p>
              <span className="font-bold">{euros(order.total)}</span>
            </div>
            <OrderProgress status={order.status} />
          </li>
        ))}
      </ul>

      <div className="mt-4 lg:hidden">
        <OrderPlacedActions />
      </div>
      <p className="mt-4 text-center text-sm text-navy/70">Simulated payment · Illustrative data</p>
    </main>
  );
}
